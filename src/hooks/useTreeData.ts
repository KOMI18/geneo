// src/hooks/useTreeData.ts
import { useEffect, useState, useCallback } from 'react';
import { db, storage   } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  getDoc,
  writeBatch,
  
} from 'firebase/firestore';

import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type { TreeMember, TreeEdge } from '@/types/tree';
import { useTreeStore } from '@/store/useTreeStore';
import { usePhoto } from './usePhoto';
export const useTreeData = (treeId: string) => {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const {deletePhoto} = usePhoto();
  // ─── Listeners temps réel ───────────────────────────────────────────────────
  useEffect(() => {
    if (!treeId) return;

    const unsubMembers = onSnapshot(
      query(collection(db, 'trees', treeId, 'members')),
      (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as TreeMember)));
        setLoading(false);
      }
    );

    const unsubEdges = onSnapshot(
      query(collection(db, 'trees', treeId, 'edges')),
      (snap) => {
        setEdges(snap.docs.map(d => ({ id: d.id, ...d.data() } as TreeEdge)));
      }
    );
    const unsubTree = onSnapshot(doc(db, 'trees', treeId), (snap) => {
      const data = snap.data();
      if (data?.collapsedIds) {
        useTreeStore.getState().setCollapsedIds(data.collapsedIds);
      }
    });

    return () => { unsubMembers(); unsubEdges(); unsubTree(); };
  }, [treeId]);

  // ─── Mettre à jour les métadonnées de l'arbre ──────────────────────────────
  const updateTreeMeta = useCallback(async (memberDelta: number) => {
    await updateDoc(doc(db, 'trees', treeId), {
      memberCount: increment(memberDelta),
      updatedAt: Date.now(),
    });
  }, [treeId]);

  // ─── Upload photo ───────────────────────────────────────────────────────────
  const uploadPhoto = useCallback(async (
    memberId: string,
    base64: string
  ): Promise<string> => {
    const photoRef = ref(storage, `trees/${treeId}/members/${memberId}/photo`);
    await uploadString(photoRef, base64, 'data_url');
    return getDownloadURL(photoRef);
  }, [treeId]);

  // ─── Ajouter un membre ──────────────────────────────────────────────────────
  const addMember = useCallback(async (
    memberData: Omit<TreeMember, 'id'>
   
  ): Promise<string> => {
    const docRef = await addDoc(
      collection(db, 'trees', treeId, 'members'),
      { ...memberData,  createdAt: Date.now() }
    );

  

    // +1 membre et timestamp
    await updateTreeMeta(+1);

    return docRef.id;
  }, [treeId, updateTreeMeta]);

  // ─── Ajouter un edge ────────────────────────────────────────────────────────
  const addEdge = useCallback(async (edge: Omit<TreeEdge, 'id'>) => {
    await addDoc(collection(db, 'trees', treeId, 'edges'), edge);
  }, [treeId]);

  // ─── Modifier un membre ─────────────────────────────────────────────────────
const updateMember = useCallback(async (
  memberId: string,
  updates: Partial<TreeMember>,
  newPhotoURL?: string
) => {
  const memberRef = doc(db, 'trees', treeId, 'members', memberId);
  
  // 1. Récupérer l'ancien état pour le nettoyage R2 (lecture utile seulement si la photo change)
  const photoChanges = !!newPhotoURL || updates.photoURL === null;
  const oldPhotoURL = photoChanges
    ? (await getDoc(memberRef)).data()?.photoURL
    : undefined;

  // 2. Gérer le changement de photo
  if (newPhotoURL) {
    // Cas : Nouvelle photo uploadée
    updates.photoURL = newPhotoURL;
    if (oldPhotoURL) await deletePhoto(oldPhotoURL);
  } else if (updates.photoURL === null && oldPhotoURL) {
    // Cas : Photo supprimée (via le bouton X)
    if (oldPhotoURL) await deletePhoto(oldPhotoURL);
  }

  // 3. Mise à jour Firestore
  await updateDoc(memberRef, updates);

  // 4. Update Meta (Timestamp uniquement)
  await updateDoc(doc(db, 'trees', treeId), { 
    updatedAt: Date.now() 
  });

}, [treeId, deletePhoto]);

  // ─── Supprimer un membre + tous ses descendants en cascade ──────────────────
const deleteMember = useCallback(async (memberId: string) => {
  // 1. Trouver tous les descendants récursivement
  const getDescendants = (id: string, visited = new Set<string>()): string[] => {
    if (visited.has(id)) return [];
    visited.add(id);
    const children = edges
      .filter(e => e.source === id && e.type === 'child')
      .map(e => e.target);
    return [id, ...children.flatMap(childId => getDescendants(childId, visited))];
  };

  const allIds = getDescendants(memberId);

  // 2. Supprimer les photos UNIQUEMENT si le membre en a une dans Firestore
  await Promise.all(
    allIds.map(async (id) => {
      const member = members.find(m => m.id === id);
      if (member?.photoURL) {
        try {
          await deletePhoto(member.photoURL);
        } catch {
          // photo déjà supprimée ou inaccessible, on ignore
        }
      }
    })
  );

  // 3. Supprimer tous les membres
  await Promise.all(
    allIds.map(id => deleteDoc(doc(db, 'trees', treeId, 'members', id)))
  );

  // 4. Supprimer tous les edges liés
  const linkedEdges = edges.filter(
    e => allIds.includes(e.source) || allIds.includes(e.target)
  );

  await Promise.all(
    linkedEdges.map(e => deleteDoc(doc(db, 'trees', treeId, 'edges', e.id)))
  );

  // 5. Mettre à jour memberCount
  await updateTreeMeta(-allIds.length);

}, [treeId, edges, members, updateTreeMeta , deletePhoto]);

// ─── Enregistrer des positions après un déplacement : un seul aller-retour ───
const saveMemberPositions = useCallback(async (
  positions: Record<string, { x: number; y: number }>
) => {
  const ids = Object.keys(positions);
  if (ids.length === 0) return;

  const CHUNK = 400; // limite Firestore : 500 écritures par lot
  for (let i = 0; i < ids.length; i += CHUNK) {
    const batch = writeBatch(db);
    ids.slice(i, i + CHUNK).forEach((id) => {
      batch.update(doc(db, 'trees', treeId, 'members', id), { position: positions[id] });
    });
    if (i === 0) batch.update(doc(db, 'trees', treeId), { updatedAt: Date.now() });
    await batch.commit();
  }
}, [treeId]);

const saveCollapsedIds = useCallback(async (memberId: string) => {
  // On récupère l'état actuel depuis le store pour avoir la version à jour
  const { collapsedIds } = useTreeStore.getState();
  await updateDoc(doc(db, 'trees', treeId), {
    collapsedIds: Array.from(collapsedIds),
  });
}, [treeId]);

  return {
    members,
    edges,
    loading,
    addMember,
    addEdge,
    updateMember,
    deleteMember,
    saveCollapsedIds,
    saveMemberPositions,
  };
};
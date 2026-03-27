// src/hooks/useTreeData.ts
import { useEffect, useState, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,  // ← nouveau
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type { TreeMember, TreeEdge } from '@/types/tree';

export const useTreeData = (treeId: string) => {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const [loading, setLoading] = useState(true);

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

    return () => { unsubMembers(); unsubEdges(); };
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
    memberData: Omit<TreeMember, 'id'>,
    base64Photo?: string
  ): Promise<string> => {
    const docRef = await addDoc(
      collection(db, 'trees', treeId, 'members'),
      { ...memberData, photoURL: null, createdAt: serverTimestamp() }
    );

    if (base64Photo) {
      const url = await uploadPhoto(docRef.id, base64Photo);
      await updateDoc(docRef, { photoURL: url });
    }

    // +1 membre et timestamp
    await updateTreeMeta(+1);

    return docRef.id;
  }, [treeId, uploadPhoto, updateTreeMeta]);

  // ─── Ajouter un edge ────────────────────────────────────────────────────────
  const addEdge = useCallback(async (edge: Omit<TreeEdge, 'id'>) => {
    await addDoc(collection(db, 'trees', treeId, 'edges'), edge);
  }, [treeId]);

  // ─── Modifier un membre ─────────────────────────────────────────────────────
  const updateMember = useCallback(async (
    memberId: string,
    updates: Partial<TreeMember>,
    newBase64Photo?: string
  ) => {
    const memberRef = doc(db, 'trees', treeId, 'members', memberId);

    if (newBase64Photo) {
      const url = await uploadPhoto(memberId, newBase64Photo);
      updates.photoURL = url;
    }

    await updateDoc(memberRef, updates);

    // On met à jour updatedAt sans toucher au memberCount
    await updateDoc(doc(db, 'trees', treeId), { updatedAt: Date.now() });
  }, [treeId, uploadPhoto]);

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
          await deleteObject(ref(storage, `trees/${treeId}/members/${id}/photo`));
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

}, [treeId, edges, members, updateTreeMeta]);

  return {
    members,
    edges,
    loading,
    addMember,
    addEdge,
    updateMember,
    deleteMember,
  };
};
'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy  , doc, updateDoc, deleteDoc, getDocs, writeBatch} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { FamilyTree } from '@/types/tree';
import { usePhoto } from '@/hooks/usePhoto';
export function useDashboard() {
  const { user } = useAuth();
  const { deletePhoto } = usePhoto();
  const [ownTrees, setOwnTrees] = useState<FamilyTree[]>([]);
  const [sharedEditorTrees, setSharedEditorTrees] = useState<FamilyTree[]>([]);
  const [sharedViewerTrees, setSharedViewerTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
    const updateTreeName = async (treeId: string, newName: string) => {
    const treeRef = doc(db, 'trees', treeId);
    await updateDoc(treeRef, { 
      name: newName,
      updatedAt: Date.now() 
    });
  };
  const deleteTree = async (treeId: string) => {
    const batch = writeBatch(db);
    
    // 1. Récupérer tous les membres pour supprimer leurs photos sur R2
    const membersRef = collection(db, 'trees', treeId, 'members');
    const membersSnap = await getDocs(membersRef);
    
    const photoDeletionPromises = membersSnap.docs.map(async (memberDoc) => {
      const data = memberDoc.data();
      if (data.photoURL) {
        await deletePhoto(data.photoURL);
      }
      // Ajouter la suppression du membre au batch Firestore
      batch.delete(memberDoc.ref);
    });

    // Attendre que toutes les photos soient supprimées de R2
    await Promise.all(photoDeletionPromises);

    // 2. Supprimer tous les Edges (liaisons)
    const edgesRef = collection(db, 'trees', treeId, 'edges');
    const edgesSnap = await getDocs(edgesRef);
    edgesSnap.docs.forEach((edgeDoc) => {
      batch.delete(edgeDoc.ref);
    });

    // 3. Supprimer le document de l'arbre lui-même
    batch.delete(doc(db, 'trees', treeId));

    // 4. Exécuter toutes les suppressions Firestore d'un coup
    await batch.commit();
  };
useEffect(() => {
  if (!user?.email) return;

  // Query ownTrees
  const qOwn = query(
    collection(db, 'trees'),
    where('ownerId', '==', user.uid),
    orderBy('updatedAt', 'desc')
  );

  const unsubOwn = onSnapshot(qOwn, (snap) => {
    setOwnTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyTree)));
    setLoading(false);
  }, (err) => {
    console.error('ownTrees error:', err.code, err.message);
    setLoading(false);
  });

      const qShared = query(
        collection(db, 'trees'),
        where('editorEmails', 'array-contains', user.email)
      );
      const qSharedViewer = query(
        collection(db, 'trees'),
        where('viewerEmails', 'array-contains', user.email)
      );
        const unsubSharedEditor = onSnapshot(qShared, (snap) => {
          setSharedEditorTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyTree)));
        }, (err) => console.error('sharedEditor error:', err));

        const unsubSharedViewer = onSnapshot(qSharedViewer, (snap) => {
          setSharedViewerTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyTree)));
        }, (err) => console.error('sharedViewer error:', err));      
        
  return () => { unsubOwn(); unsubSharedViewer(); unsubSharedEditor(); };
}, [user]);

  const totalMembers = ownTrees.reduce((acc, t) => acc + (t.memberCount || 0), 0);
  const sharedTrees = [...sharedEditorTrees, ...sharedViewerTrees];
  
  return {
    trees: ownTrees,      
    ownTrees,
    sharedTrees,
    loading,
    totalMembers,
    updateTreeName, 
    deleteTree
  };
}
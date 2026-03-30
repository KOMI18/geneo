'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { FamilyTree } from '@/types/tree';

export function useDashboard() {
  const { user } = useAuth();
  const [ownTrees, setOwnTrees] = useState<FamilyTree[]>([]);
  const [sharedEditorTrees, setSharedEditorTrees] = useState<FamilyTree[]>([]);
  const [sharedViewerTrees, setSharedViewerTrees] = useState<FamilyTree[]>([]);

  const [loading, setLoading] = useState(true);

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
  // On expose ownTrees et sharedTrees séparément pour le dashboard
  // mais aussi trees (= ownTrees) pour ne pas casser le reste du code
  return {
    trees: ownTrees,      
    ownTrees,
    sharedTrees,
    loading,
    totalMembers,
  };
}
'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { FamilyTree } from '@/types/tree';

export function useDashboard() {
  const { user } = useAuth();
  const [ownTrees, setOwnTrees] = useState<FamilyTree[]>([]);
  const [sharedTrees, setSharedTrees] = useState<FamilyTree[]>([]);
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

  // Query sharedTrees — avec gestion d'erreur séparée
  const qShared = query(
    collection(db, 'trees'),
    where('collaborators', 'array-contains-any', [
      { email: user.email, role: 'editor' },
      { email: user.email, role: 'viewer' },
    ])
  );

  const unsubShared = onSnapshot(qShared, (snap) => {
    setSharedTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyTree)));
  }, (err) => {
    // Log séparé pour identifier laquelle des deux queries échoue
    console.error('sharedTrees error:', err.code, err.message);
  });

  return () => { unsubOwn(); unsubShared(); };
}, [user]);

  const totalMembers = ownTrees.reduce((acc, t) => acc + (t.memberCount || 0), 0);

  // On expose ownTrees et sharedTrees séparément pour le dashboard
  // mais aussi trees (= ownTrees) pour ne pas casser le reste du code
  return {
    trees: ownTrees,      // ← rétrocompatibilité
    ownTrees,
    sharedTrees,
    loading,
    totalMembers,
  };
}
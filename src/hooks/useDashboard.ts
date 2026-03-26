'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface TreeSummary {
  id: string;
  name: string;
  memberCount: number;
  updatedAt: number;
}

export function useDashboard() {
  const { user } = useAuth();
  const [trees, setTrees] = useState<TreeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'trees'),
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as TreeSummary)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const totalMembers = trees.reduce((acc, t) => acc + (t.memberCount || 0), 0);

  return { trees, loading, totalMembers };
}
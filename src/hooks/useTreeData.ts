import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export const useTreeData = (treeId: string) => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!treeId) return;

    // Récupération des membres (nodes) en temps réel
    const q = query(collection(db, "trees", treeId, "nodes"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNodes(nodesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [treeId]);

  return { nodes, loading };
};
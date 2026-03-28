'use client';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { FamilyTree, CollaboratorRole } from '@/types/tree';

export function useTreeRole(tree: FamilyTree | null) {
  const { user } = useAuth();

  return useMemo((): 'owner' | CollaboratorRole | null => {
    if (!user || !tree) return null;
    if (tree.ownerId === user.uid) return 'owner';
    if (!user.email) return null;
    return tree.collaborators?.[user.email] ?? null;
  }, [user, tree]);
}
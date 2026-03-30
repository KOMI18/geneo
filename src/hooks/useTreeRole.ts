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

    // collaborators est un tableau d'objets {email, role}
    const collaborator = tree.collaborators?.find(
      c => c.email === user.email
    );
    return collaborator?.role ?? null;
  }, [user, tree]);
}
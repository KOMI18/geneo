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

      const email = user.email.toLowerCase();

      if (tree.editorEmails?.includes(email)) return 'editor';
      if (tree.viewerEmails?.includes(email)) return 'viewer';

      // Fallback sur collaborators si editorEmails pas encore migré
      const collaborator = tree.collaborators?.find(c => c.email === email);
      return collaborator?.role ?? null;
    }, [user, tree]);
}
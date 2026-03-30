// src/types/tree.ts

export type Gender = 'M' | 'F';
export type CollaboratorRole = 'editor' | 'viewer';
export interface TreeMember {
  id: string;
  label: string;
  gender: Gender;
  photoURL?: string | null;
  createdAt?: number;
}


export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type?: 'child' | 'spouse';
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Collaborator {
  email: string;
  role: CollaboratorRole;
}

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
  memberCount: number;
  updatedAt: number;
  editorEmails?: string[];
  viewerEmails?: string[];
  shareLink?: string;
  // Collaborators pour rétrocompatibilité affichage
  collaborators?: Collaborator[];
}
// src/types/tree.ts

export type Gender = 'M' | 'F';

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

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
}
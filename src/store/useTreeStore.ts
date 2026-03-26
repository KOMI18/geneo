// src/store/useTreeStore.ts
import { create } from 'zustand';
import type { TreeMember, TreeEdge } from '@/types/tree';

interface TreeStore {
  // ─── État canvas ───────────────────────────────────────────
  members: TreeMember[];
  edges: TreeEdge[];
  setMembers: (members: TreeMember[]) => void;
  setEdges: (edges: TreeEdge[]) => void;

  // ─── État modal ────────────────────────────────────────────
  isModalOpen: boolean;
  parentIdForNewChild: string | null;
  isSpouseMode: boolean;
  openModal: (parentId: string, spouseMode?: boolean) => void;
  closeModal: () => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  // ─── Canvas ────────────────────────────────────────────────
  members: [],
  edges: [],
  setMembers: (members) => set({ members }),
  setEdges:   (edges)   => set({ edges }),

  // ─── Modal ─────────────────────────────────────────────────
  isModalOpen: false,
  parentIdForNewChild: null,
  isSpouseMode: false,
  openModal: (parentId, spouseMode = false) =>
    set({ isModalOpen: true, parentIdForNewChild: parentId, isSpouseMode: spouseMode }),
  closeModal: () =>
    set({ isModalOpen: false, parentIdForNewChild: null, isSpouseMode: false }),
}));
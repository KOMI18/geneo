import { create } from 'zustand';
import type { TreeMember, TreeEdge } from '@/types/tree';

interface TreeStore {
  members: TreeMember[];
  edges: TreeEdge[];
  setMembers: (members: TreeMember[]) => void;
  setEdges: (edges: TreeEdge[]) => void;

  // Modal ajout
  isModalOpen: boolean;
  parentIdForNewChild: string | null;
  isSpouseMode: boolean;
  openModal: (parentId: string, spouseMode?: boolean) => void;
  closeModal: () => void;

  // Modal édition
  editingMember: TreeMember | null;
  openEditModal: (member: TreeMember) => void;
  closeEditModal: () => void;

  // Modal suppression
  deletingMemberId: string | null;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  //collapse
  collapsedIds: Set<string>;
toggleCollapse: (id: string) => void;
setCollapsedIds: (ids: string[]) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  members: [],
  edges: [],
  setMembers: (members) => set({ members }),
  setEdges: (edges) => set({ edges }),

  // Ajout
  isModalOpen: false,
  parentIdForNewChild: null,
  isSpouseMode: false,
  openModal: (parentId, spouseMode = false) =>
    set({ isModalOpen: true, parentIdForNewChild: parentId, isSpouseMode: spouseMode }),
  closeModal: () =>
    set({ isModalOpen: false, parentIdForNewChild: null, isSpouseMode: false }),

  // Édition
  editingMember: null,
  openEditModal: (member) => set({ editingMember: member }),
  closeEditModal: () => set({ editingMember: null }),

  // Suppression
  deletingMemberId: null,
  openDeleteModal: (id) => set({ deletingMemberId: id }),
  closeDeleteModal: () => set({ deletingMemberId: null }),
  //collapse
  collapsedIds: new Set<string>(),
  toggleCollapse: (id) => set((state) => {
    const next = new Set(state.collapsedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    return { collapsedIds: next };
  }),
  setCollapsedIds: (ids) => set({ collapsedIds: new Set(ids) }),
}));
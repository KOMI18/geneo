import { create } from 'zustand';

interface TreeStore {
  isModalOpen: boolean;
  parentIdForNewChild: string | null;
  openModal: (parentId: string) => void;
  closeModal: () => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  isModalOpen: false,
  parentIdForNewChild: null,
  openModal: (parentId) => set({ isModalOpen: true, parentIdForNewChild: parentId }),
  closeModal: () => set({ isModalOpen: false, parentIdForNewChild: null }),
}));
import { create } from 'zustand';
import type { TreeMember, TreeEdge } from '@/types/tree';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TreeStore {
  // Données de l'arbre
  members: TreeMember[];
  edges: TreeEdge[];
  treeId: string | null; // Utile pour les requêtes Firestore directes
  setTreeId: (id: string) => void;
  setMembers: (members: TreeMember[]) => void;
  setEdges: (edges: TreeEdge[]) => void;

  // Modal ajout (Enfant / Épouse)
  isModalOpen: boolean;
  parentIdForNewChild: string | null;
  isSpouseMode: boolean;
  openModal: (parentId: string, spouseMode?: boolean) => void;
  closeModal: () => void;

  // Modal édition (Informations de base)
  editingMember: TreeMember | null;
  openEditModal: (member: TreeMember) => void;
  closeEditModal: () => void;

  // Modal suppression
  deletingMemberId: string | null;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;

  // Gestion du Collapse (Replier/Déplier)
  collapsedIds: Set<string>;
  toggleCollapse: (id: string) => void;
  setCollapsedIds: (ids: string[]) => void;

  // Modal des Notes (Anecdotes/Commentaires)
  isNoteModalOpen: boolean;
  selectedMemberForNote: TreeMember | null;
  openNoteModal: (member: TreeMember) => void;
  closeNoteModal: () => void;
  updateMemberNote: (treeId: string, memberId: string, note: string) => Promise<void>;
}

export const useTreeStore = create<TreeStore>((set, get) => ({
  members: [],
  edges: [],
  treeId: null,
  
  setTreeId: (id) => set({ treeId: id }),
  setMembers: (members) => set({ members }),
  setEdges: (edges) => set({ edges }),

  // Logic Ajout
  isModalOpen: false,
  parentIdForNewChild: null,
  isSpouseMode: false,
  openModal: (parentId, spouseMode = false) =>
    set({ isModalOpen: true, parentIdForNewChild: parentId, isSpouseMode: spouseMode }),
  closeModal: () =>
    set({ isModalOpen: false, parentIdForNewChild: null, isSpouseMode: false }),

  // Logic Édition
  editingMember: null,
  openEditModal: (member) => set({ editingMember: member }),
  closeEditModal: () => set({ editingMember: null }),

  // Logic Suppression
  deletingMemberId: null,
  openDeleteModal: (id) => set({ deletingMemberId: id }),
  closeDeleteModal: () => set({ deletingMemberId: null }),

  // Logic Collapse
  collapsedIds: new Set<string>(),
  toggleCollapse: (id) => set((state) => {
    const next = new Set(state.collapsedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    return { collapsedIds: next };
  }),
  setCollapsedIds: (ids) => set((state) => {
    // Même contenu → même référence : évite de re-rendre tout l'arbre à chaque snapshot
    const unchanged =
      ids.length === state.collapsedIds.size && ids.every((id) => state.collapsedIds.has(id));
    return unchanged ? state : { collapsedIds: new Set(ids) };
  }),

  // Logic Notes
  isNoteModalOpen: false,
  selectedMemberForNote: null,
  
  openNoteModal: (member) => set({ 
    isNoteModalOpen: true, 
    selectedMemberForNote: member 
  }),
  
  closeNoteModal: () => set({ 
    isNoteModalOpen: false, 
    selectedMemberForNote: null 
  }),

  updateMemberNote: async (treeId, memberId, note) => {
    try {
      const memberRef = doc(db, 'trees', treeId, 'members', memberId);
      
      // Mise à jour Firestore
      await updateDoc(memberRef, { 
        note: note,
        updatedAt: Date.now() 
      });

      // Mise à jour locale immédiate pour éviter d'attendre le snapshot
      set((state) => ({
        members: state.members.map((m) => 
          m.id === memberId ? { ...m, note } : m
        ),
        // Si le membre édité est celui actuellement affiché dans le modal
        selectedMemberForNote: state.selectedMemberForNote?.id === memberId 
          ? { ...state.selectedMemberForNote, note } 
          : state.selectedMemberForNote
      }));
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
      throw error; // On remonte l'erreur pour que le Modal puisse l'afficher
    }
  },
}));
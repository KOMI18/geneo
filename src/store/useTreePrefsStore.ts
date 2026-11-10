import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_TREE_BACKGROUND,
  DEFAULT_TREE_BACKGROUND_INTENSITY,
} from '@/lib/treeBackgrounds';

interface TreePrefsStore {
  patternId: string;
  /** Opacité du tissu, de 0.1 (discret) à 1 (vif). */
  intensity: number;
  /** null = pas encore choisi : ouverte sur grand écran, repliée sur téléphone. */
  legendOpen: boolean | null;
  setPattern: (id: string) => void;
  setIntensity: (value: number) => void;
  setLegendOpen: (open: boolean) => void;
}

// Préférences personnelles d'affichage, mémorisées dans le navigateur (localStorage).
export const useTreePrefsStore = create<TreePrefsStore>()(
  persist(
    (set) => ({
      patternId: DEFAULT_TREE_BACKGROUND,
      intensity: DEFAULT_TREE_BACKGROUND_INTENSITY,
      legendOpen: null,
      setPattern: (patternId) => set({ patternId }),
      setIntensity: (intensity) => set({ intensity }),
      setLegendOpen: (legendOpen) => set({ legendOpen }),
    }),
    { name: 'geneo-tree-prefs', version: 2, migrate: (state) => ({ ...(state as object), legendOpen: null }) as TreePrefsStore }
  )
);

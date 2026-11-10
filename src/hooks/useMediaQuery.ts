import { useSyncExternalStore } from 'react';

/** Suit une media query CSS. Vaut `false` pendant le rendu serveur. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Écran tactile sans survol (téléphone, tablette) : les actions passent par un panneau. */
export const useIsTouch = () => useMediaQuery('(hover: none)');

/** Petit écran : on replie ce qui prend de la place. */
export const useIsSmallScreen = () => useMediaQuery('(max-width: 640px)');

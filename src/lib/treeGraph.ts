// Parcours de l'arbre familial (liens parent → enfant et liens entre époux).

export interface FamilyLink {
  source: string;
  target: string;
  type?: string;
}

export interface FamilyIndex {
  /** Époux/épouses directs d'un membre. */
  getSpouses: (id: string) => string[];
  /** Tout ce qui est masqué quand on replie `id` : ses époux, ses descendants et leurs époux. */
  getDescendants: (id: string) => string[];
}

const push = (map: Map<string, string[]>, key: string, value: string) => {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
};

export function buildFamilyIndex(links: FamilyLink[]): FamilyIndex {
  const children = new Map<string, string[]>();
  const spouses = new Map<string, string[]>();

  for (const link of links) {
    if (link.type === 'child') {
      push(children, link.source, link.target);
    } else if (link.type === 'spouse') {
      push(spouses, link.source, link.target);
      push(spouses, link.target, link.source);
    }
  }

  const getSpouses = (id: string) => spouses.get(id) ?? [];

  const getDescendants = (rootId: string) => {
    const found = new Set<string>();
    const visited = new Set<string>();
    const walk = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      for (const spouse of getSpouses(id)) found.add(spouse);
      for (const child of children.get(id) ?? []) {
        found.add(child);
        walk(child);
      }
    };
    walk(rootId);
    found.delete(rootId);
    return [...found];
  };

  return { getSpouses, getDescendants };
}

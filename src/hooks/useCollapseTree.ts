import { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useTreeStore } from '@/store/useTreeStore';

export function useCollapseTree(nodes: Node[], edges: Edge[]) {
  const { collapsedIds } = useTreeStore();

  return useMemo(() => {
    if (collapsedIds.size === 0) return { nodes, edges };

    // Trouve tous les descendants d'un node (enfants + époux)
    const getDescendants = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return [];
      visited.add(id);

      const children = edges
        .filter(e => e.source === id && (e.data as any)?.type === 'child')
        .map(e => e.target);

      const spouses = edges
        .filter(e =>
          (e.data as any)?.type === 'spouse' &&
          (e.source === id || e.target === id)
        )
        .map(e => e.source === id ? e.target : e.source);

      return [
        ...children,
        ...spouses,
        ...children.flatMap(c => getDescendants(c, visited)),
      ];
    };

    const hiddenIds = new Set<string>();
    const bubbleNodes: Node[] = [];
    const bubbleEdges: Edge[] = [];

    collapsedIds.forEach(parentId => {
      const parentNode = nodes.find(n => n.id === parentId);
      if (!parentNode) return;

      const descendants = getDescendants(parentId);
      descendants.forEach(id => hiddenIds.add(id));

      // Créer le node bubble sous le parent
      const bubbleId = `bubble-${parentId}`;
      bubbleNodes.push({
        id: bubbleId,
        type: 'collapsedBubble',
        position: {
          x: parentNode.position.x + 60, // centré sous le parent
          y: parentNode.position.y + 120,
        },
        data: {
          count: descendants.filter(id => {
            // Compter uniquement les membres, pas les époux directs
            const isSpouseOfParent = edges.some(e =>
              (e.data as any)?.type === 'spouse' &&
              ((e.source === parentId && e.target === id) ||
               (e.target === parentId && e.source === id))
            );
            return !isSpouseOfParent;
          }).length,
          parentId,
          onExpand: () => {},  // branché dans page.tsx
        },
        draggable: false,
        selectable: false,
      });

      // Edge fictif parent → bubble
      bubbleEdges.push({
        id: `edge-bubble-${parentId}`,
        source: parentId,
        target: bubbleId,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'customEdge',
        data: { type: 'bubble' },
        style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' },
      });
    });

    const filteredNodes = [
      ...nodes.map(n => ({ ...n, hidden: hiddenIds.has(n.id) })),
      ...bubbleNodes,
    ];

    const filteredEdges = [
      ...edges.map(e => ({
        ...e,
        hidden: hiddenIds.has(e.source) || hiddenIds.has(e.target),
      })),
      ...bubbleEdges,
    ];

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [nodes, edges, collapsedIds]);
}
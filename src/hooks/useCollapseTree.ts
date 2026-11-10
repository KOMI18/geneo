import { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useTreeStore } from '@/store/useTreeStore';
import { buildFamilyIndex } from '@/lib/treeGraph';

const BUBBLE_SIZE = 48;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 100;
const BUBBLE_GAP = 44; // espace entre la carte du parent et la bulle

export function useCollapseTree(nodes: Node[], edges: Edge[]) {
  const collapsedIds = useTreeStore((s) => s.collapsedIds);

  // L'index ne dépend que des liens : il n'est pas recalculé pendant un déplacement.
  const family = useMemo(
    () =>
      buildFamilyIndex(
        edges.map((e) => ({
          source: e.source,
          target: e.target,
          type: (e.data as { type?: string } | undefined)?.type,
        }))
      ),
    [edges]
  );

  return useMemo(() => {
    if (collapsedIds.size === 0) return { nodes, edges };

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const hiddenIds = new Set<string>();
    const bubbleNodes: Node[] = [];
    const bubbleEdges: Edge[] = [];

    collapsedIds.forEach((parentId) => {
      const parentNode = nodeById.get(parentId);
      if (!parentNode) return;

      const descendants = family.getDescendants(parentId);
      descendants.forEach((id) => hiddenIds.add(id));

      // On compte les descendants, pas les époux directs du parent
      const parentSpouses = new Set(family.getSpouses(parentId));
      const parentWidth = parentNode.measured?.width ?? DEFAULT_NODE_WIDTH;

      // Bulle centrée sous le parent : elle suit donc le parent quand on le déplace
      const bubbleId = `bubble-${parentId}`;
      bubbleNodes.push({
        id: bubbleId,
        type: 'collapsedBubble',
        // Dimensions fixées : la bulle n'est pas dans l'état des nodes, React Flow ne peut
        // donc pas mémoriser sa mesure et la laisserait invisible.
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        position: {
          x: parentNode.position.x + (parentWidth - BUBBLE_SIZE) / 2,
          y: parentNode.position.y + (parentNode.measured?.height ?? DEFAULT_NODE_HEIGHT) + BUBBLE_GAP,
        },
        data: {
          count: descendants.filter((id) => !parentSpouses.has(id)).length,
          parentId,
          onExpand: () => {}, // branché dans page.tsx
        },
        draggable: false,
        selectable: false,
      });

      // Edge fictif parent → bulle
      bubbleEdges.push({
        id: `edge-bubble-${parentId}`,
        source: parentId,
        target: bubbleId,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'customEdge',
        data: { type: 'bubble' },
      });
    });

    // Un parent replié à l'intérieur d'une branche déjà masquée n'affiche pas sa bulle
    const visibleBubbles = bubbleNodes.filter(
      (b) => !hiddenIds.has((b.data as { parentId: string }).parentId)
    );
    const visibleBubbleEdges = bubbleEdges.filter((e) => !hiddenIds.has(e.source));

    // On ne recrée un objet que si la visibilité change (évite des re-rendus inutiles)
    const withHidden = <T extends { hidden?: boolean }>(item: T, hidden: boolean): T =>
      (item.hidden ?? false) === hidden ? item : { ...item, hidden };

    return {
      nodes: [...nodes.map((n) => withHidden(n, hiddenIds.has(n.id))), ...visibleBubbles],
      edges: [
        ...edges.map((e) => withHidden(e, hiddenIds.has(e.source) || hiddenIds.has(e.target))),
        ...visibleBubbleEdges,
      ],
    };
  }, [nodes, edges, collapsedIds, family]);
}

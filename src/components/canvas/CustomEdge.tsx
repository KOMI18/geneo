'use client';
import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';

const SPOUSE_COLOR = '#ec4899';
const CHILD_COLOR = '#f97316';

/**
 * Lien de l'arbre, lisible sur tous les fonds :
 * un filet blanc dessous, puis le trait de couleur dessus.
 * - époux : trait rose continu
 * - parent → enfant : pointillé orange qui « coule » vers l'enfant
 * - descendance repliée : pointillé orange fixe vers la bulle +N
 */
export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}: EdgeProps) {
  const type = (data as { type?: string } | undefined)?.type;
  const isSpouse = type === 'spouse';
  const isBubble = type === 'bubble';

  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <path d={edgePath} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <BaseEdge
        id={id}
        path={edgePath}
        className={!isSpouse && !isBubble ? 'tree-edge-flow' : undefined}
        style={{
          stroke: isSpouse ? SPOUSE_COLOR : CHILD_COLOR,
          strokeWidth: 3.5,
          strokeDasharray: isSpouse ? undefined : '7 7',
        }}
      />
    </>
  );
}

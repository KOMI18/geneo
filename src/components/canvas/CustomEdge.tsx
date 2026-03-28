'use client';
import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style, data,
}: EdgeProps) {
  const isSpouse = (data as any)?.type === 'spouse';
  const isBubble = (data as any)?.type === 'bubble';

  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: isSpouse ? '#ec4899' : '#f97316',
        strokeWidth: isSpouse ? 3 : 2,
        strokeDasharray: isBubble ? '5 5' : undefined,
        ...style,
      }}
    />
  );
}
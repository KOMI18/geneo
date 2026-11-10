'use client';
import { Background, BackgroundVariant, useStore, type ReactFlowState } from '@xyflow/react';
import { getTreeBackground } from '@/lib/treeBackgrounds';
import { useTreePrefsStore } from '@/store/useTreePrefsStore';

const transformSelector = (s: ReactFlowState) => s.transform;

// En dessous de ce zoom, la tuile ne rétrécit plus (sinon le motif devient du bruit).
const MIN_PATTERN_ZOOM = 0.4;

/** Fond du canvas : tissu africain qui suit le déplacement et le zoom de l'arbre. */
export function TreeBackground() {
  const patternId = useTreePrefsStore((s) => s.patternId);
  const intensity = useTreePrefsStore((s) => s.intensity);
  const [x, y, zoom] = useStore(transformSelector);
  const pattern = getTreeBackground(patternId);

  if (!pattern.image) {
    return <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#998c70ff" />;
  }

  const size = pattern.tile * Math.max(zoom, MIN_PATTERN_ZOOM);

  return (
    <div
      aria-hidden
      className="react-flow__background"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'transparent',
        backgroundImage: pattern.image,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${x}px ${y}px`,
        opacity: intensity,
      }}
    />
  );
}

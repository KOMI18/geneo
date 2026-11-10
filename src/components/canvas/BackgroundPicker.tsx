'use client';
import { useEffect, useRef, useState } from 'react';
import { Panel } from '@xyflow/react';
import { Check, Palette } from 'lucide-react';
import { TREE_BACKGROUNDS } from '@/lib/treeBackgrounds';
import { useTreePrefsStore } from '@/store/useTreePrefsStore';

/** Bouton « Fond » du canvas : choix du tissu et de son intensité. */
export function BackgroundPicker() {
  const { patternId, intensity, setPattern, setIntensity } = useTreePrefsStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as globalThis.Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <Panel position="top-right">
      <div ref={ref} className="relative flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <Palette size={16} />
          Fond
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Choisir le fond de l'arbre"
            className="w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Tissu de fond
            </p>

            <div className="grid grid-cols-3 gap-2">
              {TREE_BACKGROUNDS.map((p) => {
                const selected = p.id === patternId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPattern(p.id)}
                    aria-pressed={selected}
                    title={`${p.name} — ${p.origin}`}
                    className={`group cursor-pointer overflow-hidden rounded-lg border-2 text-left transition-colors ${
                      selected
                        ? 'border-orange-500'
                        : 'border-zinc-200 hover:border-orange-300 dark:border-zinc-700'
                    }`}
                  >
                    <div
                      className="relative h-14 w-full bg-white"
                      style={
                        p.image
                          ? { backgroundImage: p.image, backgroundSize: '56px 56px' }
                          : {
                              backgroundImage:
                                'radial-gradient(#998c70 1px, transparent 1px)',
                              backgroundSize: '8px 8px',
                            }
                      }
                    >
                      {selected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="px-1.5 py-1">
                      <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        {p.name}
                      </p>
                      <p className="truncate text-[10px] text-zinc-500">{p.origin}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {patternId !== 'plain' && (
              <label className="mt-3 block">
                <span className="flex justify-between text-xs text-zinc-500">
                  <span>Intensité</span>
                  <span>{Math.round(intensity * 100)} %</span>
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round(intensity * 100)}
                  onChange={(e) => setIntensity(Number(e.target.value) / 100)}
                  className="nodrag mt-1 w-full cursor-pointer accent-orange-500"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

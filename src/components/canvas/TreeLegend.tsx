'use client';
import { Panel } from '@xyflow/react';
import { Info, MessageCircle, X } from 'lucide-react';
import { useTreePrefsStore } from '@/store/useTreePrefsStore';
import { useIsSmallScreen } from '@/hooks/useMediaQuery';

const Row = ({ sample, title, hint }: { sample: React.ReactNode; title: string; hint?: string }) => (
  <li className="flex items-center gap-3">
    <span className="flex h-8 w-14 shrink-0 items-center justify-center">{sample}</span>
    <span className="leading-tight">
      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
      {hint && <span className="block text-xs text-zinc-600 dark:text-zinc-400">{hint}</span>}
    </span>
  </li>
);

const Card = ({ className }: { className: string }) => (
  <span className={`block h-6 w-12 rounded-md border-2 bg-white ${className}`} />
);

const Line = ({ color, dashed }: { color: string; dashed?: boolean }) => (
  <svg width="52" height="8" aria-hidden>
    <line
      x1="2" y1="4" x2="50" y2="4"
      stroke={color} strokeWidth="3" strokeLinecap="round"
      strokeDasharray={dashed ? '6 6' : undefined}
    />
  </svg>
);

/** Légende du code couleur de l'arbre (les couleurs reprennent celles des cartes et des liens). */
export function TreeLegend() {
  const choice = useTreePrefsStore((s) => s.legendOpen);
  const isSmall = useIsSmallScreen();
  const open = choice ?? !isSmall;
  const setOpen = useTreePrefsStore((s) => s.setLegendOpen);

  if (!open) {
    return (
      <Panel position="top-left">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <Info size={16} />
          Légende
        </button>
      </Panel>
    );
  }

  return (
    <Panel position="top-left">
      <section
        aria-label="Légende de l'arbre"
        className="w-64 max-w-[calc(100vw-30px)] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
      >
        <header className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
            Légende
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Masquer la légende"
            title="Masquer la légende"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </header>

        <ul className="space-y-2">
          <Row sample={<Card className="border-blue-400" />} title="Homme" hint="Cadre bleu" />
          <Row sample={<Card className="border-pink-400" />} title="Femme" hint="Cadre rose" />
          <Row
            sample={<Line color="#ec4899" />}
            title="Mari et femme"
            hint="Trait rose continu"
          />
          <Row
            sample={<Line color="#f97316" dashed />}
            title="Parent → enfant"
            hint="Pointillé orange, d'une génération à la suivante"
          />
          <Row
            sample={
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-orange-400 bg-white text-[10px] font-bold text-orange-500">
                +3
              </span>
            }
            title="Descendance repliée"
            hint="Cliquer sur le rond pour l'afficher"
          />
          <Row
            sample={
              <span className="rounded-full bg-orange-50 p-1 text-orange-500">
                <MessageCircle size={16} fill="currentColor" />
              </span>
            }
            title="Note ou anecdote"
            hint="Cliquer sur la bulle pour la lire"
          />
        </ul>
      </section>
    </Panel>
  );
}

'use client';
import { Dialog as DialogPrimitive } from 'radix-ui';
import {
  Baby, ChevronsDownUp, ChevronsUpDown, Heart, Image as ImageIcon,
  MessageCircle, Pencil, Trash2, X,
} from 'lucide-react';
import { useTreeStore } from '@/store/useTreeStore';

interface MemberSheetProps {
  memberId: string | null;
  canEdit: boolean;
  onClose: () => void;
  onToggleCollapse: (id: string) => void;
  onZoom: (url: string, name: string) => void;
}

const Action = ({
  icon, label, onClick, tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'danger';
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-4 text-left text-base font-medium transition-transform active:scale-[0.98] ${
      tone === 'primary'
        ? 'bg-orange-500 text-white'
        : tone === 'danger'
          ? 'bg-red-50 text-red-600'
          : 'bg-zinc-100 text-zinc-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

/**
 * Panneau d'actions d'un membre pour les écrans tactiles :
 * il remplace la barre qui n'apparaît qu'au survol de la souris.
 */
export function MemberSheet({ memberId, canEdit, onClose, onToggleCollapse, onZoom }: MemberSheetProps) {
  const member = useTreeStore((s) => s.members.find((m) => m.id === memberId));
  const hasChildren = useTreeStore((s) => s.edges.some((e) => e.source === memberId && e.type === 'child'));
  const isCollapsed = useTreeStore((s) => (memberId ? s.collapsedIds.has(memberId) : false));
  const { openModal, openEditModal, openDeleteModal, openNoteModal } = useTreeStore.getState();

  // Fermer le panneau, puis lancer l'action (qui ouvre souvent une autre fenêtre)
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <DialogPrimitive.Root open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom motion-reduce:animate-none"
        >
          {member && (
            <>
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200" aria-hidden />
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] bg-zinc-100 text-xl text-zinc-500 ${
                    member.gender === 'M' ? 'border-blue-400' : 'border-pink-400'
                  }`}
                >
                  {member.photoURL ? (
                    <img src={member.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : member.gender === 'M' ? '♂' : '♀'}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogPrimitive.Title className="truncate text-lg font-bold text-zinc-900">
                    {member.label}
                  </DialogPrimitive.Title>
                  <p className="text-sm text-zinc-500">{member.gender === 'M' ? 'Homme' : 'Femme'}</p>
                </div>
                <DialogPrimitive.Close
                  aria-label="Fermer"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
                >
                  <X size={20} />
                </DialogPrimitive.Close>
              </div>

              <div className="grid gap-2">
                {canEdit && (
                  <Action
                    tone="primary"
                    icon={<Baby size={22} />}
                    label="Ajouter un enfant"
                    onClick={run(() => openModal(member.id))}
                  />
                )}
                {canEdit && member.gender === 'M' && (
                  <Action
                    icon={<Heart size={22} className="text-pink-500" />}
                    label="Ajouter une épouse"
                    onClick={run(() => openModal(member.id, true))}
                  />
                )}
                {hasChildren && (
                  <Action
                    icon={isCollapsed ? <ChevronsUpDown size={22} /> : <ChevronsDownUp size={22} />}
                    label={isCollapsed ? 'Déplier la descendance' : 'Replier la descendance'}
                    onClick={run(() => onToggleCollapse(member.id))}
                  />
                )}
                <Action
                  icon={<MessageCircle size={22} className={member.note ? 'text-orange-500' : undefined} />}
                  label={member.note ? 'Lire la note' : canEdit ? 'Écrire une note' : 'Note'}
                  onClick={run(() => openNoteModal(member))}
                />
                {member.photoURL && (
                  <Action
                    icon={<ImageIcon size={22} />}
                    label="Voir la photo"
                    onClick={run(() => onZoom(member.photoURL!, member.label))}
                  />
                )}
                {canEdit && (
                  <>
                    <Action
                      icon={<Pencil size={22} />}
                      label="Modifier"
                      onClick={run(() => openEditModal(member))}
                    />
                    <Action
                      tone="danger"
                      icon={<Trash2 size={22} />}
                      label="Supprimer"
                      onClick={run(() => openDeleteModal(member.id))}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

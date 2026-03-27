'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/store/useTreeStore';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteConfirmModal({ onConfirm }: DeleteConfirmModalProps) {
  const { deletingMemberId, closeDeleteModal, members, edges } = useTreeStore();
  const [loading, setLoading] = useState(false);

  const member = members.find(m => m.id === deletingMemberId);

  // Compter les descendants pour avertir l'utilisateur
  const countDescendants = (id: string, visited = new Set<string>()): number => {
    if (visited.has(id)) return 0;
    visited.add(id);
    const children = edges
      .filter(e => e.source === id && e.type === 'child')
      .map(e => e.target);
    return children.reduce((acc, childId) => acc + 1 + countDescendants(childId, visited), 0);
  };

  const descendantCount = deletingMemberId ? countDescendants(deletingMemberId) : 0;

  const handleConfirm = async () => {
    if (!deletingMemberId) return;
    setLoading(true);
    await onConfirm(deletingMemberId);
    setLoading(false);
    closeDeleteModal();
  };

  return (
    <Dialog open={!!deletingMemberId} onOpenChange={closeDeleteModal}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold flex items-center gap-2">
            <Trash2 size={18} className="text-red-500" />
            Supprimer un membre
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Voulez-vous supprimer <span className="font-bold text-zinc-900 dark:text-zinc-100">{member?.label}</span> ?
          </p>

          {descendantCount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ Ce membre a {descendantCount} descendant{descendantCount > 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Tous ses descendants seront également supprimés.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeDeleteModal} className="text-zinc-500">
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
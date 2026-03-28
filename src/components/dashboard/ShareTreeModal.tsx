'use client';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, UserPlus, Trash2 } from 'lucide-react';
import type { FamilyTree, CollaboratorRole } from '@/types/tree';

interface ShareTreeModalProps {
  tree: FamilyTree | null;
  onClose: () => void;
}

export function ShareTreeModal({ tree, onClose }: ShareTreeModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('editor');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tree) return null;

  // Générer ou récupérer le lien de partage
  const shareUrl = tree.shareLink
    ? `${window.location.origin}/join/${tree.shareLink}`
    : null;

  const handleGenerateLink = async () => {
    const token = Math.random().toString(36).slice(2, 10);
    await updateDoc(doc(db, 'trees', tree.id), { shareLink: token });
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await updateDoc(doc(db, 'trees', tree.id), {
        [`collaborators.${email.replace(/\./g, ',')}`]: role,
      });
      setEmail('');
    } catch {
      setError('Erreur lors de l\'ajout du collaborateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (emailKey: string) => {
    const { deleteField } = await import('firebase/firestore');
    await updateDoc(doc(db, 'trees', tree.id), {
      [`collaborators.${emailKey}`]: deleteField(),
    });
  };

  const handleChangeRole = async (emailKey: string, newRole: CollaboratorRole) => {
    await updateDoc(doc(db, 'trees', tree.id), {
      [`collaborators.${emailKey}`]: newRole,
    });
  };

  // Firestore n'accepte pas les "." dans les clés → on les remplace par ","
  const collaborators = Object.entries(tree.collaborators ?? {}).map(
    ([key, r]) => ({ email: key.replace(/,/g, '.'), key, role: r })
  );

  return (
    <Dialog open={!!tree} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold">
            Partager — {tree.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* ── Lien de partage ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Lien de partage (accès visiteur)
            </label>
            {shareUrl ? (
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-10"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 h-10 px-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateLink}
                className="w-full h-10 border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-500 hover:border-orange-400 hover:text-orange-500"
              >
                Générer un lien
              </Button>
            )}
          </div>

          {/* ── Ajouter par email ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Inviter par email
            </label>
            <form onSubmit={handleAddCollaborator} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CollaboratorRole)}
                className="h-10 px-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="editor">Éditeur</option>
                <option value="viewer">Visiteur</option>
              </select>
              <Button
                type="submit"
                disabled={loading}
                className="shrink-0 h-10 px-3 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <UserPlus size={14} />
              </Button>
            </form>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* ── Liste des collaborateurs ── */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Collaborateurs
              </label>
              <div className="space-y-2">
                {collaborators.map(({ email: colEmail, key, role: colRole }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">
                      {colEmail}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <select
                        value={colRole}
                        onChange={(e) => handleChangeRole(key, e.target.value as CollaboratorRole)}
                        className="text-xs h-7 px-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="editor">Éditeur</option>
                        <option value="viewer">Visiteur</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(key)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TreePine, Loader2 } from 'lucide-react';

interface TreeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  initialName?: string;
  mode: 'create' | 'edit';
}

export function TreeSettingsModal({ isOpen, onClose, onSave, initialName = '', mode }: TreeSettingsModalProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  // Reset le nom quand on ouvre le modal (surtout pour l'édition)
  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      await onSave(name.trim());
      onClose();
      setName('');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'arbre", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
            <TreePine className="text-orange-600" size={20} />
          </div>
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? 'Nouvel arbre généalogique' : 'Renommer l\'arbre'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Nom de l'arbre
            </label>
            <Input
              autoFocus
              placeholder="Ex: Famille Traoré - Branche Mali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-orange-500"
              required
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 text-zinc-500"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : mode === 'create' ? (
                'Créer l\'arbre'
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
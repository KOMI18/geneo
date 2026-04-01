'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteTreeModalProps {
  tree: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteTreeModal({ tree, isOpen, onClose, onConfirm }: DeleteTreeModalProps) {
  const [status, setStatus] = useState<'idle' | 'deleting' | 'success'>('idle');

  const handleDelete = async () => {
    if (!tree) return;
    setStatus('deleting');
    try {
      await onConfirm(tree.id);
      setStatus('success');
      // On laisse l'utilisateur voir le succès brièvement avant de fermer
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (error) {
      setStatus('idle');
      alert("Erreur lors de la suppression totale.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={status === 'deleting' ? undefined : onClose}>
      <DialogContent className="sm:max-w-[400px] overflow-hidden">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader className="flex flex-col items-center text-center pt-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <DialogTitle className="text-xl font-bold">Supprimer l'arbre ?</DialogTitle>
                <DialogDescription className="pt-2">
                  Êtes-vous sûr de vouloir supprimer <span className="font-bold text-zinc-900 dark:text-zinc-100">"{tree?.name}"</span> ? 
                  Cette action supprimera définitivement tous les membres et les photos associées.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 mt-6">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="w-full font-bold h-11"
                >
                  <Trash2 className="mr-2" size={18} />
                  Confirmer la suppression
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="w-full text-zinc-500"
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          ) : status === 'deleting' ? (
            <motion.div
              key="deleting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 flex flex-col items-center text-center"
            >
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold">Suppression en cours...</h3>
              <p className="text-sm text-zinc-500 mt-2 px-6">
                Nous nettoyons vos données et les images stockées sur le cloud. Veuillez patienter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600 h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold">Arbre supprimé !</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
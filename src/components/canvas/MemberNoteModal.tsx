'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Pour récupérer le treeId de l'URL
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTreeStore } from '@/store/useTreeStore';
import { Loader2, MessageSquare, Save } from 'lucide-react';

export function MemberNoteModal({ canEdit }: { canEdit: boolean }) {
  const params = useParams();
  const treeId = params?.treeId as string;

  const { 
    isNoteModalOpen, 
    closeNoteModal, 
    selectedMemberForNote, 
    updateMemberNote 
  } = useTreeStore();

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchroniser la note locale quand on sélectionne un membre
  useEffect(() => {
    if (selectedMemberForNote) {
      setNote(selectedMemberForNote.note || '');
    }
  }, [selectedMemberForNote]);

  const handleSave = async () => {
    console.log('le selected member id est' ,  selectedMemberForNote )
    console.log('le selected tree id est' ,  treeId )

    if (!selectedMemberForNote || !treeId) return;
    
    setLoading(true);
    try {
      // On passe treeId, memberId et la note
      await updateMemberNote(treeId, selectedMemberForNote.id, note);
      closeNoteModal();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde de la note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isNoteModalOpen} onOpenChange={loading ? undefined : closeNoteModal}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <MessageSquare size={20} className="fill-orange-100 dark:fill-orange-900/30" />
            <DialogTitle className="text-lg font-bold">
              Note sur {selectedMemberForNote?.label}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          {canEdit ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Racontez une histoire, ajoutez des dates importantes ou des anecdotes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[180px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 focus:border-orange-500 text-sm"
                disabled={loading}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={closeNoteModal} 
                  disabled={loading}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic whitespace-pre-wrap">
                {note || "Aucune note n'a été ajoutée pour ce membre."}
              </p>
              {!note && (
                <p className="text-xs text-zinc-400 mt-4 text-center font-medium">
                  (Mode lecture seule)
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
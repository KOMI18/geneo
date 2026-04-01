'use client';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTreeStore } from '@/store/useTreeStore';
import { ImagePlus, X } from 'lucide-react';
import type { TreeMember } from '@/types/tree';
import { usePhoto } from '@/hooks/usePhoto';
interface EditMemberModalProps {
  onSave: (id: string, updates: Partial<TreeMember>, newPhoto?: string) => Promise<void>;
}

export function EditMemberModal({ onSave }: EditMemberModalProps) {
  const { editingMember, closeEditModal, edges } = useTreeStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { uploadToR2, isUploading } = usePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Vérifie si ce membre est une épouse (cible d'un edge 'spouse')
  const isSpouse = edges.some(
    e => e.target === editingMember?.id && e.type === 'spouse'
  );

 useEffect(() => {
    if (editingMember) {
      setName(editingMember.label);
      setGender(editingMember.gender);
      setPhotoPreview(editingMember.photoURL ?? null);
      setSelectedFile(null); // Reset du fichier si on change de membre
    }
  }, [editingMember]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !name.trim()) return;
    setLoading(true);

    try {
      const updates: Partial<TreeMember> = { label: name };
      if (!isSpouse) updates.gender = gender;

      let finalPhotoURL: string | undefined = undefined;

      // Si l'utilisateur a sélectionné un nouveau fichier
      if (selectedFile) {
        const url = await uploadToR2(selectedFile);
        if (url) finalPhotoURL = url;
      } 
      // Cas où l'utilisateur a cliqué sur le "X" pour supprimer la photo
      else if (photoPreview === null && editingMember.photoURL) {
        updates.photoURL = null as any; // On signalera à updateMember de supprimer
      }

      await onSave(editingMember.id, updates, finalPhotoURL);
      closeEditModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={!!editingMember} onOpenChange={closeEditModal}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold">
            Modifier un membre
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-orange-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="text-zinc-400" size={32} />
                )}
              </div>
              {photoPreview && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Genre — masqué pour les épouses */}
          {!isSpouse ? (
            <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">Sexe</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio" name="gender" value="M"
                    checked={gender === 'M'}
                    onChange={() => setGender('M')}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm font-medium dark:text-zinc-300 group-hover:text-blue-500 transition-colors">Homme</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio" name="gender" value="F"
                    checked={gender === 'F'}
                    onChange={() => setGender('F')}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span className="text-sm font-medium dark:text-zinc-300 group-hover:text-pink-500 transition-colors">Femme</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-lg">
              <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                Mode union : le genre ne peut pas être modifié.
              </p>
            </div>
          )}

          {/* Nom */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Nom complet</label>
            <Input
              placeholder="Ex: Moussa Traoré"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeEditModal} className="text-zinc-500">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
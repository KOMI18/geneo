'use client';
import { useState, useRef  , useEffect} from 'react';
import { useTreeStore } from '@/store/useTreeStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X } from 'lucide-react';

interface AddMemberModalProps {
  onAdd: (parentId: string, name: string, gender: 'M' | 'F', photoURL?: string) => void;
  isSpouseMode: boolean; 
}

export function AddMemberModal({ onAdd  , isSpouseMode}: AddMemberModalProps) {
  const { isModalOpen, closeModal, parentIdForNewChild } = useTreeStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M'); // État pour le genre
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isModalOpen) {
      setGender(isSpouseMode ? 'F' : 'M');
    }
  }, [isModalOpen, isSpouseMode]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // On vérifie que parentIdForNewChild existe (cela peut être "root" ou un ID de nœud)
    if (name.trim() && parentIdForNewChild) {
      onAdd(parentIdForNewChild, name, gender, photo || undefined);
      
      // Reset des champs
      setName('');
      setGender('M');
      setPhoto(null);
      closeModal();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold">
            Ajouter un membre
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Zone Photo */}
          <div className="flex justify-center">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-orange-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="text-zinc-400" size={32} />
                )}
              </div>
              {photo && (
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
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

          {/* Choix du Sexe */}
          {!isSpouseMode && (
            <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">Sexe</label>
               <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender" 
                  value="M" 
                  checked={gender === 'M'} 
                  onChange={() => setGender('M')}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm font-medium dark:text-zinc-300 group-hover:text-blue-500 transition-colors">Homme</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender" 
                  value="F" 
                  checked={gender === 'F'} 
                  onChange={() => setGender('F')}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm font-medium dark:text-zinc-300 group-hover:text-pink-500 transition-colors">Femme</span>
              </label>
            </div>
            </div>
          )}

          {isSpouseMode && (
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-lg">
              <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                Mode union : Le genre est automatiquement défini sur Femme.
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
            <Button type="button" variant="ghost" onClick={closeModal} className="text-zinc-500">
              Annuler
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-lg shadow-orange-500/20">
              Ajouter au projet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
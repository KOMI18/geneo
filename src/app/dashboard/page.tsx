'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { clearSessionCookie } from '@/lib/session';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Plus, TreePine, LogOut, MoreHorizontal, Edit, Edit2, Delete, Trash2 } from 'lucide-react';
import { ShareTreeModal } from '@/components/dashboard/ShareTreeModal';
import { Share2 } from 'lucide-react';
import type { FamilyTree } from '@/types/tree';
import { DeleteTreeModal } from '@/components/dashboard/DeleteTreeModal';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { TreeSettingsModal } from '@/components/dashboard/TreeSettingsModal';
function timeAgo(ts: any) {
  if (!ts) return "—";

  // Si c'est un objet Timestamp de Firebase (possède .toMillis)
  const timestamp = typeof ts.toMillis === 'function' ? ts.toMillis() : ts;
  
  const diff = Date.now() - timestamp;
  
  // Si le diff est négatif (horloge serveur vs locale), on met à 0
  const seconds = Math.max(0, Math.floor(diff / 1000));
  const h = Math.floor(seconds / 3600);
  
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Hier';
  return `Il y a ${d}j`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { trees, loading, totalMembers , ownTrees , sharedTrees , updateTreeName , deleteTree  } = useDashboard();
  const [sharingTree, setSharingTree] = useState<FamilyTree | null>(null);
  const [treeToDelete, setTreeToDelete] = useState<{id: string, name: string} | null>(null);
  const [treeModal, setTreeModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    treeId?: string; 
    initialName?: string; 
  }>({
    isOpen: false,
    mode: 'create'
  });
  const handleLogout = async () => {
    await signOut(auth);
    clearSessionCookie();
    router.push('/login');
  };

  const handleSaveTree = async (name: string) => {
    if (treeModal.mode === 'create') {
      // Logique de création (ton addDoc actuel)
      const docRef = await addDoc(collection(db, 'trees'), {
        name,
        ownerId: user?.uid,
        memberCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: Date.now(),
      });
      router.push(`/tree/${docRef.id}`);
    } else if (treeModal.mode === 'edit' && treeModal.treeId) {
      // Logique d'édition via ton hook
      await updateTreeName(treeModal.treeId, name);
    }
  };
  // Initiales depuis displayName
  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const lastName = trees.length > 0
    ? timeAgo(Math.max(...trees.map(t => t.updatedAt)))
    : '—';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-zinc-500">Bonjour,</p>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
            {user?.displayName ?? 'Utilisateur'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Arbres', value: trees.length },
          { label: 'Membres total', value: totalMembers },
          { label: 'Dernière modif.', value: lastName },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Arbres */}
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
        Mes arbres
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ownTrees.map((tree) => (
          <div key={tree.id} className="relative group cursor-pointer text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-orange-400 transition-colors">
          <button
            onClick={() => router.push(`/tree/${tree.id}`)}
            className=""
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 flex items-center justify-center mb-3">
              <TreePine size={20} className="text-orange-500" />
            </div>
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {tree.name}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{tree.memberCount} membres</p>
            <p className="text-xs text-zinc-400 mt-2">{timeAgo(tree.updatedAt)}</p>
          </button>
          
          <NavigationMenu className='absolute cursor-pointer top-3 right-3 '>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger> <MoreHorizontal/> </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink 
                      onClick={(e) => { e.stopPropagation(); setSharingTree(tree as FamilyTree); }}
                  >
                        <button
                      className=" cursor-pointer flex justify-between "
                      title="Partager"
                      
                        >
                      <Share2 size={14} />
                      <span className='px-2'>Partager</span>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      onClick={() => setTreeModal({ 
                            isOpen: true, 
                            mode: 'edit', 
                            treeId: tree.id, 
                            initialName: tree.name 
                          })}
                    >
                        <button
                     
                      className=" cursor-pointer flex justify-between"
                      title="Modifier"
                      
                        >
                      <Edit2 size={14} />
                      <span className='px-2'>Modifier</span>
                    </button>
                  </NavigationMenuLink>
                  <NavigationMenuLink onClick={() => setTreeToDelete({ id: tree.id, name: tree.name })}>
                        <button
                      className=" cursor-pointer flex justify-between"
                      title="Supprimer"
                      
                        >
                      <Trash2 size={14} />
                      <span className='px-2'>Supprimer</span>
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          </div>
          
          
        ))}
        <ShareTreeModal
          tree={sharingTree}
          onClose={() => setSharingTree(null)}
        />
        <DeleteTreeModal 
          tree={treeToDelete}
          isOpen={!!treeToDelete}
          onClose={() => setTreeToDelete(null)}
          onConfirm={async (id) => {
            await deleteTree(id); 
          }}
        />
        <TreeSettingsModal
        isOpen={treeModal.isOpen}
        mode={treeModal.mode}
        initialName={treeModal.initialName}
        onClose={() => setTreeModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveTree}
      />
        {/* Nouvelle carte */}
        <button
          onClick={() => setTreeModal({ isOpen: true, mode: 'create' })}
          className="flex flex-col cursor-pointer items-center justify-center gap-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 min-h-[140px] hover:border-orange-400 transition-colors"
        >
          <div className="w-9 h-9 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <Plus size={18} className="text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-400">Nouvel arbre</p>
        </button>

      </div>
      {sharedTrees.length > 0 && (
          <>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 mt-8">
              Partagés avec moi
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sharedTrees.map((tree) => {
                // Chercher le rôle dans le tableau collaborators
                const collaborator = tree.collaborators?.find(
                  c => c.email === user?.email
                );
                const role = collaborator?.role;

                return (
                  <button
                    key={tree.id}
                    onClick={() => router.push(`/tree/${tree.id}`)}
                    className="text-left cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-orange-400 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 flex items-center justify-center mb-3">
                      <TreePine size={20} className="text-orange-500" />
                    </div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{tree.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{tree.memberCount} membres</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === 'editor'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {role === 'editor' ? 'Éditeur' : 'Visiteur'}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
    </main>
  );
}
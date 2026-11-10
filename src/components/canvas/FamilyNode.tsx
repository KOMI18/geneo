'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import {  Trash2, Edit2, MessageCircle,  } from 'lucide-react';
import { useTreeStore } from '@/store/useTreeStore';

// 1. On définit l'interface de ce que contient "data"
export type FamilyNodeData = {
  label: string;
  id: string;
  gender: 'M' | 'F';
  photoURL?: string | null;
  canEdit: boolean;  
  onZoom: (url: string, name: string) => void;
  onAddSpouse: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
};
// 2. On applique le type à NodeProps
export const FamilyNode = memo(({ id, data }: NodeProps<Node<FamilyNodeData>>) => {
  const openModal = useTreeStore((state) => state.openModal);
  const openDeleteModal = useTreeStore(s => s.openDeleteModal);
  const openEditModal = useTreeStore(s => s.openEditModal);
  const openNoteModal = useTreeStore(s => s.openNoteModal);

  // Sélecteurs ciblés : la carte ne se re-rend que si SA note, SES enfants ou SON repli changent
  const hasNote = useTreeStore(s => !!s.members.find(m => m.id === id)?.note);
  const hasChildren = useTreeStore(s => s.edges.some(e => e.source === id && e.type === 'child'));
  const isCollapsed = useTreeStore(s => s.collapsedIds.has(id));
  const getMember = () => useTreeStore.getState().members.find(m => m.id === id);

  const genderClass = data.gender === 'M' 
    ? 'border-blue-400 dark:border-blue-500' 
    : 'border-pink-400 dark:border-pink-500';
  return (
   <div className={`group bg-white dark:bg-zinc-900 border-2 ${genderClass} rounded-xl p-3 shadow-sm hover:shadow-md transition-all min-w-[180px]`}>
      <Handle type="target" position={Position.Top}  id="top" className="w-2 h-2 bg-zinc-400" />
    <Handle type="target" position={Position.Left} id="left" className="opacity-0 group-hover:opacity-100 bg-pink-500" />
      
      <div className="flex items-center gap-3">
        <div 
          onClick={() => data.photoURL && data.onZoom(data.photoURL, data.label)}
          className="w-12 h-12 rounded-full border-2 border-zinc-100 overflow-hidden cursor-zoom-in"
        >
          {data.photoURL ? (
            <img src={data.photoURL} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-500">
              {data.gender === 'M' ? '♂' : '♀'}
            </div>
          )}
        </div>
        <span className="text-sm font-bold dark:text-zinc-100">{data.label}</span>
       <div 
          onClick={(e) => {
            e.stopPropagation();
            const member = getMember();
            if (member) openNoteModal(member);
          }}
          className={`absolute cursor-pointer top-3 right-3 p-1 rounded-full transition-colors 
            ${hasNote ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-zinc-300 hover:text-zinc-500'}`}
        >
          <MessageCircle size={18} fill={hasNote ? "currentColor" : "none"} />
        </div>
      </div>

      {
        data.canEdit && (
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button onClick={() => openDeleteModal(id)} className="p-1 cursor-pointer text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          <button onClick={() => {
              const member = getMember();
              if (member) openEditModal(member);
            }} className="p-1 text-zinc-500 cursor-pointer hover:bg-zinc-100 rounded"><Edit2 size={14} /></button>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onToggleCollapse?.(id); // replie/déplie + sauvegarde (page.tsx)
                }}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  isCollapsed
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {isCollapsed ? '▶ Déplier' : '▼ Replier'}
              </button>
            )}
        </div>
        
        <div className="flex gap-1">
          {/* Si c'est un homme, on propose d'ajouter une épouse */}
          {data.gender === 'M' && (
            <button 
              onClick={() => data.onAddSpouse(id)}
              className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded hover:bg-pink-100"
            >
              + Épouse
            </button>
          )}
          <button 
            onClick={() => openModal(id)}
            className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100"
          >
            + Enfant
          </button>
        </div>
      </div>
        )
      }

      <Handle type="source" position={Position.Right} id="right" className="opacity-0 group-hover:opacity-100 bg-pink-500" />

      <Handle type="source" id='bottom' position={Position.Bottom} className="w-2 h-2 bg-zinc-400" />
    </div>
  );
});

// Optionnel: Donner un nom pour le debugging
FamilyNode.displayName = 'FamilyNode';
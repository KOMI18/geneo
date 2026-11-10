'use client';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { use } from "react";
import { FamilyNode, FamilyNodeData } from '@/components/canvas/FamilyNode';
import { useSearchParams } from 'next/navigation';
import { CollapsedBubble } from '@/components/canvas/CollapsedBubble';
import { AddMemberModal } from '@/components/canvas/AddMemberModal';
import { useTreeStore } from '@/store/useTreeStore';
import { useTreeData } from '@/hooks/useTreeData';
import { useTreeRole } from '@/hooks/useTreeRole';
import { useAuth } from '@/hooks/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FamilyTree } from '@/types/tree';
import { Dialog, DialogContent, DialogHeader, DialogTitle  } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { EditMemberModal } from '@/components/canvas/EditMemberModal';
import { DeleteConfirmModal } from '@/components/canvas/DeleteConfirmModal';
import { useCollapseTree } from '@/hooks/useCollapseTree';
import { CustomEdge } from '@/components/canvas/CustomEdge';
import { MemberNoteModal } from '@/components/canvas/MemberNoteModal';
import { TreeBackground } from '@/components/canvas/TreeBackground';
import { BackgroundPicker } from '@/components/canvas/BackgroundPicker';
import { TreeLegend } from '@/components/canvas/TreeLegend';
import { buildFamilyIndex } from '@/lib/treeGraph';

const edgeTypes = { customEdge: CustomEdge };
const DEFAULT_POSITION = { x: 400, y: 100 };
const nodeTypes = {
  familyNode: FamilyNode,
  collapsedBubble: CollapsedBubble,
};

export default function TreePage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = use(params);
  const { user } = useAuth();
  const [treeDoc, setTreeDoc] = useState<FamilyTree | null>(null);
  const searchParams = useSearchParams();
  const forcedViewer = searchParams?.get('role') === 'viewer';
 const isAnonymous = user?.isAnonymous ?? false;
   useEffect(() => {
    const unsub = onSnapshot(doc(db, 'trees', treeId), (snap) => {
      if (snap.exists()) setTreeDoc({ id: snap.id, ...snap.data() } as FamilyTree);
    });
    return () => unsub();
  }, [treeId]);

  const role = useTreeRole(treeDoc);
  const canEdit = !forcedViewer && !isAnonymous && (role === 'owner' || role === 'editor');
  
  // ─── Firebase ──────────────────────────────────────────────────────────────
  const {
    members,
    edges: dbEdges,
    loading,
    addMember,
    addEdge: addDbEdge,
    deleteMember,
    updateMember,
    saveCollapsedIds,
    saveMemberPositions,
  } = useTreeData(treeId);

  // ─── Store ─────────────────────────────────────────────────────────────────
  const { openModal, isSpouseMode, setMembers, setEdges: setStoreEdges } = useTreeStore();

  // ─── État local canvas ─────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; name: string } | null>(null);
  const nodesRef = useRef<Node[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const handleZoom = useCallback(
    (url: string, name: string) => setZoomedImage({ url, name }),
    []
  );

  const handleAddSpouse = useCallback(
    (id: string) => openModal(id, true),
    [openModal]
  );

  // Replier / déplier une descendance, puis enregistrer l'état dans l'arbre
  const handleToggleCollapse = useCallback(
    (parentId: string) => {
      useTreeStore.getState().toggleCollapse(parentId);
      // Un lecteur n'a pas le droit d'écrire : le repli reste alors local
      saveCollapsedIds(parentId).catch(() => {});
    },
    [saveCollapsedIds]
  );

  // ─── Sync Firestore → canvas nodes ────────────────────────────────────────
  // On réutilise les nodes inchangés : seul le membre modifié est redessiné.
  useEffect(() => {
    setNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]));
      return members.map((member) => {
        const position = member.position ?? DEFAULT_POSITION;
        const photoURL = member.photoURL ?? null;
        const old = prevById.get(member.id);

        if (old) {
          const d = old.data as FamilyNodeData;
          // Pendant un déplacement en cours, la position locale fait foi
          const samePosition =
            old.dragging || (old.position.x === position.x && old.position.y === position.y);
          const sameData =
            d.label === member.label &&
            d.gender === member.gender &&
            d.photoURL === photoURL &&
            d.canEdit === canEdit;
          if (samePosition && sameData) return old;
          return {
            ...old,
            position: samePosition ? old.position : position,
            data: sameData ? old.data : { ...d, label: member.label, gender: member.gender, photoURL, canEdit },
          };
        }

        return {
          id: member.id,
          type: 'familyNode',
          position,
          data: {
            label: member.label,
            id: member.id,
            gender: member.gender,
            canEdit,
            photoURL,
            onZoom: handleZoom,
            onAddSpouse: handleAddSpouse,
            onToggleCollapse: handleToggleCollapse,
          } satisfies FamilyNodeData,
        };
      });
    });
    setMembers(members);
  }, [members, canEdit, handleZoom, handleAddSpouse, handleToggleCollapse, setMembers]);

  // ─── Sync Firestore → canvas edges ────────────────────────────────────────
  useEffect(() => {
    const canvasEdges: Edge[] = dbEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? 'bottom',
      targetHandle: e.targetHandle ?? 'top',
      type: "customEdge",
      data: { type: e.type },
    }));
    setEdges(canvasEdges);
    setStoreEdges(dbEdges);
  }, [dbEdges, setStoreEdges]);

  const family = useMemo(() => buildFamilyIndex(dbEdges), [dbEdges]);
  const { nodes: visibleNodes, edges: visibleEdges } = useCollapseTree(nodes, edges);

  const finalNodes = useMemo(
    () =>
      visibleNodes.map((n) =>
        n.type === 'collapsedBubble'
          ? { ...n, data: { ...n.data, onExpand: handleToggleCollapse } }
          : n
      ),
    [visibleNodes, handleToggleCollapse]
  );

  // ─── Handlers ReactFlow ────────────────────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Les bulles « +N » sont calculées, pas stockées : leurs changements ne nous concernent pas
      const own = changes.filter((c) => !('id' in c && c.id.startsWith('bubble-')));
      if (own.length > 0) setNodes((nds) => applyNodeChanges(own, nds));
    },
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: 'smoothstep', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
          eds
        )
      ),
    []
  );

  // ─── Déplacement : une seule écriture groupée au relâchement ──────────────
  const dragStart = useRef(new Map<string, { x: number; y: number }>());

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, _node: Node, dragged: Node[]) => {
      dragStart.current = new Map(dragged.map((n) => [n.id, { ...n.position }]));
    },
    []
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, dragged: Node[]) => {
      if (!canEdit) return;
      const { collapsedIds } = useTreeStore.getState();
      const moved: Record<string, { x: number; y: number }> = {};
      const followers: Record<string, { x: number; y: number }> = {};
      const draggedIds = new Set(dragged.map((n) => n.id));

      for (const node of dragged) {
        if (node.type !== 'familyNode') continue;
        const start = dragStart.current.get(node.id);
        const dx = start ? node.position.x - start.x : 0;
        const dy = start ? node.position.y - start.y : 0;
        if (start && dx === 0 && dy === 0) continue; // simple clic : rien à enregistrer
        moved[node.id] = { x: node.position.x, y: node.position.y };

        // Parent replié : sa descendance masquée se déplace avec lui
        if (start && collapsedIds.has(node.id)) {
          for (const id of family.getDescendants(node.id)) {
            if (draggedIds.has(id) || followers[id]) continue;
            const current = nodesRef.current.find((n) => n.id === id);
            if (current) {
              followers[id] = { x: current.position.x + dx, y: current.position.y + dy };
            }
          }
        }
      }

      if (Object.keys(followers).length > 0) {
        setNodes((nds) =>
          nds.map((n) => (followers[n.id] ? { ...n, position: followers[n.id] } : n))
        );
      }

      saveMemberPositions({ ...followers, ...moved }).catch((error) => {
        console.error('Erreur lors de la sauvegarde des positions :', error);
      });
    },
    [canEdit, family, saveMemberPositions]
  );

  // ─── Ajouter un membre ─────────────────────────────────────────────────────
  const handleAdd = useCallback(
    async (parentId: string, name: string, gender: 'M' | 'F', photo?: string) => {
      const isSpouseAdd = isSpouseMode;

      // Calcul de la position selon le parent
      const parentNode = nodes.find((n) => n.id === parentId);
      let position = { x: 400, y: 100 };
      let sourceHandle = 'bottom';
      let targetHandle = 'top';

      if (parentNode) {
        if (isSpouseAdd) {
          position = { x: parentNode.position.x + 280, y: parentNode.position.y };
          sourceHandle = 'right';
          targetHandle = 'left';
        } else {
          position = { x: parentNode.position.x, y: parentNode.position.y + 180 };
        }
      }

      // 1. Créer le membre dans Firestore (avec position)
      const newId = await addMember({ 
          label: name, 
          gender, 
          photoURL: photo || null,
          position 
        });

      // 2. Créer l'edge dans Firestore si parent existe
      if (parentId && parentId !== 'root') {
        await addDbEdge({
          source: parentId,
          target: newId,
          sourceHandle,
          targetHandle,
          type: isSpouseAdd ? 'spouse' : 'child',
        });
      }
    },
    [nodes, isSpouseMode, addMember, addDbEdge]
  );

  

  if (loading || !treeDoc) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#080808]">
        <p className="text-zinc-400 animate-pulse">Chargement de l'arbre...</p>
      </div>
    );
  }

  return (
    <>
    

      <div className="w-full h-full relative bg-white dark:bg-[#080808]">
        {/* Écran vide */}
        {nodes.length === 0  && canEdit  && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button
              onClick={() => openModal('root')}
              className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl hover:border-orange-500 bg-white dark:bg-zinc-900 transition-all"
            >
              <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center text-white">
                <Plus size={32} />
              </div>
              <div className="text-center">
                <h3 className="dark:text-white font-bold">Commencer l'arbre</h3>
                <p className="text-sm text-zinc-500 font-normal">Ajoutez le premier membre</p>
              </div>
            </button>
          </div>
        )}

        <ReactFlow
          nodes={finalNodes}
          edges={visibleEdges}
           edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          snapToGrid
          
          snapGrid={[20, 20]}
          fitView={true}
           minZoom={0.1}      
          maxZoom={2}        
          fitViewOptions={{
            padding: 0.2,    
            includeHiddenNodes: false,
          }}
        >
          <TreeBackground />
          <BackgroundPicker />
          <TreeLegend />
          <Controls showFitView={true} /> 
        </ReactFlow>
      </div>

      {/* Zoom photo */}
      
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {/* Ajout du Header et du Title obligatoire */}
          <DialogHeader className="sr-only">
            <DialogTitle>{zoomedImage?.name}</DialogTitle>
          </DialogHeader>

          {zoomedImage && (
            <div className="relative flex flex-col items-center gap-4">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.name}
                className="max-h-[80vh] w-auto rounded-lg shadow-2xl border-4 border-white dark:border-zinc-800"
              />
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                {zoomedImage.name}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddMemberModal onAdd={handleAdd} isSpouseMode={isSpouseMode}   />
      <EditMemberModal onSave={async (id, updates, newPhoto) => {
          await updateMember(id, updates, newPhoto);
        }}
        
      />
            <MemberNoteModal canEdit={canEdit} />
      
      <DeleteConfirmModal onConfirm={async (id) => {
          await deleteMember(id);
        }}
      
      />
    </>
  );
}
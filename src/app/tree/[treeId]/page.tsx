'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
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
import { AddMemberModal } from '@/components/canvas/AddMemberModal';
import { useTreeStore } from '@/store/useTreeStore';
import { useTreeData } from '@/hooks/useTreeData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { EditMemberModal } from '@/components/canvas/EditMemberModal';
import { DeleteConfirmModal } from '@/components/canvas/DeleteConfirmModal';
const nodeTypes = { familyNode: FamilyNode };

export default function TreePage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = use(params);

  // ─── Firebase ──────────────────────────────────────────────────────────────
  const {
    members,
    edges: dbEdges,
    loading,
    addMember,
    addEdge: addDbEdge,
    deleteMember,
    updateMember,
  } = useTreeData(treeId);

  // ─── Store ─────────────────────────────────────────────────────────────────
  const { openModal, isSpouseMode, setMembers, setEdges: setStoreEdges } = useTreeStore();

  // ─── État local canvas ─────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; name: string } | null>(null);

  // ─── Sync Firestore → canvas nodes ────────────────────────────────────────
  useEffect(() => {
    const canvasNodes: Node[] = members.map((member) => ({
      id: member.id,
      type: 'familyNode',
      // On récupère la position sauvegardée ou on place par défaut
      position: (member as any).position ?? { x: 400, y: 100 },
      data: {
        label: member.label,
        id: member.id,
        gender: member.gender,
        photoURL: member.photoURL,
        onZoom: (url: string, name: string) => setZoomedImage({ url, name }),
        onAddSpouse: handleAddSpouse,
      } satisfies FamilyNodeData,
    }));
    setNodes(canvasNodes);
    setMembers(members);
  }, [members]);

  // ─── Sync Firestore → canvas edges ────────────────────────────────────────
  useEffect(() => {
    const canvasEdges: Edge[] = dbEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: (e as any).sourceHandle ?? 'bottom',
      targetHandle: (e as any).targetHandle ?? 'top',
      type: e.type === 'spouse' ? 'straight' : 'smoothstep',
      animated: e.type !== 'spouse',
      style: {
        stroke: e.type === 'spouse' ? '#ec4899' : '#f97316',
        strokeWidth: 3,
      },
    }));
    setEdges(canvasEdges);
    setStoreEdges(dbEdges);
  }, [dbEdges]);

  // ─── Handlers ReactFlow ────────────────────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
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

  // ─── Sauvegarder position après drag ──────────────────────────────────────
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateMember(node.id, { position: node.position } as any);
    },
    [updateMember]
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
      const newId = await addMember(
        { label: name, gender, photoURL: null, position } as any,
        photo
      );

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

  

  // ─── Ajouter épouse ────────────────────────────────────────────────────────
  const handleAddSpouse = useCallback(
    (id: string) => openModal(id, true),
    [openModal]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#080808]">
        <p className="text-zinc-400 animate-pulse">Chargement de l'arbre...</p>
      </div>
    );
  }

  return (
    <>
    

      <div className="w-full h-full relative">
        {/* Écran vide */}
        {nodes.length === 0 && (
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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          snapToGrid
          snapGrid={[20, 20]}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#998c70ff" />
          <Controls />
        </ReactFlow>
      </div>

      {/* Zoom photo */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none flex items-center justify-center">
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

      <AddMemberModal onAdd={handleAdd} isSpouseMode={isSpouseMode} />
      <EditMemberModal onSave={async (id, updates, newPhoto) => {
          await updateMember(id, updates, newPhoto);
        }}
      />
      <DeleteConfirmModal onConfirm={async (id) => {
          await deleteMember(id);
        }}
      />
    </>
  );
}
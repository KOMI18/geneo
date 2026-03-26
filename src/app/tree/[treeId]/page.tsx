'use client';
import React, { useState, useCallback } from 'react';
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
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from '@/components/canvas/FamilyNode';
import { AddMemberModal } from '@/components/canvas/AddMemberModal';
import { useTreeStore } from '@/store/useTreeStore';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const nodeTypes = { familyNode: FamilyNode };

export default function TreePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nextAdditionIsSpouse, setNextAdditionIsSpouse] = useState(false);
  const [edges, setEdges] = useState<Edge[]>([]);
  const openModal = useTreeStore((state) => state.openModal);
  const [zoomedImage, setZoomedImage] = useState<{url: string, name: string} | null>(null);
  // --- HANDLERS REACT FLOW ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } }, eds)),
    []
  );

  // --- LOGIQUE LOCALE (AJOUT/SUPPRESSION/MODIF) ---
  const handleAddSpouse = useCallback((id: string) => {
    setNextAdditionIsSpouse(true); // Indique que c'est un mariage
    openModal(id); // Ouvre la modal
  }, [openModal]);
  const addMemberLocal = (
    parentId: string | null, 
    name: string, 
    gender: 'M' | 'F', 
    photoURL?: string,
    isSpouseAdd: boolean = false
  ) => {
    const newNodeId = `node-${Date.now()}`;
    const parentNode = nodes.find(n => n.id === parentId);

    // 1. Définir position et handles
    let position = { x: 400, y: 100 };
    let sourceHandle = 'bottom'; 
    let targetHandle = 'top';    

    if (parentNode) {
      if (isSpouseAdd) {
        // Épouse : à droite, lien Right -> Left
        position = { x: parentNode.position.x + 280, y: parentNode.position.y };
        sourceHandle = 'right';
        targetHandle = 'left';
      } else {
        // Enfant : en dessous, lien Bottom -> Top
        position = { x: parentNode.position.x, y: parentNode.position.y + 180 };
        sourceHandle = 'bottom';
        targetHandle = 'top';
      }
    }

    // 2. Création du Node
    const newNode: Node = {
      id: newNodeId,
      type: 'familyNode',
      position,
      data: { 
        label: name, 
        id: newNodeId, 
        gender, 
        photoURL,
        onDelete: deleteNode,
        onEdit: editNode,
        onZoom: (url: string, name: string) => setZoomedImage({url, name}),
        onAddSpouse: handleAddSpouse
      },
    };

    // 3. Création du Edge (Vérifie bien que sourceHandle et targetHandle sont là)
    if (parentId) {
      const newEdge: Edge = {
        id: `e-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        sourceHandle: sourceHandle, // Très important pour les handles multiples
        targetHandle: targetHandle, // Très important pour les handles multiples
        type: isSpouseAdd ? 'straight' : 'smoothstep',
        animated: !isSpouseAdd,
        style: { 
          stroke: isSpouseAdd ? '#ec4899' : '#f97316', 
          strokeWidth: 3 
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setNodes((nds) => [...nds, newNode]);
  };
    // Dans TreePage.tsx, on ajoute une fonction spécifique pour le conjoint
    const deleteNode = (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    };

  const editNode = (id: string) => {
    const newName = prompt("Nouveau nom :"); // Simplifié pour le test
    if (newName) {
      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-zinc-50 dark:bg-[#080808]">
      <div className="absolute top-0 left-0 right-0 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center px-6 justify-between text-zinc-900 dark:text-zinc-100 italic font-bold">
        Geneo <span className="text-orange-300">.io</span>
      </div>

      <div className="w-full h-full pt-14 relative">
        {nodes.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button 
              onClick={() => openModal("root")}
              className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl hover:border-orange-500 bg-white dark:bg-zinc-900  transition-all"
            >
              <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center border-dashed  border-black justify-center text-white"><Plus size={32} /></div>
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
          nodeTypes={nodeTypes}
          snapToGrid snapGrid={[20, 20]} fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#998c70ff"  />
          <Controls />
        </ReactFlow>
      </div>
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
    <AddMemberModal 
        isSpouseMode={nextAdditionIsSpouse} 
        onAdd={(parentId, name, gender, photo) => {
          addMemberLocal(
            parentId === "root" ? null : parentId, 
            name, 
            gender, 
            photo,
            nextAdditionIsSpouse
          );
          setNextAdditionIsSpouse(false);
        }} 
      />
    </main>
  );
}

function setMode(arg0: { type: string; id: string; }) {
  throw new Error('Function not implemented.');
}

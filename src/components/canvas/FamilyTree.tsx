'use client';
import React, { useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection, // <-- Ajouté pour le type de params
  Edge,       // <-- Ajouté pour typer l'état
  Node        // <-- Ajouté pour typer l'état
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode, FamilyNodeData } from './FamilyNode';

const nodeTypes = {
  familyNode: FamilyNode,
};

export default function FamilyTree() {
  // On précise explicitement les types <Node<FamilyNodeData>[]> et <Edge[]>
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FamilyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // On type 'params' avec Connection pour corriger l'erreur implicite 'any'
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => 
      addEdge({ ...params, animated: true, style: { stroke: '#f97316' } }, eds)
    ),
    [setEdges]
  );

  return (
    <div className="w-full h-screen bg-zinc-50 dark:bg-[#0b0b0b]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundImage: "url(/back.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"

        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2, stroke: '#94a3b8' }
        }}
      >
        <Background 
          variant={BackgroundVariant.Cross} 
          gap={20} 
          size={1} 
          color="#94b89fff" 
         style={{ 
          opacity: 0.9, 
          backgroundImage: "url(/back.jpg)",
          backgroundSize: "cover", 
          backgroundPosition: "center"
        }}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
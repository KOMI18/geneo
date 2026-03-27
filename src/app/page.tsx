'use client';

import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { TreeDeciduous, Users, Share2, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

// Importation de XFlow (@xyflow/react)
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionLineType,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── CONFIGURATION DE LA MINI DÉMO XFLOW ────────────────────────────────────

// Style personnalisé pour les nœuds de la démo
const nodeStyles = {
  background: '#fff',
  border: '1px solid #777',
  borderRadius: '8px',
  padding: '10px',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

// Nœuds initiaux pour la démo (max 4)
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Jean Traoré (Père)' },
    position: { x: 150, y: 0 },
    style: { ...nodeStyles, borderColor: '#ea580c', color: '#ea580c', fontWeight: 'bold' },
    sourcePosition: Position.Bottom,
  },
  {
    id: '2',
    data: { label: 'Moussa Traoré (Moi)' },
    position: { x: 0, y: 100 },
    style: nodeStyles,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
  },
  {
    id: '3',
    data: { label: 'Awa Traoré (Sœur)' },
    position: { x: 250, y: 100 },
    style: nodeStyles,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Enfant de Moussa' },
    position: { x: 0, y: 200 },
    style: { ...nodeStyles, background: '#fff7ed', borderColor: '#fdba74' },
    targetPosition: Position.Top,
  },
];

// Arêtes (relations) initiales
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: ConnectionLineType.SmoothStep, animated: true, style: { stroke: '#ea580c' } },
  { id: 'e1-3', source: '1', target: '3', type: ConnectionLineType.SmoothStep, animated: true, style: { stroke: '#ea580c' } },
  { id: 'e2-4', source: '2', target: '4', type: ConnectionLineType.SmoothStep },
];

// Composant de la mini démo XFlow
function MiniTreeDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[300px] w-full md:h-[400px] bg-white rounded-2xl  overflow-hidden relative">
      {/* Badge "Démo Interactive" */}
      <div className="absolute top-3 left-3 z-10 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1  flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5" />
        ESSAYEZ DE BOUGER LES NŒUDS
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
        className="bg-gray-50/50"
      >
        <Background color="#f1f5f9" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-white border border-gray-100 rounded-lg shadow-md" />
      </ReactFlow>
    </div>
  );
}

// ─── COMPOSANTS DE LA LANDING PAGE ──────────────────────────────────────────

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100   ">
    <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
      <Icon className="h-6 w-6 text-orange-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
  </div>
);

// ─── PAGE PRINCIPALE ───────────────────────────────────────────────────────

const LandingPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Geneo | Votre histoire familiale, visualisée en un clic</title>
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900">
        
        {/* Nav Bar Simple */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="logo">
              <img src="/logo/logo.svg" className="w-20 h-20" alt="Logo de Geneo.io" />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                Connexion
              </Link>
              <Link href="/register" className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-700 transition-all shadow-md shadow-orange-200 flex items-center gap-2">
                Créer mon arbre <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO SECTION avec MINI DÉMO XFLOW */}
        <header className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Texte Hero */}
            <div className="space-y-6 text-center md:text-left">
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-950 leading-tight">
                Donnez vie à votre <span className="text-orange-600">histoire familiale</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
                Visualisez, construisez et partagez votre arbre généalogique comme jamais auparavant. Geneo rend l'exploration de vos racines simple, interactive et sécurisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link href="/register" className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                  Démarrer mon arbre gratuitement <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="#features" className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  En savoir plus
                </Link>
              </div>
            </div>

            {/* Mini Démo XFlow */}
            <div className="w-full">
              <MiniTreeDemo />
            </div>
          </div>
        </header>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest">Fonctionnalités clé</h2>
              <p className="mt-4 text-4xl font-extrabold text-gray-950">Tout pour documenter votre héritage</p>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Geneo combine la puissance de la visualisation dynamique avec des outils de collaboration avancés pour une expérience généalogique unique.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={TreeDeciduous}
                title="Visualisation Dynamique"
                description="Construisez votre arbre par simple glisser-déposer. XFlow permet une navigation fluide et intuitive dans votre histoire."
              />
              <FeatureCard 
                icon={Users}
                title="Collaboration Familiale"
                description="Invitez vos proches à contribuer. Complétez ensemble les branches manquantes et partagez vos découvertes."
              />
              <FeatureCard 
                icon={ShieldCheck}
                title="Sécurité & Confidentialité"
                description="Vos données familiales sont précieuses. Contrôlez qui peut voir ou modifier votre arbre grâce à une gestion des permissions granulaire."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-orange-600 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Prêt à explorer vos racines ?</h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers de familles qui utilisent Geneo pour préserver leur histoire. C'est gratuit pour démarrer !
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl shadow-orange-700/50">
              Créer mon compte Geneo <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* FOOTER SIMPLE */}
        <footer className="bg-gray-950 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <TreeDeciduous className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">Geneo</span>
            </div>
            <p className="text-sm">© 2026 Geneo Inc. Tous droits réservés.</p>
            <p className="text-xs italic">Propulsé par la technologie, enraciné dans la famille.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;
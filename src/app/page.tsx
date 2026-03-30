'use client';

import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, TreeDeciduous, Users, ShieldCheck, Share2, ChevronDown, Star, Menu, X } from 'lucide-react';
import {
  ReactFlow,
  Background,
  ConnectionLineType,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const demoNodes: Node[] = [
  {
    id: '1',
    data: { label: '👴 Ibrahim Koné' },
    position: { x: 160, y: 0 },
    style: { background: '#ffb86a', color: '#1a1208', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 24px rgba(255,184,106,0.35)' },
    sourcePosition: Position.Bottom, type: 'input',
  },
  {
    id: '2', data: { label: '👨 Moussa Koné' }, position: { x: 20, y: 110 },
    style: { background: '#fffaf4', color: '#c47820', border: '1.5px solid #ffb86a', borderRadius: '12px', padding: '10px 18px', fontWeight: '600', fontSize: '13px' },
    sourcePosition: Position.Bottom, targetPosition: Position.Top,
  },
  {
    id: '3', data: { label: '👩 Awa Koné' }, position: { x: 260, y: 110 },
    style: { background: '#fffaf4', color: '#c47820', border: '1.5px solid #ffb86a', borderRadius: '12px', padding: '10px 18px', fontWeight: '600', fontSize: '13px' },
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: '4', data: { label: '👶 Petit Ibra' }, position: { x: 20, y: 220 },
    style: { background: '#fff0dc', color: '#c47820', border: '1.5px dashed #ffb86a', borderRadius: '12px', padding: '10px 18px', fontSize: '13px' },
    targetPosition: Position.Top, type: 'output',
  },
  {
    id: '5', data: { label: '👶 Fatou' }, position: { x: 260, y: 220 },
    style: { background: '#fff0dc', color: '#c47820', border: '1.5px dashed #ffb86a', borderRadius: '12px', padding: '10px 18px', fontSize: '13px' },
    targetPosition: Position.Top, type: 'output',
  },
];

const demoEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: ConnectionLineType.SmoothStep, animated: true, style: { stroke: '#ffb86a', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', type: ConnectionLineType.SmoothStep, animated: true, style: { stroke: '#ffb86a', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', type: ConnectionLineType.SmoothStep, style: { stroke: '#ffd9a8', strokeWidth: 1.5 } },
  { id: 'e3-5', source: '3', target: '5', type: ConnectionLineType.SmoothStep, style: { stroke: '#ffd9a8', strokeWidth: 1.5 } },
];

function MiniTreeDemo() {
  const [nodes, , onNodesChange] = useNodesState(demoNodes);
  const [edges, , onEdgesChange] = useEdgesState(demoEdges);
  return (
    <div style={{ height: '300px', width: '100%', background: '#fffaf4' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView attributionPosition="bottom-right" panOnDrag={false} zoomOnScroll={false}>
        <Background color="#fff0dc" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 16);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const LandingPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Geneo — Votre histoire familiale, vivante</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --primary: #ffb86a;
          --primary-dark: #c47820;
          --primary-light: #ffd9a8;
          --cream: #fffaf4;
          --cream-dark: #fff0dc;
          --ink: #1a1208;
          --muted: #8b7355;
          --gold: #ffb86a;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); overflow-x: hidden; }
        .display { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }
        .float-anim { animation: float 4s ease-in-out infinite; }

        .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,250,244,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid var(--cream-dark); padding: 0 5vw; }
        .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--primary-dark); text-decoration: none; }
        .nav-logo em { color: var(--primary); font-style: italic; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { font-size: 14px; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--primary-dark); }
        .nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; color: var(--ink); padding: 4px; }

        .mobile-menu { display: none; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--primary); color: var(--ink);
          padding: 13px 26px; border-radius: 100px;
          font-weight: 600; font-size: 15px; text-decoration: none;
          transition: all 0.2s; box-shadow: 0 4px 20px rgba(255,184,106,0.4);
          white-space: nowrap;
        }
        .btn-primary:hover { background: var(--primary-dark); color: white; transform: translateY(-1px); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: var(--primary-dark);
          padding: 13px 26px; border-radius: 100px;
          font-weight: 500; font-size: 15px; text-decoration: none;
          border: 1.5px solid var(--primary); transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: var(--cream-dark); }

        .tag { display: inline-block; background: var(--cream-dark); color: var(--primary-dark); font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 18px; }
        .divider { width: 56px; height: 3px; background: var(--primary); border-radius: 2px; margin: 14px 0 20px; }
        .grain { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; border-radius: inherit; }

        .hero { max-width: 1200px; margin: 0 auto; padding: 72px 5vw 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-stats { margin-top: 44px; display: flex; gap: 28px; flex-wrap: wrap; }
        .hero-visual { position: relative; }
        .hero-blob { position: absolute; top: -40px; right: -40px; width: 280px; height: 280px; background: var(--cream-dark); border-radius: 50%; z-index: 0; }
        .hero-badge { position: absolute; bottom: -18px; left: -18px; background: white; border-radius: 16px; padding: 13px 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 12px; z-index: 2; }

        .stats-band { background: var(--primary-dark); padding: 56px 5vw; margin: 40px 0; }
        .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

        .features-section { max-width: 1200px; margin: 0 auto; padding: 80px 5vw; }
        .features-grid-top { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 20px; }
        .features-grid-bottom { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .feature-card { background: white; border: 1px solid var(--cream-dark); border-radius: 20px; padding: 32px 28px; transition: all 0.3s; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(255,184,106,0.15); border-color: var(--primary); }
        .feature-card-dark { background: var(--primary-dark); color: white; position: relative; overflow: hidden; }
        .icon-wrap { width: 50px; height: 50px; border-radius: 14px; background: var(--cream-dark); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; color: var(--primary-dark); }

        .how-section { background: var(--cream-dark); padding: 80px 5vw; }
        .how-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .step { display: flex; gap: 22px; align-items: flex-start; }
        .step-num { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 20px; color: var(--primary-dark); flex-shrink: 0; }

        .testimonials-section { max-width: 1200px; margin: 0 auto; padding: 80px 5vw; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .testimonial { background: white; border-radius: 20px; padding: 28px; border: 1px solid var(--cream-dark); }

        .cta-section { margin: 0 4vw 72px; border-radius: 28px; background: var(--primary-dark); padding: 72px 5vw; text-align: center; position: relative; overflow: hidden; }

        .footer { background: var(--ink); padding: 56px 5vw 36px; }
        .footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 56px; margin-bottom: 44px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

        /* ── RESPONSIVE ─────────────────────────────────────────────── */

        @media (max-width: 1024px) {
          .hero { gap: 48px; padding: 56px 5vw 48px; }
          .features-grid-top { grid-template-columns: 1fr; }
          .how-inner { gap: 48px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-mobile-btn { display: flex; }

          .mobile-menu {
            display: block;
            position: fixed; top: 68px; left: 0; right: 0; bottom: 0;
            background: var(--cream);
            z-index: 99;
            padding: 36px 6vw;
            transform: translateX(100%);
            transition: transform 0.28s ease;
            overflow-y: auto;
          }
          .mobile-menu.open { transform: translateX(0); }
          .mobile-nav-links { display: flex; flex-direction: column; gap: 6px; margin-bottom: 32px; }
          .mobile-nav-links a { font-size: 22px; font-weight: 500; color: var(--ink); text-decoration: none; padding: 12px 0; border-bottom: 1px solid var(--cream-dark); display: block; }
          .mobile-nav-btns { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
          .mobile-nav-btns a { text-align: center; justify-content: center; width: 100%; }

          .hero { grid-template-columns: 1fr; gap: 36px; padding: 44px 5vw 36px; }
          .hero-blob { display: none; }
          .hero-badge { display: none; }
          .hero-btns { flex-direction: column; }
          .hero-btns a { text-align: center; justify-content: center; }
          .hero-stats { gap: 20px; }

          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .stats-band { padding: 40px 5vw; margin: 24px 0; }

          .features-grid-top { grid-template-columns: 1fr; }
          .features-grid-bottom { grid-template-columns: 1fr; }
          .features-section { padding: 56px 5vw; }

          .how-inner { grid-template-columns: 1fr; gap: 36px; }
          .how-section { padding: 56px 5vw; }
          .how-visual { display: none; }

          .testimonials-grid { grid-template-columns: 1fr; }
          .testimonials-section { padding: 56px 5vw; }

          .cta-section { margin: 0 3vw 48px; padding: 52px 5vw; border-radius: 20px; }

          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer { padding: 44px 5vw 28px; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
          .hero-stats { flex-direction: column; gap: 14px; }
          .btn-primary, .btn-ghost { width: 100%; justify-content: center; padding: 13px 20px; }
          .hero { padding: 36px 5vw 28px; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
               <div className="logo">
          <img src="/logo/logo.svg" className="w-20 h-20" alt="Logo de Geneo.io" />
        </div>
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#how" className="nav-link">Comment ça marche</a>
            <a href="#testimonials" className="nav-link">Témoignages</a>
            <Link href="/login" className="nav-link">Connexion</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Commencer <ArrowRight size={14} />
            </Link>
          </div>
          <button className="nav-mobile-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-nav-links">
          <a href="#features" onClick={() => setMenuOpen(false)}>Fonctionnalités</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Témoignages</a>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Connexion</Link>
        </div>
        <div className="mobile-nav-btns">
          <Link href="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>
            Créer mon arbre gratuitement <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div>
          {/* <div className="tag delay-1 fade-up">Arbre généalogique collaboratif</div> */}
          <h1 className="display delay-2 fade-up" style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.08, fontWeight: 900, marginBottom: '20px' }}>
            Donnez vie à votre{' '}
            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>histoire familiale</em>.
          </h1>
          <p className="delay-3 fade-up" style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '34px', maxWidth: '460px' }}>
            Visualisez, construisez et partagez votre arbre généalogique. Geneo rend l'exploration de vos racines simple, interactive et sécurisée.
          </p>
          <div className="hero-btns delay-3 fade-up">
            <Link href="/register" className="btn-primary">
              Créer mon arbre gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#how" className="btn-ghost">
              Comment ça marche <ChevronDown size={16} />
            </a>
          </div>
          <div className="hero-stats">
            {[['2 400+', 'familles actives'], ['18 000+', 'membres ajoutés'], ['4.9★', 'note moyenne']].map(([val, label]) => (
              <div key={label}>
                <div className="display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-dark)' }}>{val}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--cream-dark)' }}>
              <div style={{ background: 'var(--primary-dark)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {['#ff6b6b', '#ffd93d', '#6bcb77'].map(c => (
                  <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
                ))}
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginLeft: '6px', fontFamily: 'monospace' }}>geneo.io/tree/famille-traore</span>
              </div>
              <MiniTreeDemo />
            </div>
          </div>
          <div className="hero-badge">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>🌳</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Nouveau membre ajouté</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Fatou Traoré — il y a 2 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────────── */}
      <section className="stats-band">
        <div className="stats-grid">
          {[
            { n: 2400, suffix: '+', label: 'Familles actives' },
            { n: 18000, suffix: '+', label: 'Membres documentés' },
            { n: 95, suffix: '%', label: 'Satisfaction' },
            { n: 12, suffix: ' pays', label: 'Communautés' },
          ].map(({ n, suffix, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, color: 'var(--primary)' }}>
                <Counter target={n} suffix={suffix} />
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="features-section">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div className="tag">Fonctionnalités</div>
          <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
            Tout pour documenter<br />votre héritage
          </h2>
        </div>
        <div className="features-grid-top">
          <div className="feature-card feature-card-dark">
            <div className="grain" />
            <div style={{ position: 'relative' }}>
              <div className="icon-wrap" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--primary)' }}>
                <TreeDeciduous size={22} />
              </div>
              <h3 className="display" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'white' }}>Visualisation dynamique</h3>
              <div className="divider" />
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, fontSize: '15px' }}>
                Construisez votre arbre par simple glisser-déposer. Naviguez fluidement dans des arbres de centaines de membres, repliez les branches pour gagner de l'espace.
              </p>
              <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Drag & Drop', 'Collapse branches', 'Zoom infini', 'Photos'].map(f => (
                  <span key={f} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', fontSize: '12px', padding: '5px 13px', borderRadius: '100px', fontWeight: 500 }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="feature-card">
              <div className="icon-wrap"><Users size={20} /></div>
              <h3 className="display" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Collaboration familiale</h3>
              <div className="divider" />
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '14px' }}>Invitez vos proches en tant qu'éditeurs ou visiteurs. Construisez ensemble en temps réel.</p>
            </div>
            <div className="feature-card">
              <div className="icon-wrap"><ShieldCheck size={20} /></div>
              <h3 className="display" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Sécurité & Confidentialité</h3>
              <div className="divider" />
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '14px' }}>Contrôlez qui peut voir ou modifier votre arbre. Données privées et sécurisées.</p>
            </div>
          </div>
        </div>
        <div className="features-grid-bottom" style={{ marginTop: '20px' }}>
          {[
            { icon: Share2, title: 'Partage facile', desc: 'Un lien unique suffit. Vos proches accèdent à l\'arbre sans créer de compte.' },
            { icon: Star, title: 'Photos & Portraits', desc: 'Ajoutez des photos pour chaque membre. L\'arbre devient un album vivant de votre famille.' },
            { icon: TreeDeciduous, title: 'Arbres illimités', desc: 'Créez autant d\'arbres que vous voulez. Documentez plusieurs branches de votre famille.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="icon-wrap"><Icon size={20} /></div>
              <h3 className="display" style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px' }}>{title}</h3>
              <div className="divider" />
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '14px' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className="how-section">
        <div className="how-inner">
          <div>
            <div className="tag">Comment ça marche</div>
            <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, marginBottom: '40px', lineHeight: 1.15 }}>
              Votre arbre en 3 étapes simples
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {[
                { n: '1', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.' },
                { n: '2', title: 'Ajoutez vos membres', desc: 'Commencez par vous-même, puis ajoutez parents, enfants et conjoints avec leurs photos.' },
                { n: '3', title: 'Partagez avec votre famille', desc: 'Invitez vos proches par email ou lien. Construisez l\'arbre ensemble.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="step">
                  <div className="step-num">{n}</div>
                  <div>
                    <div className="display" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{title}</div>
                    <div style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '15px' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '40px' }}>
              <Link href="/register" className="btn-primary">Démarrer maintenant <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="how-visual">
            <div style={{ background: 'white', borderRadius: '22px', padding: '28px', boxShadow: '0 16px 64px rgba(196,120,32,0.12)', border: '1px solid var(--cream-dark)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="display" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-dark)' }}>Famille Koné</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>5 membres · Dernière modif. il y a 2h</div>
              </div>
              {[
                { emoji: '👴', name: 'Ibrahim Koné', role: 'Grand-père', color: '#c47820' },
                { emoji: '👨', name: 'Moussa Koné', role: 'Père', color: '#ffb86a' },
                { emoji: '👩', name: 'Awa Koné', role: 'Tante', color: '#ffb86a' },
                { emoji: '👶', name: 'Petit Ibra', role: 'Enfant', color: '#ffd9a8' },
              ].map(({ emoji, name, role, color }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px', borderRadius: '12px', marginBottom: '8px', background: 'var(--cream)', border: '1px solid var(--cream-dark)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', border: `2px solid ${color}40`, flexShrink: 0 }}>{emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{role}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                </div>
              ))}
              <div style={{ marginTop: '12px', padding: '11px', borderRadius: '12px', border: '1.5px dashed var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary-dark)', fontSize: '14px', fontWeight: 500 }}>
                <span>+</span> Ajouter un membre
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section id="testimonials" className="testimonials-section">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div className="tag">Témoignages</div>
          <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.1 }}>Ce que disent nos familles</h2>
        </div>
        <div className="testimonials-grid">
          {[
            { quote: "Geneo a transformé nos réunions familiales. Maintenant tout le monde peut voir et contribuer à notre histoire. C'est magique.", author: 'Aminata Diallo', origin: 'Dakar, Sénégal', emoji: '🇸🇳' },
            { quote: "J'ai documenté 4 générations de notre famille en moins d'une semaine. L'interface est tellement intuitive et belle.", author: 'Kofi Mensah', origin: 'Accra, Ghana', emoji: '🇬🇭' },
            { quote: "Le partage par lien est révolutionnaire. Mes oncles au village peuvent voir l'arbre sans créer de compte. Parfait !", author: 'Fatoumata Camara', origin: 'Conakry, Guinée', emoji: '🇬🇳' },
          ].map(({ quote, author, origin, emoji }) => (
            <div key={author} className="testimonial">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '18px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="var(--gold)" color="var(--gold)" />)}
              </div>
              <p style={{ color: 'var(--ink)', lineHeight: 1.75, fontSize: '15px', marginBottom: '20px', fontStyle: 'italic' }}>"{quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '18px', borderTop: '1px solid var(--cream-dark)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', flexShrink: 0 }}>{emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{author}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{origin}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="grain" />
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative' }}>
          <div className="display" style={{ fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '16px' }}>
            Prêt à explorer<br /><em style={{ color: 'var(--primary)' }}>vos racines ?</em>
          </div>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', margin: '0 auto 32px', maxWidth: '460px', lineHeight: 1.65 }}>
            Rejoignez des milliers de familles qui préservent leur histoire avec Geneo. C'est gratuit pour démarrer.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', color: 'var(--ink)', padding: '14px 32px', borderRadius: '100px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            Créer mon arbre gratuitement <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="display" style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '14px' }}>
              Geneo<span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>.io</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, fontSize: '14px', maxWidth: '280px' }}>
              Propulsé par la technologie, enraciné dans la famille. Documentez votre héritage pour les générations futures.
            </p>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Produit</div>
            {['Fonctionnalités', 'Tarifs', 'Sécurité', 'Roadmap'].map(l => (
              <div key={l} style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.52)', fontSize: '14px', textDecoration: 'none' }}>{l}</a></div>
            ))}
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Entreprise</div>
            {['À propos', 'Blog', 'Confidentialité', 'CGU'].map(l => (
              <div key={l} style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.52)', fontSize: '14px', textDecoration: 'none' }}>{l}</a></div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.26)' }}>© 2026 Geneo Inc. Tous droits réservés.</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.26)', fontStyle: 'italic' }}>Enraciné dans la famille 🌳</div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
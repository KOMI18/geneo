'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Fraunces } from 'next/font/google';
import {
  ArrowRight,
  BookOpenText,
  Images,
  Palette,
  Share2,
  ShieldCheck,
  TreeDeciduous,
  Users,
} from 'lucide-react';
import { fabricMotif, getTreeBackground, TREE_BACKGROUNDS } from '@/lib/treeBackgrounds';
import './landing.css';

// Titres : Fraunces (serif à taille optique). Texte courant : Geist, déjà chargée par le layout.
const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

// Tissus africains repris de l'espace de travail, aux couleurs de la page
const FABRICS = TREE_BACKGROUNDS.filter((p) => p.image);
const pageVars = {
  '--fabric-page': fabricMotif('ndop', '#c47820', 0.08), // fond général, très discret
  '--fabric-dark': fabricMotif('bogolan', '#fffaf4', 0.07), // sections sombres
  '--fabric-sand': fabricMotif('kuba', '#c47820', 0.07), // section sable
  '--fabric-kente': getTreeBackground('kente').image, // liseré tissé
} as CSSProperties;

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

// ─── Apparition au défilement : chaque bloc [data-reveal] entre une seule fois ──
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const show = (el: Element) => el.setAttribute('data-in', '');
    if (!('IntersectionObserver' in window)) {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

// ─── Compteur : affiche la valeur finale, puis la « compte » à l'entrée à l'écran ─
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1200, 1);
        setCount(Math.round(target * (1 - Math.pow(1 - t, 4)))); // ease-out
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);
  return (
    <span ref={ref}>
      {count.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
}

// ─── Démonstration : un arbre avec le même code couleur que l'application ─────
const MALE = '#60a5fa';
const FEMALE = '#f472b6';
const CARD_W = 150;
const CARD_H = 52;

const people = [
  { id: 'ibrahim', name: 'Ibrahim Koné', g: 'M', x: 270, y: 36 },
  { id: 'aissata', name: 'Aïssata Koné', g: 'F', x: 500, y: 36 },
  { id: 'moussa', name: 'Moussa Koné', g: 'M', x: 120, y: 186 },
  { id: 'awa', name: 'Awa Koné', g: 'F', x: 385, y: 186 },
  { id: 'seydou', name: 'Seydou Koné', g: 'M', x: 650, y: 186 },
  { id: 'fatou', name: 'Fatou Koné', g: 'F', x: 30, y: 336 },
  { id: 'ibra', name: 'Petit Ibra', g: 'M', x: 210, y: 336 },
] as const;

const childLinks = [
  ['ibrahim', 'moussa'],
  ['ibrahim', 'awa'],
  ['ibrahim', 'seydou'],
  ['moussa', 'fatou'],
  ['moussa', 'ibra'],
] as const;

const byId = Object.fromEntries(people.map((p) => [p.id, p]));
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mid = (y1 + y2) / 2;
  return `M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
};

function DemoTree() {
  const [fabricId, setFabricId] = useState(FABRICS[0].id);
  const fabric = getTreeBackground(fabricId);
  const seydou = byId.seydou;
  const bubble = { x: seydou.x + CARD_W / 2, y: seydou.y + CARD_H + 62 };

  return (
    <div className="lp-window lp-enter" style={delay(320)}>
      <div className="lp-window-bar">
        <span className="lp-dots" aria-hidden>
          <i /><i /><i />
        </span>
        <span className="lp-window-title">Famille Koné · 11 membres</span>
        <div className="lp-fabrics" role="group" aria-label="Changer le tissu de fond">
          {FABRICS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="lp-fabric"
              aria-pressed={p.id === fabricId}
              onClick={() => setFabricId(p.id)}
            >
              <i style={{ backgroundImage: p.image ?? undefined }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="lp-stage">
        <div className="lp-stage-fabric" style={{ backgroundImage: fabric.image ?? undefined }} />
        <svg viewBox="0 0 920 430" role="img" aria-label="Exemple d'arbre : Ibrahim et Aïssata Koné, leurs trois enfants et deux petits-enfants">
          {/* Mari et femme : trait rose continu */}
          <path
            d={`M${byId.ibrahim.x + CARD_W} ${byId.ibrahim.y + CARD_H / 2}H${byId.aissata.x}`}
            stroke="#ec4899" strokeWidth="3" fill="none"
          />
          {/* Parent → enfant : pointillé orange */}
          {childLinks.map(([from, to]) => {
            const a = byId[from];
            const b = byId[to];
            return (
              <path
                key={to}
                className="lp-flow"
                d={curve(a.x + CARD_W / 2, a.y + CARD_H, b.x + CARD_W / 2, b.y)}
                stroke="#f97316" strokeWidth="2.5" strokeDasharray="6 6" fill="none"
              />
            );
          })}
          {/* Descendance repliée */}
          <path
            d={`M${bubble.x} ${seydou.y + CARD_H}V${bubble.y - 22}`}
            stroke="#f97316" strokeWidth="2" strokeDasharray="5 5" fill="none"
          />
          <circle cx={bubble.x} cy={bubble.y} r="22" fill="#fff" stroke="#fb923c" strokeWidth="2" strokeDasharray="5 4" />
          <text x={bubble.x} y={bubble.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#f97316">+4</text>

          {people.map((p) => {
            const color = p.g === 'M' ? MALE : FEMALE;
            return (
              <g key={p.id}>
                <rect x={p.x} y={p.y} width={CARD_W} height={CARD_H} rx="13" fill="#fff" stroke={color} strokeWidth="2.5" />
                <circle cx={p.x + 27} cy={p.y + CARD_H / 2} r="15" fill="#f4f4f5" />
                <text x={p.x + 27} y={p.y + CARD_H / 2 + 5} textAnchor="middle" fontSize="14" fill={color}>
                  {p.g === 'M' ? '♂' : '♀'}
                </text>
                <text x={p.x + 51} y={p.y + CARD_H / 2 + 4.5} fontSize="13" fontWeight="600" fill="#1a1208">
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Contenu ──────────────────────────────────────────────────────────────────
const stats = [
  { n: 2400, suffix: '+', label: 'Familles actives' },
  { n: 18000, suffix: '+', label: 'Membres documentés' },
  { n: 95, suffix: ' %', label: 'Satisfaction' },
  { n: 12, suffix: ' pays', label: 'Communautés' },
];

const steps = [
  { title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.' },
  { title: 'Ajoutez vos membres', desc: 'Commencez par vous-même, puis ajoutez parents, enfants et conjoints avec leurs photos.' },
  { title: 'Partagez avec la famille', desc: 'Invitez vos proches par email ou par lien, et construisez l’arbre ensemble.' },
];

const quotes = [
  { quote: 'Geneo a transformé nos réunions familiales. Maintenant tout le monde peut voir et contribuer à notre histoire.', author: 'Aminata Diallo', origin: 'Dakar, Sénégal', flag: '🇸🇳' },
  { quote: 'J’ai documenté quatre générations de notre famille en moins d’une semaine. L’interface est intuitive et belle.', author: 'Kofi Mensah', origin: 'Accra, Ghana', flag: '🇬🇭' },
  { quote: 'Le partage par lien change tout. Mes oncles au village peuvent voir l’arbre sans créer de compte.', author: 'Fatoumata Camara', origin: 'Conakry, Guinée', flag: '🇬🇳' },
];

export default function LandingPage() {
  const ref = useReveal();

  return (
    <div ref={ref} className={`lp ${display.variable}`} style={pageVars}>
      {/* Sans JavaScript, tout reste visible */}
      <noscript>
        <style>{`.lp [data-reveal]{opacity:1;transform:none}`}</style>
      </noscript>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <Link href="/" className="lp-logo" aria-label="Geneo, accueil">
            <img src="/logo/logo.svg" alt="Geneo.io" />
          </Link>
          <nav className="lp-nav-links" aria-label="Sections">
            <a href="#fonctionnalites" className="lp-nav-link">Fonctionnalités</a>
            <a href="#etapes" className="lp-nav-link">Comment ça marche</a>
            <a href="#temoignages" className="lp-nav-link">Témoignages</a>
          </nav>
          <div className="lp-nav-actions">
            <Link href="/login" className="lp-nav-link">Connexion</Link>
            <Link href="/register" className="lp-btn lp-btn-primary lp-btn-sm">Commencer</Link>
          </div>
        </div>
        <div className="lp-kente" aria-hidden />
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero-copy">
              <p className="lp-pill lp-enter">
                <b>Nouveau</b> Des fonds en tissus africains pour votre arbre
              </p>
              <h1 className="lp-display lp-h1 lp-enter" style={delay(60)}>
                Donnez vie à votre <em>histoire familiale</em>.
              </h1>
              <p className="lp-lead lp-enter" style={delay(140)}>
                Construisez, visualisez et partagez votre arbre généalogique. Simple pour les
                aînés, vivant pour les plus jeunes, privé pour toute la famille.
              </p>
              <div className="lp-hero-actions lp-enter" style={delay(220)}>
                <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
                  Créer mon arbre gratuitement <ArrowRight size={18} />
                </Link>
                <a href="#etapes" className="lp-btn lp-btn-ghost lp-btn-lg">Comment ça marche</a>
              </div>
              <p className="lp-hero-note lp-enter" style={delay(220)}>
                Gratuit pour démarrer · Aucune carte bancaire
              </p>
            </div>
            <DemoTree />
          </div>
        </section>

        {/* ── Chiffres ─────────────────────────────────────────────────────── */}
        <section className="lp-dark lp-stats" aria-label="Geneo en chiffres">
          <div className="lp-container lp-stats-grid">
            {stats.map(({ n, suffix, label }, i) => (
              <div key={label} className="lp-stat" data-reveal style={delay(i * 70)}>
                <div className="lp-display lp-stat-n">
                  <Counter target={n} suffix={suffix} />
                </div>
                <div className="lp-stat-l">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fonctionnalités ──────────────────────────────────────────────── */}
        <section id="fonctionnalites" className="lp-section">
          <div className="lp-container">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">Fonctionnalités</span>
              <h2 className="lp-display lp-h2">Tout pour documenter votre héritage.</h2>
              <p className="lp-lead">
                Un espace de travail pensé pour la famille entière, des grands-parents aux petits-enfants.
              </p>
            </div>

            <div className="lp-bento">
              <article className="lp-card lp-dark lp-wide" data-reveal>
                <span className="lp-icon"><TreeDeciduous size={22} /></span>
                <h3 className="lp-display lp-h3">Un arbre qui se manipule du bout des doigts</h3>
                <p className="lp-body">
                  Déplacez les membres par glisser-déposer, repliez une branche pour gagner de
                  la place : toute la descendance suit le mouvement.
                </p>
                <div className="lp-tags">
                  {['Glisser-déposer', 'Branches repliables', 'Zoom libre', 'Notes et anecdotes'].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>

              <article className="lp-card" data-reveal style={delay(80)}>
                <span className="lp-icon"><Palette size={22} /></span>
                <h3 className="lp-display lp-h3">Des tissus qui nous ressemblent</h3>
                <p className="lp-body">Ndop, Toghu, Bogolan, Kente, Wax, Kuba : choisissez le fond de votre arbre.</p>
                <div className="lp-swatches" aria-hidden>
                  {FABRICS.slice(0, 4).map((p) => (
                    <i key={p.id} style={{ backgroundImage: p.image ?? undefined }} />
                  ))}
                </div>
              </article>

              <article className="lp-card" data-reveal>
                <span className="lp-icon"><BookOpenText size={22} /></span>
                <h3 className="lp-display lp-h3">Une légende claire pour nos aînés</h3>
                <p className="lp-body">Chaque couleur a un sens, expliqué directement sur l’arbre.</p>
                <ul className="lp-legend">
                  <li><i style={{ borderColor: MALE }} /> Homme</li>
                  <li><i style={{ borderColor: FEMALE }} /> Femme</li>
                  <li><i className="line" style={{ borderColor: '#ec4899' }} /> Mari et femme</li>
                  <li><i className="line dash" style={{ borderColor: '#f97316' }} /> Parent → enfant</li>
                </ul>
              </article>

              <article className="lp-card" data-reveal style={delay(80)}>
                <span className="lp-icon"><Users size={22} /></span>
                <h3 className="lp-display lp-h3">Collaboration familiale</h3>
                <p className="lp-body">
                  Invitez vos proches comme éditeurs ou visiteurs. Chacun voit les changements en temps réel.
                </p>
              </article>

              <article className="lp-card" data-reveal style={delay(160)}>
                <span className="lp-icon"><Share2 size={22} /></span>
                <h3 className="lp-display lp-h3">Partage par simple lien</h3>
                <p className="lp-body">
                  Un lien suffit : vos proches consultent l’arbre sans avoir à créer de compte.
                </p>
              </article>

              <article className="lp-card" data-reveal>
                <span className="lp-icon"><Images size={22} /></span>
                <h3 className="lp-display lp-h3">Photos et portraits</h3>
                <p className="lp-body">Ajoutez un visage à chaque nom. L’arbre devient l’album vivant de la famille.</p>
              </article>

              <article className="lp-card lp-wide" data-reveal style={delay(80)}>
                <span className="lp-icon"><ShieldCheck size={22} /></span>
                <h3 className="lp-display lp-h3">Privé par défaut</h3>
                <p className="lp-body">
                  Vous décidez qui peut voir ou modifier votre arbre. L’histoire de votre famille reste entre vos mains.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Étapes ───────────────────────────────────────────────────────── */}
        <section id="etapes" className="lp-section lp-sand">
          <div className="lp-container">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">Comment ça marche</span>
              <h2 className="lp-display lp-h2">Votre arbre en trois étapes.</h2>
            </div>
            <ol className="lp-steps">
              {steps.map(({ title, desc }, i) => (
                <li key={title} className="lp-step" data-reveal style={delay(i * 90)}>
                  <div className="lp-display lp-step-n">{i + 1}</div>
                  <h3 className="lp-display lp-h3">{title}</h3>
                  <p className="lp-body">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Témoignages ──────────────────────────────────────────────────── */}
        <section id="temoignages" className="lp-section">
          <div className="lp-container">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">Témoignages</span>
              <h2 className="lp-display lp-h2">Ce que disent nos familles.</h2>
            </div>
            <div className="lp-quotes">
              {quotes.map(({ quote, author, origin, flag }, i) => (
                <figure key={author} className="lp-card lp-quote" data-reveal style={delay(i * 80)}>
                  <blockquote>« {quote} »</blockquote>
                  <footer>
                    <span className="lp-avatar" aria-hidden>{flag}</span>
                    <figcaption>
                      <cite>{author}</cite>
                      <small>{origin}</small>
                    </figcaption>
                  </footer>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Appel final ──────────────────────────────────────────────────── */}
        <div className="lp-container">
          <section className="lp-dark lp-cta" data-reveal>
            <h2 className="lp-display lp-h2">
              Prêt à explorer <em>vos racines</em> ?
            </h2>
            <p className="lp-lead">
              Commencez aujourd’hui, invitez la famille demain. C’est gratuit pour démarrer.
            </p>
            <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
              Créer mon arbre gratuitement <ArrowRight size={18} />
            </Link>
          </section>
        </div>
      </main>

      {/* ── Pied de page ───────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-kente" aria-hidden />
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div>
              <div className="lp-display lp-footer-brand">Geneo<em>.io</em></div>
              <p>Enraciné dans la famille. Documentez votre héritage pour les générations futures.</p>
            </div>
            <nav aria-label="Pied de page">
              <a href="#fonctionnalites">Fonctionnalités</a>
              <a href="#etapes">Comment ça marche</a>
              <a href="#temoignages">Témoignages</a>
              <Link href="/login">Connexion</Link>
              <Link href="/register">Créer un compte</Link>
            </nav>
          </div>
          <div className="lp-footer-bottom">© 2026 Geneo. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

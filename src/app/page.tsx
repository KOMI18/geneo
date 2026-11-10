'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { Fraunces } from 'next/font/google';
import { ArrowRight, Images, NotebookPen, ShieldCheck } from 'lucide-react';
import { getTreeBackground, TREE_BACKGROUNDS } from '@/lib/treeBackgrounds';
import './landing.css';

// Titres : Fraunces (serif à taille optique). Texte courant : Geist, déjà chargée par le layout.
const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

const FABRICS = TREE_BACKGROUNDS.filter((p) => p.image);
const pageVars = { '--fabric-kente': getTreeBackground('kente').image } as CSSProperties;

// Code couleur de l'application
const MALE = '#60a5fa';
const FEMALE = '#f472b6';
const SPOUSE = '#ec4899';
const CHILD = '#f97316';
const CARD_W = 150;
const CARD_H = 52;

type Person = { id: string; name: string; g: 'M' | 'F'; x: number; y: number };

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mid = (y1 + y2) / 2;
  return `M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
};

function PersonCard({ p }: { p: Person }) {
  const color = p.g === 'M' ? MALE : FEMALE;
  return (
    <g>
      <rect x={p.x} y={p.y} width={CARD_W} height={CARD_H} rx="13" fill="#fff" stroke={color} strokeWidth="3" />
      <circle cx={p.x + 27} cy={p.y + CARD_H / 2} r="15" fill="#f4f4f5" />
      <text x={p.x + 27} y={p.y + CARD_H / 2 + 5} textAnchor="middle" fontSize="14" fill={color}>
        {p.g === 'M' ? '♂' : '♀'}
      </text>
      <text x={p.x + 51} y={p.y + CARD_H / 2 + 4.5} fontSize="13" fontWeight="600" fill="#1a1208">
        {p.name}
      </text>
    </g>
  );
}

// ─── Hero : un arbre posé sur le tissu choisi ─────────────────────────────────
const people: Person[] = [
  { id: 'ibrahim', name: 'Ibrahim Koné', g: 'M', x: 95, y: 44 },
  { id: 'aissata', name: 'Aïssata Koné', g: 'F', x: 315, y: 44 },
  { id: 'moussa', name: 'Moussa Koné', g: 'M', x: 28, y: 214 },
  { id: 'awa', name: 'Awa Koné', g: 'F', x: 205, y: 214 },
  { id: 'seydou', name: 'Seydou Koné', g: 'M', x: 382, y: 214 },
  { id: 'fatou', name: 'Fatou Koné', g: 'F', x: 28, y: 390 },
  { id: 'ibra', name: 'Petit Ibra', g: 'M', x: 205, y: 390 },
];
const byId = Object.fromEntries(people.map((p) => [p.id, p]));
const childLinks = [
  ['ibrahim', 'moussa'],
  ['ibrahim', 'awa'],
  ['ibrahim', 'seydou'],
  ['moussa', 'fatou'],
  ['moussa', 'ibra'],
];

function HeroTree() {
  const [fabricId, setFabricId] = useState(FABRICS[0].id);
  const fabric = getTreeBackground(fabricId);
  const seydou = byId.seydou;
  const bubble = { x: seydou.x + CARD_W / 2, y: seydou.y + CARD_H + 64 };

  return (
    <div>
      <div className="lp-panel lp-tree">
        <div className="lp-tree-fabric" style={{ backgroundImage: fabric.image ?? undefined }} />
        <svg
          viewBox="0 0 560 500"
          role="img"
          aria-label="Exemple d'arbre : Ibrahim et Aïssata Koné, leurs trois enfants et deux petits-enfants"
        >
          {/* Les liens passent sur un filet blanc pour rester lisibles sur tous les tissus */}
          <g fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round">
            <path d={`M${byId.ibrahim.x + CARD_W} ${byId.ibrahim.y + CARD_H / 2}H${byId.aissata.x}`} />
            {childLinks.map(([from, to]) => (
              <path key={to} d={curve(byId[from].x + CARD_W / 2, byId[from].y + CARD_H, byId[to].x + CARD_W / 2, byId[to].y)} />
            ))}
            <path d={`M${bubble.x} ${seydou.y + CARD_H}V${bubble.y - 22}`} />
          </g>
          <path
            d={`M${byId.ibrahim.x + CARD_W} ${byId.ibrahim.y + CARD_H / 2}H${byId.aissata.x}`}
            stroke={SPOUSE} strokeWidth="3" fill="none"
          />
          {childLinks.map(([from, to]) => (
            <path
              key={to}
              className="lp-flow"
              d={curve(byId[from].x + CARD_W / 2, byId[from].y + CARD_H, byId[to].x + CARD_W / 2, byId[to].y)}
              stroke={CHILD} strokeWidth="3" strokeDasharray="6 6" fill="none"
            />
          ))}
          <path
            d={`M${bubble.x} ${seydou.y + CARD_H}V${bubble.y - 22}`}
            stroke={CHILD} strokeWidth="2.5" strokeDasharray="5 5" fill="none"
          />
          <circle cx={bubble.x} cy={bubble.y} r="22" fill="#fff" stroke={CHILD} strokeWidth="2.5" strokeDasharray="5 4" />
          <text x={bubble.x} y={bubble.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill={CHILD}>+4</text>
          {people.map((p) => <PersonCard key={p.id} p={p} />)}
        </svg>
      </div>

      <div className="lp-fabrics" role="group" aria-label="Changer le tissu de fond">
        <span className="lp-label">Fond : {fabric.name}, {fabric.origin}</span>
        {FABRICS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="lp-fabric"
            title={p.name}
            aria-label={`Tissu ${p.name}`}
            aria-pressed={p.id === fabricId}
            onClick={() => setFabricId(p.id)}
            style={{ backgroundImage: p.image ?? undefined }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Illustration de la légende ───────────────────────────────────────────────
function LegendFigure() {
  const father: Person = { id: 'p', name: 'Le père', g: 'M', x: 50, y: 60 };
  const mother: Person = { id: 'm', name: 'La mère', g: 'F', x: 280, y: 60 };
  const child: Person = { id: 'c', name: 'L’enfant', g: 'F', x: 50, y: 250 };
  const note = { fontSize: 14, fill: '#6b5942' };

  return (
    <div className="lp-panel lp-figure">
      <svg viewBox="0 0 480 360" role="img" aria-label="Le code couleur : cadre bleu pour un homme, cadre rose pour une femme, trait rose continu entre époux, pointillé orange du parent vers l'enfant">
        <path d={`M${father.x + CARD_W} ${father.y + CARD_H / 2}H${mother.x}`} stroke={SPOUSE} strokeWidth="3" />
        <path
          className="lp-flow"
          d={`M${father.x + CARD_W / 2} ${father.y + CARD_H}V${child.y}`}
          stroke={CHILD} strokeWidth="3" strokeDasharray="6 6" fill="none"
        />
        <PersonCard p={father} />
        <PersonCard p={mother} />
        <PersonCard p={child} />
        <text x={father.x} y={father.y - 14} {...note}>Cadre bleu : un homme</text>
        <text x={mother.x} y={mother.y - 14} {...note}>Cadre rose : une femme</text>
        <text x={240} y={mother.y + CARD_H + 30} textAnchor="middle" {...note}>Trait rose : mari et femme</text>
        <text x={father.x + CARD_W / 2 + 16} y={196} {...note}>Pointillé orange : parent → enfant</text>
      </svg>
    </div>
  );
}

// ─── Contenu ──────────────────────────────────────────────────────────────────
const steps = [
  { title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.' },
  { title: 'Ajoutez vos membres', desc: 'Commencez par vous-même, puis ajoutez parents, enfants et conjoints avec leurs photos.' },
  { title: 'Partagez avec la famille', desc: 'Invitez vos proches par email ou par lien, et construisez l’arbre ensemble.' },
];

export default function LandingPage() {
  return (
    <div className={`lp ${display.variable}`} style={pageVars}>
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
            <Link href="/register" className="lp-btn lp-btn-sm">Commencer</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-container lp-hero-grid">
            <div>
              <h1 className="lp-display lp-h1">
                Donnez vie à votre <em>histoire familiale</em>.
              </h1>
              <p className="lp-lead">
                Construisez, visualisez et partagez votre arbre généalogique. Simple pour les
                aînés, vivant pour les plus jeunes, privé pour toute la famille.
              </p>
              <div className="lp-hero-actions">
                <Link href="/register" className="lp-btn">
                  Créer mon arbre gratuitement <ArrowRight size={17} />
                </Link>
                <a href="#etapes" className="lp-link">Comment ça marche</a>
              </div>
              <dl className="lp-facts">
                {[['2 400+', 'familles actives'], ['18 000+', 'membres documentés'], ['12', 'pays']].map(([n, label]) => (
                  <div key={label}>
                    <dt className="lp-display">{n}</dt>
                    <dd>{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroTree />
          </div>
        </section>

        {/* ── Bandeau d'illustration ───────────────────────────────────────── */}
        <div className="lp-band" aria-hidden>
          <Image src="/back-1.jpg" alt="" fill sizes="100vw" className="lp-multiply" priority />
        </div>

        {/* ── Fonctionnalités ──────────────────────────────────────────────── */}
        <section id="fonctionnalites" className="lp-section">
          <div className="lp-container">
            <div className="lp-head">
              <h2 className="lp-display lp-h2">Tout pour documenter votre héritage.</h2>
              <p className="lp-lead">
                Un espace de travail pensé pour la famille entière, des grands-parents aux petits-enfants.
              </p>
            </div>

            <div className="lp-rows">
              <div className="lp-row">
                <div className="lp-row-media lp-mosaic">
                  {FABRICS.map((p) => (
                    <figure key={p.id}>
                      <i style={{ backgroundImage: p.image ?? undefined }} />
                      <figcaption>{p.name}<span>{p.origin}</span></figcaption>
                    </figure>
                  ))}
                </div>
                <div className="lp-row-text">
                  <h3 className="lp-display lp-h3">Des tissus qui nous ressemblent.</h3>
                  <p className="lp-lead">
                    Votre arbre se pose sur un pagne : Ndop, Toghu, Bogolan, Kente, Wax ou Kuba.
                    Chacun choisit le fond qui lui parle et règle son intensité.
                  </p>
                </div>
              </div>

              <div className="lp-row">
                <div className="lp-row-media"><LegendFigure /></div>
                <div className="lp-row-text">
                  <h3 className="lp-display lp-h3">Une légende claire pour nos aînés.</h3>
                  <p className="lp-lead">
                    Chaque couleur a un sens, et il est expliqué directement sur l’arbre, en grand.
                    Nos papas s’y retrouvent sans rien demander.
                  </p>
                </div>
              </div>

              <div className="lp-row">
                <div className="lp-row-media lp-panel lp-figure">
                  <Image src="/back.jpg" alt="" fill sizes="(max-width: 56rem) 100vw, 50vw" className="lp-multiply" />
                </div>
                <div className="lp-row-text">
                  <h3 className="lp-display lp-h3">Toute la famille, sur le même arbre.</h3>
                  <p className="lp-lead">
                    Invitez vos proches et construisez ensemble, chacun voit les changements en direct.
                  </p>
                  <ul className="lp-list">
                    <li>Éditeurs ou simples visiteurs, c’est vous qui décidez</li>
                    <li>Un lien suffit, sans compte à créer pour consulter</li>
                    <li>Glisser-déposer, branches repliables, zoom libre</li>
                  </ul>
                </div>
              </div>
            </div>

            <ul className="lp-more">
              <li>
                <Images size={22} />
                <h4 className="lp-display lp-h4">Photos et portraits</h4>
                <p className="lp-body">Un visage sur chaque nom. L’arbre devient l’album vivant de la famille.</p>
              </li>
              <li>
                <NotebookPen size={22} />
                <h4 className="lp-display lp-h4">Notes et anecdotes</h4>
                <p className="lp-body">Gardez les histoires que l’on raconte, à côté de ceux qui les ont vécues.</p>
              </li>
              <li>
                <ShieldCheck size={22} />
                <h4 className="lp-display lp-h4">Privé par défaut</h4>
                <p className="lp-body">Vous décidez qui peut voir ou modifier votre arbre.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Étapes ───────────────────────────────────────────────────────── */}
        <section id="etapes" className="lp-section lp-tinted">
          <div className="lp-container">
            <div className="lp-head">
              <h2 className="lp-display lp-h2">Votre arbre en trois étapes.</h2>
            </div>
            <ol className="lp-steps">
              {steps.map(({ title, desc }, i) => (
                <li key={title} className="lp-step">
                  <div className="lp-display lp-step-n">{i + 1}</div>
                  <h3 className="lp-display lp-h4">{title}</h3>
                  <p className="lp-body">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Témoignages ──────────────────────────────────────────────────── */}
        <section id="temoignages" className="lp-section">
          <div className="lp-container lp-quotes">
            <figure className="lp-quote-big">
              <blockquote className="lp-display">
                « Geneo a transformé nos réunions familiales. Maintenant tout le monde peut voir
                et contribuer à <em>notre histoire</em>. »
              </blockquote>
              <figcaption>Aminata Diallo <span>· Dakar, Sénégal</span></figcaption>
            </figure>
            <div>
              <figure className="lp-quote-small">
                <blockquote>
                  « J’ai documenté quatre générations de notre famille en moins d’une semaine. »
                </blockquote>
                <figcaption>Kofi Mensah <span>· Accra, Ghana</span></figcaption>
              </figure>
              <figure className="lp-quote-small">
                <blockquote>
                  « Mes oncles au village peuvent voir l’arbre sans créer de compte. »
                </blockquote>
                <figcaption>Fatoumata Camara <span>· Conakry, Guinée</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Appel final ──────────────────────────────────────────────────── */}
        <div className="lp-container">
          <section className="lp-cta">
            <div className="lp-cta-text">
              <h2 className="lp-display lp-h2">
                Prêt à explorer <em>vos racines</em> ?
              </h2>
              <p>Commencez aujourd’hui, invitez la famille demain. C’est gratuit pour démarrer.</p>
              <Link href="/register" className="lp-btn lp-btn-light">
                Créer mon arbre gratuitement <ArrowRight size={17} />
              </Link>
            </div>
            <div className="lp-cta-media" aria-hidden>
              <Image src="/back-1.jpg" alt="" fill sizes="(max-width: 56rem) 100vw, 40vw" />
            </div>
          </section>
        </div>
      </main>

      {/* ── Pied de page ───────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-kente" aria-hidden />
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div className="lp-display lp-footer-brand">Geneo<em>.io</em></div>
            <nav aria-label="Pied de page">
              <a href="#fonctionnalites">Fonctionnalités</a>
              <a href="#etapes">Comment ça marche</a>
              <a href="#temoignages">Témoignages</a>
              <Link href="/login">Connexion</Link>
              <Link href="/register">Créer un compte</Link>
            </nav>
          </div>
          <small>© 2026 Geneo. Tous droits réservés.</small>
        </div>
      </footer>
    </div>
  );
}

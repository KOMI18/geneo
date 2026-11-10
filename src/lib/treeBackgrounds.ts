// Fonds de l'espace de travail : tissus africains dessinés en SVG (tuiles répétables).
// Pour ajouter un tissu : dessiner une tuile qui se répète sans couture et l'ajouter à TREE_BACKGROUNDS.

export interface TreeBackgroundPattern {
  id: string;
  name: string;
  origin: string;
  /** Taille de la tuile en px (à zoom 1). 0 = pas de tissu (fond uni). */
  tile: number;
  /** URL CSS `url("data:image/svg+xml,…")` de la tuile, null pour le fond uni. */
  image: string | null;
}

const svg = (size: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`
  )}")`;

// ─── Ndop (Grassfields, Cameroun) : indigo, motifs blancs en réserve ──────────
const ndopMotif = (ink: string) =>
  `  <g fill="none" stroke="${ink}" stroke-linecap="round">
    <path d="M0 0H160M0 80H160M0 160H160M0 0V160M80 0V160M160 0V160" stroke-width="3" stroke-dasharray="3 5"/>
    <g stroke-width="3" stroke-dasharray="1 6">
      <circle cx="40" cy="40" r="27"/><circle cx="40" cy="40" r="17"/>
      <circle cx="120" cy="120" r="27"/><circle cx="120" cy="120" r="17"/>
    </g>
    <g stroke-width="2.5">
      <path d="M120 12L148 40L120 68L92 40Z"/><path d="M120 26L134 40L120 54L106 40Z"/>
      <path d="M40 92L68 120L40 148L12 120Z"/><path d="M40 106L54 120L40 134L26 120Z"/>
      <path d="M96 16l8 8M144 16l-8 8M96 64l8-8M144 64l-8-8M16 96l8 8M64 96l-8 8M16 144l8-8M64 144l-8-8"/>
    </g>
  </g>
  <g fill="${ink}">
    <circle cx="40" cy="40" r="6"/><circle cx="120" cy="120" r="6"/>
    <circle cx="120" cy="40" r="4"/><circle cx="40" cy="120" r="4"/>
  </g>`;
const ndop = svg(160, `<rect width="160" height="160" fill="#1b2a6b"/>${ndopMotif('#f4f1e8')}`);

// ─── Toghu (Nord-Ouest, Cameroun) : velours noir brodé rouge, jaune, blanc ────
const toghuStar = (cx: number, cy: number) =>
  `<g transform="translate(${cx} ${cy})">
    <circle r="26" fill="none" stroke="#f4b41a" stroke-width="4"/>
    <circle r="33" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>
    <path d="M0-20V20M-20 0H20M-14-14L14 14M-14 14L14-14" stroke="#d62828" stroke-width="4" stroke-linecap="round"/>
    <circle r="7" fill="#f4b41a"/><circle r="3" fill="#111"/>
  </g>`;
const toghu = svg(
  120,
  `<rect width="120" height="120" fill="#131313"/>
  ${toghuStar(60, 60)}
  <g fill="none" stroke-linecap="round">
    <path d="M0 0q15-14 30 0t30 0t30 0t30 0M0 120q15-14 30 0t30 0t30 0t30 0" stroke="#d62828" stroke-width="3"/>
    <path d="M0 0q15 14 30 0t30 0t30 0t30 0M0 120q15 14 30 0t30 0t30 0t30 0" stroke="#f4b41a" stroke-width="3"/>
  </g>
  <g fill="#fff">
    <path d="M0 52l8 8-8 8-8-8zM120 52l8 8-8 8-8-8z"/>
  </g>`
);

// ─── Bogolan (Mali) : terre brune, signes crème ───────────────────────────────
const bogolanMotif = (ink: string) =>
  `  <g fill="none" stroke="${ink}" stroke-linecap="square">
    <path d="M0 30L10 10L20 30L30 10L40 30L50 10L60 30L70 10L80 30L90 10L100 30L110 10L120 30" stroke-width="4" stroke-linejoin="miter"/>
    <path d="M0 40H120M0 80H120" stroke-width="3"/>
    <path d="M0 0H120M0 120H120" stroke-width="6"/>
    <path d="M8 53l14 14m0-14l-14 14M68 53l14 14m0-14l-14 14" stroke-width="4"/>
    <circle cx="45" cy="60" r="7" stroke-width="4"/><circle cx="105" cy="60" r="7" stroke-width="4"/>
    <path d="M45 91l9 9-9 9-9-9zM105 91l9 9-9 9-9-9z" stroke-width="3"/>
  </g>
  <g fill="${ink}">
    <path d="M15 91l9 9-9 9-9-9zM75 91l9 9-9 9-9-9z"/>
    <circle cx="45" cy="60" r="2"/><circle cx="105" cy="60" r="2"/>
  </g>`;
const bogolan = svg(120, `<rect width="120" height="120" fill="#2e1f14"/>${bogolanMotif('#ead9b5')}`);

// ─── Kente (Ghana) : bandes tissées or, vert, rouge, noir ─────────────────────
const kenteWarp = (x: number, y: number) =>
  ['#f2b01e', '#1e7a3c', '#f2b01e', '#c8281e', '#f2b01e', '#15120e']
    .map((c, i) => `<rect x="${x + i * 10}" y="${y}" width="10" height="60" fill="${c}"/>`)
    .join('');
const kenteWeft = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})">
    <rect width="60" height="60" fill="#15120e"/>
    <path d="M0 9H60M0 30H60M0 51H60" stroke="#f2b01e" stroke-width="6"/>
    <path d="M6 16h12v8H6zM24 16h12v8H24zM42 16h12v8H42zM6 37h12v8H6zM24 37h12v8H24zM42 37h12v8H42z" fill="#c8281e"/>
    <path d="M0 30h6M18 30h6M36 30h6M54 30h6" stroke="#1e7a3c" stroke-width="6"/>
  </g>`;
const kente = svg(
  120,
  `${kenteWarp(0, 0)}${kenteWeft(60, 0)}${kenteWeft(0, 60)}${kenteWarp(60, 60)}`
);

// ─── Wax : grandes cocardes colorées sur fond bleu ────────────────────────────
const waxRosette = (cx: number, cy: number) =>
  `<g transform="translate(${cx} ${cy})">
    <circle r="54" fill="none" stroke="#fdf3d7" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round"/>
    <circle r="44" fill="#f6c21c"/><circle r="34" fill="#d9381e"/>
    <circle r="24" fill="#fdf3d7"/><circle r="14" fill="#1d3f8f"/><circle r="5" fill="#f6c21c"/>
  </g>`;
const wax = svg(
  160,
  `<rect width="160" height="160" fill="#1d3f8f"/>
  ${waxRosette(80, 80)}${waxRosette(0, 0)}${waxRosette(160, 0)}${waxRosette(0, 160)}${waxRosette(160, 160)}
  <g fill="#fdf3d7">
    <circle cx="80" cy="0" r="5"/><circle cx="80" cy="160" r="5"/>
    <circle cx="0" cy="80" r="5"/><circle cx="160" cy="80" r="5"/>
  </g>`
);

// ─── Kuba (RD Congo) : raphia, losanges emboîtés noirs ────────────────────────
const kubaMotif = (ink: string) =>
  `  <g fill="none" stroke="${ink}" stroke-linejoin="miter">
    <path d="M40 2L78 40L40 78L2 40Z" stroke-width="6"/>
    <path d="M40 20L60 40L40 60L20 40Z" stroke-width="4"/>
  </g>
  <g fill="${ink}">
    <path d="M40 32l8 8-8 8-8-8z"/>
    <path d="M0-12L12 0L0 12L-12 0zM80-12L92 0L80 12L68 0zM0 68L12 80L0 92L-12 80zM80 68L92 80L80 92L68 80z"/>
  </g>`;
const kuba = svg(80, `<rect width="80" height="80" fill="#d9b77e"/>${kubaMotif('#1f1710')}`);

export const TREE_BACKGROUNDS: TreeBackgroundPattern[] = [
  { id: 'ndop', name: 'Ndop', origin: 'Cameroun', tile: 160, image: ndop },
  { id: 'toghu', name: 'Toghu', origin: 'Cameroun', tile: 120, image: toghu },
  { id: 'bogolan', name: 'Bogolan', origin: 'Mali', tile: 120, image: bogolan },
  { id: 'kente', name: 'Kente', origin: 'Ghana', tile: 120, image: kente },
  { id: 'wax', name: 'Wax', origin: 'Afrique de l’Ouest', tile: 160, image: wax },
  { id: 'kuba', name: 'Kuba', origin: 'RD Congo', tile: 80, image: kuba },
  { id: 'plain', name: 'Uni', origin: 'Sans tissu', tile: 0, image: null },
];

export const DEFAULT_TREE_BACKGROUND = 'ndop';
export const DEFAULT_TREE_BACKGROUND_INTENSITY = 0.45;

export const getTreeBackground = (id: string): TreeBackgroundPattern =>
  TREE_BACKGROUNDS.find((p) => p.id === id) ?? TREE_BACKGROUNDS[0];

// ─── Motifs seuls (fond transparent), pour habiller d'autres pages ────────────
const MOTIFS = {
  ndop: { tile: 160, draw: ndopMotif },
  bogolan: { tile: 120, draw: bogolanMotif },
  kuba: { tile: 80, draw: kubaMotif },
} as const;

/** Motif d'un tissu dans une seule couleur, sur fond transparent (URL CSS). */
export const fabricMotif = (id: keyof typeof MOTIFS, ink: string, opacity = 1) =>
  svg(MOTIFS[id].tile, `<g opacity="${opacity}">${MOTIFS[id].draw(ink)}</g>`);

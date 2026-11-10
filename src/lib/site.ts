// Adresse publique du site, utilisée pour le SEO (canonical, sitemap, Open Graph).
// Pour un autre domaine, définir NEXT_PUBLIC_SITE_URL dans l'environnement de build.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://geneo.invity.site').replace(/\/$/, '');
export const SITE_NAME = 'Geneo';
export const SITE_TITLE = 'Geneo — Arbre généalogique familial en ligne';
export const SITE_DESCRIPTION =
  'Créez et partagez votre arbre généalogique en famille : simple pour les aînés, collaboratif, privé, sur fonds de tissus africains. Gratuit pour démarrer.';

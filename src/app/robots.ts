import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Les pages privées (arbres, tableau de bord, invitations) ne sont pas bloquées ici :
// elles portent un en-tête « noindex » (next.config.ts) que Google doit pouvoir lire.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

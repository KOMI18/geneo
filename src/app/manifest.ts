import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'fr',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffdf9',
    theme_color: '#fffdf9',
    icons: [{ src: '/favicon.png', sizes: 'any', type: 'image/png' }],
  };
}

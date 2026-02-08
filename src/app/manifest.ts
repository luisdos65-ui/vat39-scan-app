import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vat39 De Specialist',
    short_name: 'Vat39',
    description: 'Scan & Discover wines and spirits',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#940B15',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

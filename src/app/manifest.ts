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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

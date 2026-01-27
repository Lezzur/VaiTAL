import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VaiTAL',
        short_name: 'VaiTAL',
        description: 'AI-powered health tracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/icon/favicon',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/icon/icon-192',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon/icon-512',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}

import type { Metadata, Viewport } from 'next'
import HealthAssistant from '@/components/health-assistant'
import { Outfit } from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/site-header'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'VaiTAL - AI Health Tracker',
    description: 'AI-powered health tracker for managing your lab results and medications',
    openGraph: {
        title: 'VaiTAL - AI Health Tracker',
        description: 'AI-powered health tracker for managing your lab results and medications',
        type: 'website',
    },
}

export const viewport: Viewport = {
    themeColor: '#ffffff',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

import { Toaster } from 'sonner'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${outfit.className} min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)] antialiased`}>
                <SiteHeader />
                {children}
                <HealthAssistant />
                <Toaster />
            </body>
        </html>
    )
}

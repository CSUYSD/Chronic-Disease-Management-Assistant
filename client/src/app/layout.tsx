import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './Providers'
import { ClientLayout } from '@/components/ClientLayout'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'HealthApp',
    description: 'Your personal health assistant powered by AI',
    keywords: ['health', 'AI', 'personal assistant', 'medical advice'],
    authors: [{ name: 'HealthApp Team' }],
    creator: 'HealthApp Inc.',
    publisher: 'HealthApp Inc.',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-icon.png',
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#ffffff',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            <ClientLayout>{children}</ClientLayout>
        </Providers>
        </body>
        </html>
    )
}
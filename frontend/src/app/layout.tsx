// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'BrickYard Pro — Premium Construction Materials',
  description: 'Quality cement bricks, hollow blocks, and construction materials. Instant price estimate with delivery calculation.',
  keywords: 'bricks, cement, construction materials, hollow blocks, pavers, Madanapalle',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-white text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

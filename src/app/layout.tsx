import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StoryWeaver - Collaborative Animated Shorts',
  description: 'Create animated stories together through daily voting',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0891B2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
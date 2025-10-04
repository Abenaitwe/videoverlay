import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Text Overlay',
  description: 'Add text overlays to your videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

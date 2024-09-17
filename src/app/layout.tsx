import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Workout Generator',
  description: 'Generate custom workouts with AI',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
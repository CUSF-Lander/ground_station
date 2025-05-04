import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rocket Ground Station Control',
  description: 'Ground station control application for rocket telemetry monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
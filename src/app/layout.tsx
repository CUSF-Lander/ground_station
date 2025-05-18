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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
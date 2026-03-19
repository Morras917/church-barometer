import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Church Donation Barometer',
  description: 'Real-time fundraising tracker',
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

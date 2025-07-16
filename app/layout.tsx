import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEC Booth Assignment',
  description: 'SEC Booth Assignment App'
}
 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

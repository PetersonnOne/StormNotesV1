import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Storm Notes',
  description: 'Your intelligent dashboard for time management, contacts, and document workflows.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/mammoth@1.7.0/mammoth.browser.min.js" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" async></script>
      </head>
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  )
}

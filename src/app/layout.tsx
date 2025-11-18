import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClickView Test',
  description: 'Test Project For ClickView',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', margin: 0, padding: 20 }}>
        {children}
      </body>
    </html>
  )
}

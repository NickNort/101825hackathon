export const metadata = {
  title: 'Claude Agent on Vercel',
  description: 'A Claude AI agent hosted on Vercel',
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

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ImageAbstract',
  description: 'Apple-like holographic UI to extract text from images using Deepseek AI. Optional translation included.',
  metadataBase: new URL('https://example.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <main className="relative min-h-dvh flex items-center justify-center p-4">
          {/* Holographic gradient orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-24 h-[38rem] w-[38rem] bg-holo-gradient opacity-30 blur-3xl rounded-full mix-blend-screen" />
            <div className="absolute -bottom-24 -right-24 h-[34rem] w-[34rem] bg-holo-gradient opacity-20 blur-3xl rounded-full mix-blend-screen" />
          </div>
          {children}
        </main>
      </body>
    </html>
  )
}

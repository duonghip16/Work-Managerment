import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Work management - Quản lý công việc chuyên nghiệp",
  description: "Ứng dụng quản lý công việc hiện đại",
  icons: {
    icon: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

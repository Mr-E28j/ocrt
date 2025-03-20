import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "OCR Inteligente - Extracción de texto de imágenes y PDFs",
  description: "Herramienta OCR minimalista para extraer texto de imágenes y documentos PDF con precisión y facilidad.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="ocr-theme-preference"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
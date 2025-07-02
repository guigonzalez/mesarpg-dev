import type React from "react"
import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google" // Importar Lora
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }) // Adicionar variable
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" }) // Adicionar Lora

export const metadata: Metadata = {
  title: "MesaRPG - Sua Aventura Começa Aqui",
  description: "Gerencie suas campanhas de RPG de mesa de forma fácil e imersiva.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

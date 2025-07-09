import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/components/app-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { QueryProvider } from "@/providers/query-provider"
import AuthLayout from "@/components/auth-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CLT Projects - Gestión de Proyectos",
  description: "Sistema de gestión y cotización de proyectos de desarrollo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AppProvider>
            <AuthProvider>
              <AuthLayout>
                {children}
              </AuthLayout>
            </AuthProvider>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

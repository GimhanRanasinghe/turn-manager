"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <body>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex min-h-screen">
          <Sidebar onCollapsedChange={setSidebarCollapsed} />
          <main className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
            {children}
          </main>
        </div>
      </ThemeProvider>
    </body>
  )
}

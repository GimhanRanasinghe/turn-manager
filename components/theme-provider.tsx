"use client"

import { useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme()

  // Only run on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
    mounted,
  }
}

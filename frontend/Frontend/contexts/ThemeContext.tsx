"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type ThemeMode = "day" | "night"

interface ThemeContextType {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("day")

  return (
    <ThemeContext.Provider value={{ mode, toggleMode: () => setMode(m => m === "day" ? "night" : "day") }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}

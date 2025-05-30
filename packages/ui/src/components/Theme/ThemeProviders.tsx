'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

interface ThemeContextType {
  mode: 'light' | 'dark'
  setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useThemeContext(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProviders')
  return ctx
}

export function ThemeProviders({
  children,
  initialTheme,
  initialThemeCookiePresent,
}: {
  children: React.ReactNode
  initialTheme: 'light' | 'dark'
  initialThemeCookiePresent: boolean
}) {
  const [mode, setMode] = useState<'light' | 'dark'>(initialTheme)

  useEffect(() => {
    if (!initialThemeCookiePresent) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
  }, [initialThemeCookiePresent])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    document.cookie = `theme=${mode};path=/;max-age=${60 * 60 * 24 * 365}`
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

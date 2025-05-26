'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiProvider, createTheme } from '@mui/material/styles'

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

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === 'dark' ? '#0a0a0a' : '#ffffff',
            paper: mode === 'dark' ? '#171717' : '#ffffff',
          },
          text: { primary: mode === 'dark' ? '#ededed' : '#171717' },
        },
      }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <MuiProvider theme={muiTheme}>{children}</MuiProvider>
    </ThemeContext.Provider>
  )
}
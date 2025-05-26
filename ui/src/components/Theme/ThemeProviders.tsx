'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiProvider, createTheme } from '@mui/material/styles'

export function ThemeProviders({
  children,
  initialTheme,
  initialThemeCookiePresent,
}: {
  children: React.ReactNode
  initialTheme: 'light' | 'dark'
  initialThemeCookiePresent: boolean
}) {
  // Initialize from server
  const [mode, setMode] = useState<'light' | 'dark'>(initialTheme)

  // On mount, if no cookie, use system preference
  useEffect(() => {
    if (!initialThemeCookiePresent) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
  }, [initialThemeCookiePresent])

  // Sync HTML attribute and cookie
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    document.cookie = `theme=${mode};path=/;max-age=${60 * 60 * 24 * 365}`
  }, [mode])

  // Create MUI theme
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

  return <MuiProvider theme={muiTheme}>{children}</MuiProvider>
}

'use client'

import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import React from 'react'
import { useThemeContext } from '@viralytics/components/Theme/ThemeProviders'

export function ThemeToggle() {
  const { mode, setMode } = useThemeContext()

  const toggle = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <IconButton onClick={toggle}>
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  )
}

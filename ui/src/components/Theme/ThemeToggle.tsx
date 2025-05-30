'use client'
import { MdLightMode } from 'react-icons/md'
import { MdNightlight } from 'react-icons/md'
import React from 'react'
import { useThemeContext } from '@viralytics/components/Theme/ThemeProviders'

export function ThemeToggle() {
  const { mode, setMode } = useThemeContext()

  const toggle = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <button onClick={toggle}>
      {mode === 'dark' ? <MdLightMode /> : <MdNightlight />}
    </button>
  )
}

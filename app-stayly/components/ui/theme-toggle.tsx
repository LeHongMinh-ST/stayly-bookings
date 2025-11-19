'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * ThemeToggle switches between light and dark themes for operator preference.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleToggle = useCallback(() => {
    const currentTheme = resolvedTheme ?? 'light'
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }, [resolvedTheme, setTheme])

  const icon = !mounted ? <Moon className='size-4' /> : resolvedTheme === 'dark' ? <Sun className='size-4' /> : <Moon className='size-4' />

  return (
    <Button aria-label='Toggle theme' intent='ghost' onClick={handleToggle}>
      {icon}
    </Button>
  )
}


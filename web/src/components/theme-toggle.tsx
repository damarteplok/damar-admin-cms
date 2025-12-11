import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('theme')
    if (stored) {
      const dark = stored === 'dark'
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    } else {
      // default to system preference
      const prefersDark = window.matchMedia?.(
        '(prefers-color-scheme: dark)',
      ).matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggle = () => {
    const next = !(isDark ?? false)
    setIsDark(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch (_) {}
    document.documentElement.classList.toggle('dark', next)
  }

  if (isDark === null) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

export default ThemeToggle

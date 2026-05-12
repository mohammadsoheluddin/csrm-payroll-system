import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { useThemeStore } from '@/stores/theme.store'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      root.dataset.theme = systemTheme
      return
    }

    root.classList.add(theme)
    root.dataset.theme = theme
  }, [theme])

  return <>{children}</>
}

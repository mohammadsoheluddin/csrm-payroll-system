import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { useLayoutStore } from '@/stores/layout.store'
import { useThemeStore } from '@/stores/theme.store'

const resolveSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore((state) => state.theme)
  const preset = useThemeStore((state) => state.preset)
  const density = useLayoutStore((state) => state.density)

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = () => {
      const resolvedTheme = theme === 'system' ? resolveSystemTheme() : theme

      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.dataset.theme = resolvedTheme
      root.dataset.themeMode = theme
      root.dataset.themePreset = preset
      root.dataset.density = density
    }

    applyTheme()

    if (theme !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)

    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [density, preset, theme])

  return <>{children}</>
}

import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/stores/theme.store'

export const AppHeader = () => {
  const { theme, setTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            CSRM Payroll System
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Frontend Foundation
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  )
}

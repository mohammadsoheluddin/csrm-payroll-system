import { CheckCircle2, LayoutPanelTop, Palette } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { useLayoutStore } from '@/stores/layout.store'
import { themeModes, themePresets, useThemeStore } from '@/stores/theme.store'
import type { ThemeMode, ThemePreset } from '@/stores/theme.store'

const themeModeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const presetLabels: Record<ThemePreset, string> = {
  default: 'Default Blue',
  steel: 'CSRM Steel',
  emerald: 'Emerald HR',
  indigo: 'Indigo Admin',
}

export const ThemeSettingsPage = () => {
  const theme = useThemeStore((state) => state.theme)
  const preset = useThemeStore((state) => state.preset)
  const setTheme = useThemeStore((state) => state.setTheme)
  const setPreset = useThemeStore((state) => state.setPreset)
  const density = useLayoutStore((state) => state.density)
  const setDensity = useLayoutStore((state) => state.setDensity)
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed)
  const setSidebarCollapsed = useLayoutStore((state) => state.setSidebarCollapsed)

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Part-F2 ready</Badge>
            <Badge variant="muted">Persistent UI preferences</Badge>
          </div>
          <CardTitle className="text-2xl">Theme & Layout Settings</CardTitle>
          <CardDescription>
            This page locks the UI preference foundation before authentication and business screens start.
            Preferences are persisted in local storage and applied globally through CSS variables.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme mode
            </CardTitle>
            <CardDescription>Choose light, dark, or system-based UI mode.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {themeModes.map((mode) => (
              <Button
                key={mode}
                variant={theme === mode ? 'primary' : 'outline'}
                onClick={() => setTheme(mode)}
                className="justify-between capitalize"
              >
                {themeModeLabels[mode]}
                {theme === mode && <CheckCircle2 className="h-4 w-4" />}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Color preset
            </CardTitle>
            <CardDescription>Keep the foundation ready for multiple future CSRM UI themes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {themePresets.map((item) => (
              <Button
                key={item}
                variant={preset === item ? 'primary' : 'outline'}
                onClick={() => setPreset(item)}
                className="justify-between"
              >
                {presetLabels[item]}
                {preset === item && <CheckCircle2 className="h-4 w-4" />}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutPanelTop className="h-5 w-5 text-primary" />
            Layout behavior
          </CardTitle>
          <CardDescription>
            Control density and sidebar state. These controls are foundation-level only; role-wise layout
            behavior will connect after auth in Part-F3/F5.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setDensity('comfortable')}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:bg-muted',
              density === 'comfortable' ? 'border-primary bg-primary/5' : 'border-border bg-background',
            )}
          >
            <p className="font-semibold text-foreground">Comfortable density</p>
            <p className="mt-1 text-sm text-muted-foreground">Best for HR/admin daily operations.</p>
          </button>

          <button
            type="button"
            onClick={() => setDensity('compact')}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:bg-muted',
              density === 'compact' ? 'border-primary bg-primary/5' : 'border-border bg-background',
            )}
          >
            <p className="font-semibold text-foreground">Compact density</p>
            <p className="mt-1 text-sm text-muted-foreground">Useful for large data tables and reports.</p>
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-2xl border border-border bg-background p-4 text-left transition hover:bg-muted"
          >
            <p className="font-semibold text-foreground">
              {isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Current desktop sidebar state is {isSidebarCollapsed ? 'collapsed' : 'expanded'}.
            </p>
          </button>
        </CardContent>
      </Card>
    </section>
  )
}

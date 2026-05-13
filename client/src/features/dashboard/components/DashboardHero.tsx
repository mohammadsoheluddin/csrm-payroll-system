import { Eye, RotateCcw, Settings2, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import type { AuthUser } from '@/types/auth.types'

type DashboardHeroProps = {
  user: AuthUser | null
  visibleWidgetCount: number
  totalWidgetCount: number
  isSettingsOpen: boolean
  onToggleSettings: () => void
  onResetPreferences: () => void
}

export const DashboardHero = ({
  user,
  visibleWidgetCount,
  totalWidgetCount,
  isSettingsOpen,
  onToggleSettings,
  onResetPreferences,
}: DashboardHeroProps) => {
  const roleLabel = user?.role?.replaceAll('_', ' ') ?? 'user'

  return (
    <Card className="overflow-hidden">
      <div className="relative border-b border-border bg-muted/40 px-6 py-8">
        <div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 p-4 text-primary sm:block">
          <Sparkles className="h-8 w-8" />
        </div>
        <Badge variant="success">Part-F6</Badge>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground">
          Role-Based Dashboard + Widget Customization
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
          The dashboard is now ready to become the CSRM Payroll home screen: role-wise widgets,
          configurable visibility, quick actions, and report-focused cards are controlled from a central dashboard registry.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={onToggleSettings} variant={isSettingsOpen ? 'primary' : 'outline'}>
            <Settings2 className="h-4 w-4" />
            {isSettingsOpen ? 'Hide widget settings' : 'Customize widgets'}
          </Button>
          <Button variant="outline" onClick={onResetPreferences}>
            <RotateCcw className="h-4 w-4" />
            Reset dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">Current role</p>
          <p className="mt-2 text-2xl font-bold capitalize tracking-tight text-foreground">{roleLabel}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Widgets and quick actions are filtered from the same permission map used by sidebar and routes.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">Visible widgets</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            {visibleWidgetCount}
            <span className="text-sm font-medium text-muted-foreground">/ {totalWidgetCount}</span>
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Hidden widgets stay saved in local dashboard preference storage.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">Dashboard readiness</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Eye className={cn('h-6 w-6 text-primary')} />
            Foundation
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Real API summary widgets can now be connected module by module without redesigning the dashboard shell.
          </p>
        </div>
      </div>
    </Card>
  )
}

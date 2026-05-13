import { useMemo, useState } from 'react'

import { DashboardHero } from '@/features/dashboard/components/DashboardHero'
import { DashboardMetricStrip } from '@/features/dashboard/components/DashboardMetricStrip'
import { DashboardWidgetGrid } from '@/features/dashboard/components/DashboardWidgetGrid'
import { DashboardWidgetSettingsPanel } from '@/features/dashboard/components/DashboardWidgetSettingsPanel'
import {
  defaultDashboardWidgetOrder,
  getDashboardWidgetsForRole,
} from '@/features/dashboard/config/dashboardWidgets'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import type { DashboardWidgetDefinition, DashboardWidgetId } from '@/types/dashboard.types'

const orderWidgets = (
  widgets: DashboardWidgetDefinition[],
  widgetOrder: DashboardWidgetId[],
): DashboardWidgetDefinition[] => {
  const order = widgetOrder.length ? widgetOrder : defaultDashboardWidgetOrder
  const orderMap = new Map(order.map((widgetId, index) => [widgetId, index]))

  return [...widgets].sort((firstWidget, secondWidget) => {
    const firstIndex = orderMap.get(firstWidget.id) ?? Number.MAX_SAFE_INTEGER
    const secondIndex = orderMap.get(secondWidget.id) ?? Number.MAX_SAFE_INTEGER
    return firstIndex - secondIndex
  })
}

export const DashboardPage = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const widgetOrder = useDashboardStore((state) => state.widgetOrder)
  const hiddenWidgetIds = useDashboardStore((state) => state.hiddenWidgetIds)
  const density = useDashboardStore((state) => state.density)
  const resetDashboardPreferences = useDashboardStore((state) => state.resetDashboardPreferences)

  const roleWidgets = useMemo(() => getDashboardWidgetsForRole(user?.role), [user?.role])

  const orderedRoleWidgets = useMemo(
    () => orderWidgets(roleWidgets, widgetOrder),
    [roleWidgets, widgetOrder],
  )

  const visibleWidgets = useMemo(
    () =>
      orderedRoleWidgets.filter((widget) => widget.isRequired || !hiddenWidgetIds.includes(widget.id)),
    [hiddenWidgetIds, orderedRoleWidgets],
  )

  return (
    <section className="space-y-6">
      <DashboardHero
        user={user}
        visibleWidgetCount={visibleWidgets.length}
        totalWidgetCount={orderedRoleWidgets.length}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen((currentValue) => !currentValue)}
        onResetPreferences={resetDashboardPreferences}
      />

      <DashboardMetricStrip />

      {isSettingsOpen && <DashboardWidgetSettingsPanel widgets={orderedRoleWidgets} />}

      <DashboardWidgetGrid widgets={visibleWidgets} user={user} density={density} />
    </section>
  )
}

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { defaultDashboardWidgetOrder } from '@/features/dashboard/config/dashboardWidgets'
import type { DashboardDensity, DashboardWidgetId } from '@/types/dashboard.types'

export type DashboardState = {
  hiddenWidgetIds: DashboardWidgetId[]
  widgetOrder: DashboardWidgetId[]
  density: DashboardDensity
  hideWidget: (widgetId: DashboardWidgetId) => void
  showWidget: (widgetId: DashboardWidgetId) => void
  toggleWidgetVisibility: (widgetId: DashboardWidgetId) => void
  moveWidget: (widgetId: DashboardWidgetId, direction: 'up' | 'down') => void
  resetDashboardPreferences: () => void
  setDensity: (density: DashboardDensity) => void
}

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      hiddenWidgetIds: [],
      widgetOrder: defaultDashboardWidgetOrder,
      density: 'comfortable',

      hideWidget: (widgetId) => {
        set((state) => ({
          hiddenWidgetIds: state.hiddenWidgetIds.includes(widgetId)
            ? state.hiddenWidgetIds
            : [...state.hiddenWidgetIds, widgetId],
        }))
      },

      showWidget: (widgetId) => {
        set((state) => ({
          hiddenWidgetIds: state.hiddenWidgetIds.filter((id) => id !== widgetId),
        }))
      },

      toggleWidgetVisibility: (widgetId) => {
        const isHidden = get().hiddenWidgetIds.includes(widgetId)
        if (isHidden) {
          get().showWidget(widgetId)
          return
        }

        get().hideWidget(widgetId)
      },

      moveWidget: (widgetId, direction) => {
        const currentOrder = get().widgetOrder.length
          ? get().widgetOrder
          : defaultDashboardWidgetOrder
        const currentIndex = currentOrder.indexOf(widgetId)

        if (currentIndex === -1) {
          return
        }

        const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (nextIndex < 0 || nextIndex >= currentOrder.length) {
          return
        }

        set({ widgetOrder: moveItem(currentOrder, currentIndex, nextIndex) })
      },

      resetDashboardPreferences: () => {
        set({
          hiddenWidgetIds: [],
          widgetOrder: defaultDashboardWidgetOrder,
          density: 'comfortable',
        })
      },

      setDensity: (density) => set({ density }),
    }),
    {
      name: 'csrm-dashboard-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

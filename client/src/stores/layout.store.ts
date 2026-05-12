import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LayoutDensity = 'comfortable' | 'compact'

export type LayoutState = {
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  density: LayoutDensity
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (isCollapsed: boolean) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  setDensity: (density: LayoutDensity) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      density: 'comfortable',
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (isCollapsed) =>
        set({ isSidebarCollapsed: isCollapsed }),
      openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
      setDensity: (density) => set({ density }),
    }),
    {
      name: 'csrm-ui-layout',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        density: state.density,
      }),
    },
  ),
)

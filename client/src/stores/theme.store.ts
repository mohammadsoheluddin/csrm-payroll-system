import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'default' | 'steel' | 'emerald' | 'indigo'

export type ThemeState = {
  theme: ThemeMode
  preset: ThemePreset
  setTheme: (theme: ThemeMode) => void
  setPreset: (preset: ThemePreset) => void
}

export const themeModes: ThemeMode[] = ['light', 'dark', 'system']
export const themePresets: ThemePreset[] = ['default', 'steel', 'emerald', 'indigo']

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      preset: 'default',
      setTheme: (theme) => set({ theme }),
      setPreset: (preset) => set({ preset }),
    }),
    {
      name: 'csrm-ui-theme',
    },
  ),
)

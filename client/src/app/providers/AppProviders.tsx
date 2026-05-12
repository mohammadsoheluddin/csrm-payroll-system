import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/app/providers/AuthProvider'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

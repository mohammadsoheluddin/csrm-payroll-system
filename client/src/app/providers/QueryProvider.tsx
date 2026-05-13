import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { createAppQueryClient } from '@/lib/query/queryClient'

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createAppQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

import { Outlet } from 'react-router-dom'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar />
        <MobileSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

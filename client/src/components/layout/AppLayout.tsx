import { Outlet } from 'react-router-dom'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

export const AppLayout = () => {
  return (
    <div className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar />
        <MobileSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 xl:px-8">
            <div className="csrm-page-enter mx-auto w-full max-w-[1560px] space-y-5 sm:space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

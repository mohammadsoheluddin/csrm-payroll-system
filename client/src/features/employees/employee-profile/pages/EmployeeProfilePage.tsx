import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { getEmployeeProfile } from '@/features/employees/employee-profile/api/employeeProfile.api'
import { EmployeeProfileHeader } from '@/features/employees/employee-profile/components/EmployeeProfileHeader'
import { EmployeeProfileStatCards } from '@/features/employees/employee-profile/components/EmployeeProfileStatCards'
import { EmployeeProfileTabs } from '@/features/employees/employee-profile/components/EmployeeProfileTabs'
import type { EmployeeProfileQueryParams } from '@/features/employees/employee-profile/types/employeeProfile.types'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const currentYear = new Date().getFullYear()

export const EmployeeProfilePage = () => {
  const { employeeRef = '' } = useParams<{ employeeRef: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [year, setYear] = useState(searchParams.get('year') || String(currentYear))
  const [payrollMonth, setPayrollMonth] = useState(searchParams.get('payrollMonth') || '')

  const profileParams = useMemo<EmployeeProfileQueryParams>(
    () => ({
      year,
      payrollMonth,
      historyLimit: 18,
      movementLimit: 20,
      legacyLimit: 30,
    }),
    [year, payrollMonth],
  )

  const profileQuery = useQuery({
    queryKey: queryKeys.employeeProfiles.detail(employeeRef, profileParams),
    queryFn: () => getEmployeeProfile(employeeRef, profileParams),
    enabled: Boolean(employeeRef) && canAccess([PERMISSIONS.EMPLOYEE_READ]),
  })

  const syncFiltersToUrl = () => {
    const nextParams = new URLSearchParams()

    if (year) {
      nextParams.set('year', year)
    }

    if (payrollMonth) {
      nextParams.set('payrollMonth', payrollMonth)
    }

    setSearchParams(nextParams)
  }

  if (!canAccess([PERMISSIONS.EMPLOYEE_READ])) {
    return (
      <PermissionDeniedInline
        title="Employee profile permission required"
        message="Your current role does not have employee:read permission."
      />
    )
  }

  if (!employeeRef) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Employee reference missing</p>
            <p>Open this page from employee directory or provide employee ID, office ID, card no, or MongoDB ID in the URL.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Employee Digital Service Book</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Full Employee Profile</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              Aggregated employee profile page using Part-B53 backend API. Legacy salary archive remains read-only archive data and is not mixed with native payroll calculation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[10rem_12rem_auto] sm:items-end">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Year</span>
              <input
                type="number"
                min="2020"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Payroll Month</span>
              <input
                type="month"
                value={payrollMonth}
                onChange={(event) => setPayrollMonth(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setPayrollMonth('')}>Clear Month</Button>
              <Button type="button" onClick={syncFiltersToUrl}>Apply</Button>
            </div>
          </div>
        </div>
      </Card>

      {profileQuery.isLoading && (
        <LoadingState
          title="Loading employee service book"
          message="Aggregating employee, salary, payment, attendance, leave, document, movement, payroll, and legacy archive sections."
        />
      )}

      {profileQuery.isError && <ApiErrorState error={profileQuery.error} onRetry={() => profileQuery.refetch()} />}

      {profileQuery.data && (
        <>
          <EmployeeProfileHeader
            profile={profileQuery.data}
            isRefreshing={profileQuery.isFetching}
            onRefresh={() => profileQuery.refetch()}
          />

          <EmployeeProfileStatCards profile={profileQuery.data} />

          <EmployeeProfileTabs profile={profileQuery.data} />

          <Card className="p-5">
            <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <RefreshCcw className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Part-F19 integration note</p>
                <p>
                  This page is a read-only digital service book foundation. Editing still belongs to dedicated modules such as employee directory, document vault, salary structure, attendance, leave, payroll, and future movement screens.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </section>
  )
}

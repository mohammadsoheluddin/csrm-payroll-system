import { BadgeCheck, BriefcaseBusiness, UserRoundCheck, UsersRound } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'

export type EmployeeStatCardsProps = {
  employees: EmployeeRecord[]
}

const countBy = (employees: EmployeeRecord[], predicate: (employee: EmployeeRecord) => boolean) => {
  return employees.filter(predicate).length
}

export const EmployeeStatCards = ({ employees }: EmployeeStatCardsProps) => {
  const activeCount = countBy(employees, (employee) => employee.status === 'active')
  const confirmedCount = countBy(employees, (employee) => employee.employmentStatus === 'confirmed')
  const monthlyCount = countBy(employees, (employee) => employee.payType === 'monthly')

  const cards = [
    {
      label: 'Visible Employees',
      value: employees.length,
      icon: UsersRound,
      description: 'Filtered directory result',
    },
    {
      label: 'Active Status',
      value: activeCount,
      icon: UserRoundCheck,
      description: 'System active employees',
    },
    {
      label: 'Confirmed',
      value: confirmedCount,
      icon: BadgeCheck,
      description: 'Confirmed employment lifecycle',
    },
    {
      label: 'Monthly Pay',
      value: monthlyCount,
      icon: BriefcaseBusiness,
      description: 'Monthly payroll employee type',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

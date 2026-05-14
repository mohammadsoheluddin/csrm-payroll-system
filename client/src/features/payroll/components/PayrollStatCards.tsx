import { Banknote, CheckCircle2, FileSpreadsheet, LockKeyhole } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/features/payroll/utils/payroll.utils'

export type PayrollStatCardsProps = {
  totalRecords: number
  totalAmount?: number
  processedCount?: number
  lockedCount?: number
  amountLabel?: string
}

export const PayrollStatCards = ({
  totalRecords,
  totalAmount = 0,
  processedCount = 0,
  lockedCount = 0,
  amountLabel = 'Total Payable',
}: PayrollStatCardsProps) => {
  const cards = [
    {
      label: 'Total Records',
      value: totalRecords,
      icon: FileSpreadsheet,
    },
    {
      label: amountLabel,
      value: formatCurrency(totalAmount),
      icon: Banknote,
    },
    {
      label: 'Processed / Approved',
      value: processedCount,
      icon: CheckCircle2,
    },
    {
      label: 'Locked',
      value: lockedCount,
      icon: LockKeyhole,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between pt-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

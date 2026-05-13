import { ArchiveRestore, Database, ShieldCheck, ToggleRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import type { MasterDataRecord } from '@/features/master-data/types/masterData.types'

export type MasterDataStatCardsProps = {
  records: MasterDataRecord[]
  canManage: boolean
  supportsRestore: boolean
}

const countStatus = (records: MasterDataRecord[], status: string) => {
  return records.filter((record) => record.status === status).length
}

export const MasterDataStatCards = ({ records, canManage, supportsRestore }: MasterDataStatCardsProps) => {
  const stats = [
    {
      label: 'Total records',
      value: records.length,
      icon: Database,
      description: 'Loaded from backend API',
    },
    {
      label: 'Active',
      value: countStatus(records, 'active'),
      icon: ToggleRight,
      description: 'Available for operations',
    },
    {
      label: 'Manage access',
      value: canManage ? 'Allowed' : 'Read only',
      icon: ShieldCheck,
      description: 'Based on frontend permission guard',
    },
    {
      label: 'Restore flow',
      value: supportsRestore ? 'Ready' : 'N/A',
      icon: ArchiveRestore,
      description: 'Soft delete/restore support',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <p className="mt-1 truncate text-xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

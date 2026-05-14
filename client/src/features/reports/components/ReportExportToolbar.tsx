import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { ReportExportType } from '@/features/reports/types/report.types'

export type ReportExportToolbarProps = {
  onExport: (type: ReportExportType) => void
  isExporting?: boolean
  disabled?: boolean
  supportedTypes?: ReportExportType[]
}

export const ReportExportToolbar = ({
  onExport,
  isExporting,
  disabled,
  supportedTypes = ['excel', 'pdf', 'csv'],
}: ReportExportToolbarProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {supportedTypes.map((type) => (
        <Button
          key={type}
          variant="outline"
          onClick={() => onExport(type)}
          disabled={disabled || isExporting}
        >
          <FileDown className="h-4 w-4" />
          {type === 'excel' ? 'Excel' : type.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}

import { FileSpreadsheet, FileText, TableProperties } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

const standards = [
  {
    title: 'Preview First',
    icon: TableProperties,
    description: 'Every sensitive payroll report should show a backend preview before export.',
    rules: ['Month/year/company filters are visible', 'Totals are shown separately', 'No frontend salary calculation'],
  },
  {
    title: 'Excel Export',
    icon: FileSpreadsheet,
    description: 'Excel exports should preserve company, department, employee, amount, and signature-ready summary sections.',
    rules: ['Use backend file response', 'Use safe filename', 'Keep numeric amount columns export-friendly'],
  },
  {
    title: 'PDF Export',
    icon: FileText,
    description: 'PDF exports are official printable reports and must be backend-rendered or backend-controlled.',
    rules: ['Show selected period', 'Show prepared/checked/approved area where needed', 'Avoid browser-only print for official reports'],
  },
]

export const ReportLayoutStandardsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F11</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Report Layout Standards</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Locked UI pattern for report preview, official export, and backend-controlled payroll report output.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {standards.map((standard) => {
          const Icon = standard.icon
          return (
            <Card key={standard.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{standard.title}</CardTitle>
                    <CardDescription>{standard.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {standard.rules.map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <Badge variant="muted">Rule</Badge>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frontend Rule</CardTitle>
          <CardDescription>Payroll report numbers must come from backend APIs.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          The frontend can filter, preview, download, and format report data. It must not recalculate salary, OT, tax, loan, suspense, bank/cash, or payable amounts.
        </CardContent>
      </Card>
    </div>
  )
}

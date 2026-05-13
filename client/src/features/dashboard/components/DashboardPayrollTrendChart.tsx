import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { payrollTrendMockData } from '@/features/dashboard/data/dashboardFoundationData'

export const DashboardPayrollTrendChart = () => {
  return (
    <div className="h-64 w-full rounded-2xl border border-border bg-background p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={payrollTrendMockData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ opacity: 0.12 }}
            formatter={(value, name) => [`${String(value)} lac`, String(name).toUpperCase()]}
          />
          <Bar dataKey="salary" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
          <Bar dataKey="ot" radius={[8, 8, 0, 0]} fill="hsl(var(--muted-foreground))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

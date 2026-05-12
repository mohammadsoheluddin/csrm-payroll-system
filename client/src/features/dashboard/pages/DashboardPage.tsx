const setupCards = [
  'React + TypeScript + Vite foundation ready',
  'Tailwind CSS theme variables connected',
  'Router shell prepared for protected app routes',
  'TanStack Query provider installed',
  'Theme store prepared for light/dark/system mode',
  'Permission config synced from backend user.constant.ts',
]

export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Part-F1
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          Frontend Project Setup
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          The default Vite starter screen has been replaced with a clean CSRM
          Payroll frontend foundation. Business screens will start after this
          setup is verified.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {setupCards.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

import { ShieldCheck } from 'lucide-react'

export const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              CSRM Payroll System
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-5">
          <p className="text-sm font-semibold text-foreground">
            Login UI will start in Part-F3.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Part-F1 only prepares the frontend project setup, route shell,
            Tailwind theme foundation, and folder structure.
          </p>
        </div>
      </section>
    </main>
  )
}

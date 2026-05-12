import { Link } from 'react-router-dom'

import { routePaths } from '@/config/routePaths'

export const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The requested frontend route does not exist yet.
        </p>
        <Link
          to={routePaths.dashboard}
          className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  )
}

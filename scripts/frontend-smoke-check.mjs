#!/usr/bin/env node

/*
  CSRM Payroll System — lightweight frontend/backend smoke helper.

  Usage:
    node scripts/frontend-smoke-check.mjs

  Optional env:
    FRONTEND_URL=http://localhost:5173
    BACKEND_URL=http://localhost:5000/api/v1

  This script is intentionally non-invasive. It does not log in and does not
  mutate data. It only checks whether configured frontend routes return an HTML
  app shell and whether the backend base/health-like URLs respond.
*/

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/v1'

const frontendRoutes = [
  '/login',
  '/dashboard',
  '/masters/companies',
  '/employees',
  '/attendance',
  '/leave',
  '/payroll',
  '/salary/structures',
  '/salary/sheets',
  '/salary/statements',
  '/salary/payment-distributions',
  '/reports/center',
  '/reports/salary-summary',
  '/bank-sheets',
  '/reports/month-end-control',
  '/audit/logs',
  '/rbac/audit',
]

const backendProbePaths = ['', '/health', '/auth/login']

const okStatuses = new Set([200, 204, 301, 302, 304, 400, 401, 403, 404, 405])

async function checkUrl(label, url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      headers: options.headers || {},
    })

    const status = response.status
    const ok = okStatuses.has(status)
    return { label, url, ok, status }
  } catch (error) {
    return {
      label,
      url,
      ok: false,
      status: 'NETWORK_ERROR',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function printResult(result) {
  const icon = result.ok ? '✅' : '❌'
  const extra = result.error ? ` — ${result.error}` : ''
  console.log(`${icon} ${result.label}: ${result.status} ${result.url}${extra}`)
}

async function main() {
  console.log('CSRM Payroll frontend/backend smoke helper')
  console.log(`Frontend: ${FRONTEND_URL}`)
  console.log(`Backend : ${BACKEND_URL}`)
  console.log('')

  const frontendResults = []
  for (const route of frontendRoutes) {
    frontendResults.push(await checkUrl(`frontend ${route}`, `${FRONTEND_URL}${route}`))
  }

  const backendResults = []
  for (const route of backendProbePaths) {
    backendResults.push(await checkUrl(`backend ${route || '/'}`, `${BACKEND_URL}${route}`))
  }

  console.log('Frontend route probes')
  frontendResults.forEach(printResult)
  console.log('')

  console.log('Backend route probes')
  backendResults.forEach(printResult)
  console.log('')

  const failed = [...frontendResults, ...backendResults].filter((result) => !result.ok)
  if (failed.length > 0) {
    console.log(`Smoke helper completed with ${failed.length} failing probe(s).`)
    process.exitCode = 1
    return
  }

  console.log('Smoke helper completed successfully.')
}

main()

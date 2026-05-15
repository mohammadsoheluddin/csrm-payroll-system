#!/usr/bin/env node

/*
  CSRM Payroll System — frontend/backend smoke helper.

  Usage:
    node scripts/frontend-smoke-check.mjs

  Optional env:
    FRONTEND_URL=http://localhost:5173
    BACKEND_URL=http://localhost:5000/api/v1
    API_AUTH_TOKEN=<optional access token for authenticated API probe>

  This script is intentionally non-invasive. It does not mutate data. It checks
  whether the frontend SPA routes return an HTML app shell and whether selected
  backend endpoints respond with expected/safe statuses.
*/

const FRONTEND_URL = normalizeBaseUrl(process.env.FRONTEND_URL || 'http://localhost:5173')
const BACKEND_URL = normalizeBaseUrl(process.env.BACKEND_URL || 'http://localhost:5000/api/v1')
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || ''
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 8000)

const frontendRoutes = [
  { area: 'Auth', path: '/login' },
  { area: 'Auth', path: '/dashboard' },
  { area: 'Master Data', path: '/masters/companies' },
  { area: 'Master Data', path: '/masters/branches' },
  { area: 'Master Data', path: '/masters/major-departments' },
  { area: 'Master Data', path: '/masters/departments' },
  { area: 'Master Data', path: '/masters/designations' },
  { area: 'Master Data', path: '/masters/company-bank-accounts' },
  { area: 'Employee', path: '/employees' },
  { area: 'Attendance', path: '/attendance' },
  { area: 'Leave', path: '/leave' },
  { area: 'Payroll', path: '/payroll' },
  { area: 'Salary', path: '/salary/structures' },
  { area: 'Salary', path: '/salary/sheets' },
  { area: 'Salary', path: '/salary/statements' },
  { area: 'Salary', path: '/salary/payment-distributions' },
  { area: 'Salary', path: '/salary/legacy-imports' },
  { area: 'Reports', path: '/reports/center' },
  { area: 'Reports', path: '/reports/salary-summary' },
  { area: 'Reports', path: '/bank-sheets' },
  { area: 'Reports', path: '/reports/month-end-control' },
  { area: 'Reports', path: '/reports/layout-standards' },
  { area: 'Audit', path: '/audit/logs' },
  { area: 'RBAC', path: '/rbac/audit' },
]

const backendProbes = [
  {
    label: 'backend api root',
    path: '',
    okStatuses: [200, 204, 301, 302, 400, 401, 403, 404, 405],
  },
  {
    label: 'backend health',
    path: '/health',
    okStatuses: [200, 204, 301, 302, 400, 401, 403, 404, 405],
  },
  {
    label: 'backend auth login route probe',
    path: '/auth/login',
    okStatuses: [200, 400, 401, 403, 404, 405],
  },
]

if (API_AUTH_TOKEN) {
  backendProbes.push({
    label: 'backend authenticated user probe',
    path: '/users/me',
    okStatuses: [200, 401, 403],
    headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
  })
}

function normalizeBaseUrl(url) {
  return String(url).replace(/\/+$/, '')
}

function buildUrl(baseUrl, path) {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function hasRootElement(html) {
  return /<div\s+id=["']root["']/i.test(html) || /id=["']root["']/i.test(html)
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

async function checkFrontendRoute(route) {
  const url = buildUrl(FRONTEND_URL, route.path)

  try {
    const response = await fetchWithTimeout(url, { method: 'GET' })
    const contentType = response.headers.get('content-type') || ''
    const body = await response.text()
    const statusOk = response.status >= 200 && response.status < 400
    const htmlOk = contentType.includes('text/html') || body.trim().startsWith('<!doctype html') || body.includes('<html')
    const rootOk = hasRootElement(body)
    const ok = statusOk && htmlOk && rootOk

    return {
      type: 'frontend',
      area: route.area,
      label: route.path,
      url,
      ok,
      status: response.status,
      note: ok ? 'SPA shell OK' : `statusOk=${statusOk}, htmlOk=${htmlOk}, rootOk=${rootOk}`,
    }
  } catch (error) {
    return {
      type: 'frontend',
      area: route.area,
      label: route.path,
      url,
      ok: false,
      status: 'NETWORK_ERROR',
      note: error instanceof Error ? error.message : String(error),
    }
  }
}

async function checkBackendProbe(probe) {
  const url = buildUrl(BACKEND_URL, probe.path)

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: probe.headers || {},
    })
    const ok = probe.okStatuses.includes(response.status)

    return {
      type: 'backend',
      area: 'Backend',
      label: probe.label,
      url,
      ok,
      status: response.status,
      note: ok ? 'Backend route reachable' : `Unexpected status. Allowed: ${probe.okStatuses.join(', ')}`,
    }
  } catch (error) {
    return {
      type: 'backend',
      area: 'Backend',
      label: probe.label,
      url,
      ok: false,
      status: 'NETWORK_ERROR',
      note: error instanceof Error ? error.message : String(error),
    }
  }
}

function printResult(result) {
  const icon = result.ok ? '✅' : '❌'
  console.log(`${icon} [${result.area}] ${result.label}: ${result.status} — ${result.note}`)
  console.log(`   ${result.url}`)
}

function printSummary(results) {
  const total = results.length
  const passed = results.filter((result) => result.ok).length
  const failed = total - passed

  console.log('')
  console.log('Summary')
  console.log(`Total : ${total}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    console.log('')
    console.log('Failed probes')
    results.filter((result) => !result.ok).forEach(printResult)
  }

  return failed
}

async function main() {
  console.log('CSRM Payroll frontend/backend smoke helper')
  console.log(`Frontend: ${FRONTEND_URL}`)
  console.log(`Backend : ${BACKEND_URL}`)
  console.log(`Timeout : ${TIMEOUT_MS}ms`)
  console.log('')

  console.log('Frontend route probes')
  const frontendResults = []
  for (const route of frontendRoutes) {
    const result = await checkFrontendRoute(route)
    frontendResults.push(result)
    printResult(result)
  }

  console.log('')
  console.log('Backend route probes')
  const backendResults = []
  for (const probe of backendProbes) {
    const result = await checkBackendProbe(probe)
    backendResults.push(result)
    printResult(result)
  }

  const failed = printSummary([...frontendResults, ...backendResults])

  if (failed > 0) {
    console.log('')
    console.log('Smoke helper completed with failing probe(s). Review the failed URLs above.')
    process.exitCode = 1
    return
  }

  console.log('')
  console.log('Smoke helper completed successfully.')
}

main()

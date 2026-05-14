import { apiRoutes } from '@/config/apiRoutes'
import { PERMISSIONS } from '@/config/permissions'
import type { PayrollWorkflowModuleConfig } from '@/features/payroll/types/payroll.types'

export const payrollWorkflowModules: Record<string, PayrollWorkflowModuleConfig> = {
  salarySheets: {
    key: 'salarySheets',
    title: 'Salary Sheets',
    shortTitle: 'Sheets',
    description:
      'Generate and control monthly salary sheets after attendance finalization and salary structure readiness.',
    api: apiRoutes.salarySheets,
    permissions: {
      read: PERMISSIONS.SALARY_SHEET_READ,
      process: PERMISSIONS.SALARY_SHEET_PROCESS,
      approve: PERMISSIONS.SALARY_SHEET_APPROVE,
      lock: PERMISSIONS.SALARY_SHEET_LOCK,
      unlock: PERMISSIONS.SALARY_SHEET_UNLOCK,
    },
  },
  salaryStatements: {
    key: 'salaryStatements',
    title: 'Salary Statements',
    shortTitle: 'Statements',
    description:
      'Prepare statement-ready salary records from approved salary sheets for accounts and payment processing.',
    api: apiRoutes.salaryStatements,
    permissions: {
      read: PERMISSIONS.SALARY_STATEMENT_READ,
      process: PERMISSIONS.SALARY_STATEMENT_PROCESS,
      approve: PERMISSIONS.SALARY_STATEMENT_APPROVE,
      lock: PERMISSIONS.SALARY_STATEMENT_LOCK,
      unlock: PERMISSIONS.SALARY_STATEMENT_UNLOCK,
    },
  },
  salaryPaymentDistributions: {
    key: 'salaryPaymentDistributions',
    title: 'Salary Payment Distribution',
    shortTitle: 'Payments',
    description:
      'Prepare bank, cash, and mobile payment distribution records from salary statements.',
    api: apiRoutes.salaryPaymentDistributions,
    permissions: {
      read: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ,
      process: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS,
      approve: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_APPROVE,
      lock: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_LOCK,
      unlock: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_UNLOCK,
      export: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_EXPORT,
    },
    supportsPaymentMode: true,
    supportsExport: true,
  },
}

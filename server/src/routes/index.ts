import { Router } from "express";

import auditLogRoutes from "../modules/auditLog/auditLog.route";

import bankSheetRoutes from "../modules/bankSheet/bankSheet.route";

import attendanceRoutes from "../modules/attendance/attendance.route";

import attendanceImportRoutes from "../modules/attendanceImport/attendanceImport.route";

import attendanceFinalizationRoutes from "../modules/attendanceFinalization/attendanceFinalization.route";

import authRoutes from "../modules/auth/auth.route";

import branchRoutes from "../modules/branch/branch.route";

import bonusSheetRoutes from "../modules/bonusSheet/bonusSheet.route";

import bonusStatementRoutes from "../modules/bonusStatement/bonusStatement.route";

import bonusPaymentDistributionRoutes from "../modules/bonusPaymentDistribution/bonusPaymentDistribution.route";

import companyRoutes from "../modules/company/company.route";

import { CompanyBankAccountRoutes } from "../modules/companyBankAccount/companyBankAccount.route";

import departmentRoutes from "../modules/department/department.route";

import designationRoutes from "../modules/designation/designation.route";

import employeeBankInfoRoutes from "../modules/employeeBankInfo/employeeBankInfo.route";

import { employeeMovementRoutes } from "../modules/employeeMovement/employeeMovement.route";

import employeeRoutes from "../modules/employee/employee.route";

import employeeBulkImportRoutes from "../modules/employeeBulkImport/employeeBulkImport.route";

import holidayRoutes from "../modules/holiday/holiday.route";

import leaveRoutes from "../modules/leave/leave.route";

import leaveBalanceRoutes from "../modules/leaveBalance/leaveBalance.route";

import majorDepartmentRoutes from "../modules/majorDepartment/majorDepartment.route";

import monthEndProcessControlRoutes from "../modules/monthEndProcessControl/monthEndProcessControl.route";

import { payrollRoutes } from "../modules/payroll/payroll.route";

import { payrollReportRoutes } from "../modules/payrollReport/payrollReport.route";

import reportCenterRoutes from "../modules/reportCenter/reportCenter.route";

import reportLayoutStandardRoutes from "../modules/reportLayoutStandard/reportLayoutStandard.route";

import rbacAuditRoutes from "../modules/rbacAudit/rbacAudit.route";

import salaryStructureRoutes from "../modules/salaryStructure/salaryStructure.route";

import salarySheetRoutes from "../modules/salarySheet/salarySheet.route";

import salaryStatementRoutes from "../modules/salaryStatement/salaryStatement.route";

import salaryPaymentDistributionRoutes from "../modules/salaryPaymentDistribution/salaryPaymentDistribution.route";

import timeBillRoutes from "../modules/timeBill/timeBill.route";

import otStatementRoutes from "../modules/otStatement/otStatement.route";

import otPaymentDistributionRoutes from "../modules/otPaymentDistribution/otPaymentDistribution.route";

import userRoutes from "../modules/user/user.route";

import healthRoutes from "./health.route";

import protectedRoutes from "./protected.route";

import { BankSheetHistoryRoutes } from "../modules/bankSheetHistory/bankSheetHistory.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/",
    route: healthRoutes,
  },

  {
    path: "/auth",
    route: authRoutes,
  },

  {
    path: "/protected",
    route: protectedRoutes,
  },

  {
    path: "/users",
    route: userRoutes,
  },

  {
    path: "/companies",
    route: companyRoutes,
  },

  {
    path: "/company-bank-accounts",
    route: CompanyBankAccountRoutes,
  },

  {
    path: "/major-departments",
    route: majorDepartmentRoutes,
  },

  {
    path: "/designations",
    route: designationRoutes,
  },

  {
    path: "/employees",
    route: employeeRoutes,
  },

  {
    path: "/employee-bulk-imports",
    route: employeeBulkImportRoutes,
  },

  {
    path: "/employee-bank-infos",
    route: employeeBankInfoRoutes,
  },

  {
    path: "/employee-movements",
    route: employeeMovementRoutes,
  },

  {
    path: "/departments",
    route: departmentRoutes,
  },

  {
    path: "/branches",
    route: branchRoutes,
  },

  {
    path: "/attendance",
    route: attendanceRoutes,
  },

  {
    path: "/attendance-imports",
    route: attendanceImportRoutes,
  },

  {
    path: "/attendance-finalizations",
    route: attendanceFinalizationRoutes,
  },

  {
    path: "/leave",
    route: leaveRoutes,
  },

  {
    path: "/leave-balances",
    route: leaveBalanceRoutes,
  },

  {
    path: "/holiday",
    route: holidayRoutes,
  },

  {
    path: "/salary-structure",
    route: salaryStructureRoutes,
  },

  {
    path: "/salary-sheets",
    route: salarySheetRoutes,
  },

  {
    path: "/salary-statements",
    route: salaryStatementRoutes,
  },

  {
    path: "/salary-payment-distributions",
    route: salaryPaymentDistributionRoutes,
  },

  {
    path: "/payroll",
    route: payrollRoutes,
  },

  {
    path: "/payroll-reports",
    route: payrollReportRoutes,
  },

  {
    path: "/report-center",
    route: reportCenterRoutes,
  },

  {
    path: "/report-layout-standards",
    route: reportLayoutStandardRoutes,
  },

  {
    path: "/rbac-audit",
    route: rbacAuditRoutes,
  },

  {
    path: "/time-bills",
    route: timeBillRoutes,
  },

  {
    path: "/ot-statements",
    route: otStatementRoutes,
  },

  {
    path: "/ot-payment-distributions",
    route: otPaymentDistributionRoutes,
  },

  {
    path: "/month-end-process-control",
    route: monthEndProcessControlRoutes,
  },

  {
    path: "/bonus-sheets",
    route: bonusSheetRoutes,
  },

  {
    path: "/bonus-statements",
    route: bonusStatementRoutes,
  },

  {
    path: "/bonus-payment-distributions",
    route: bonusPaymentDistributionRoutes,
  },

  {
    path: "/bank-sheets",
    route: bankSheetRoutes,
  },

  {
    path: "/audit-logs",
    route: auditLogRoutes,
  },

  {
    path: "/bank-sheet-history",
    route: BankSheetHistoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

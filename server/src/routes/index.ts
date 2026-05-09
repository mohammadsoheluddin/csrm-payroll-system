import { Router } from "express";

import auditLogRoutes from "../modules/auditLog/auditLog.route";

import bankSheetRoutes from "../modules/bankSheet/bankSheet.route";

import attendanceRoutes from "../modules/attendance/attendance.route";

import attendanceFinalizationRoutes from "../modules/attendanceFinalization/attendanceFinalization.route";

import authRoutes from "../modules/auth/auth.route";

import branchRoutes from "../modules/branch/branch.route";

import companyRoutes from "../modules/company/company.route";

import { CompanyBankAccountRoutes } from "../modules/companyBankAccount/companyBankAccount.route";

import departmentRoutes from "../modules/department/department.route";

import designationRoutes from "../modules/designation/designation.route";

import employeeBankInfoRoutes from "../modules/employeeBankInfo/employeeBankInfo.route";

import { employeeMovementRoutes } from "../modules/employeeMovement/employeeMovement.route";

import employeeRoutes from "../modules/employee/employee.route";

import holidayRoutes from "../modules/holiday/holiday.route";

import leaveRoutes from "../modules/leave/leave.route";

import majorDepartmentRoutes from "../modules/majorDepartment/majorDepartment.route";

import { payrollRoutes } from "../modules/payroll/payroll.route";

import { payrollReportRoutes } from "../modules/payrollReport/payrollReport.route";

import salaryStructureRoutes from "../modules/salaryStructure/salaryStructure.route";

import timeBillRoutes from "../modules/timeBill/timeBill.route";

import otStatementRoutes from "../modules/otStatement/otStatement.route";

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
    path: "/attendance-finalizations",
    route: attendanceFinalizationRoutes,
  },

  {
    path: "/leave",
    route: leaveRoutes,
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
    path: "/payroll",
    route: payrollRoutes,
  },

  {
    path: "/payroll-reports",
    route: payrollReportRoutes,
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

import { Router } from "express";
import auditLogRoutes from "../modules/auditLog/auditLog.route";
import attendanceRoutes from "../modules/attendance/attendance.route";
import authRoutes from "../modules/auth/auth.route";
import branchRoutes from "../modules/branch/branch.route";
import companyRoutes from "../modules/company/company.route";
import departmentRoutes from "../modules/department/department.route";
import employeeRoutes from "../modules/employee/employee.route";
import holidayRoutes from "../modules/holiday/holiday.route";
import leaveRoutes from "../modules/leave/leave.route";
import majorDepartmentRoutes from "../modules/majorDepartment/majorDepartment.route";
import { payrollRoutes } from "../modules/payroll/payroll.route";
import { payrollReportRoutes } from "../modules/payrollReport/payrollReport.route";
import salaryStructureRoutes from "../modules/salaryStructure/salaryStructure.route";
import userRoutes from "../modules/user/user.route";
import healthRoutes from "./health.route";
import protectedRoutes from "./protected.route";

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
    path: "/major-departments",
    route: majorDepartmentRoutes,
  },
  {
    path: "/employees",
    route: employeeRoutes,
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
    path: "/audit-logs",
    route: auditLogRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

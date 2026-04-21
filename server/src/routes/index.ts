import { Router } from "express";
import healthRoutes from "./health.route";
import protectedRoutes from "./protected.route";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import employeeRoutes from "../modules/employee/employee.route";
import departmentRoutes from "../modules/department/department.route";
import branchRoutes from "../modules/branch/branch.route";
import attendanceRoutes from "../modules/attendance/attendance.route";
import leaveRoutes from "../modules/leave/leave.route";
import holidayRoutes from "../modules/holiday/holiday.route";
import salaryStructureRoutes from "../modules/salaryStructure/salaryStructure.route";
import { payrollRoutes } from "../modules/payroll/payroll.route";
import { payrollReportRoutes } from "../modules/payrollReport/payrollReport.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

import express from "express";
import auth from "../../middleware/auth";
import { allowOwnEmployeeOrPermission } from "../../middleware/employeeResourceGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { PayrollReportControllers } from "./payrollReport.controller";

const router = express.Router();

router.get(
  "/payslip/:employeeId",
  auth(),
  allowOwnEmployeeOrPermission("employeeId", PERMISSIONS.PAYSLIP_READ_ANY),
  PayrollReportControllers.getEmployeePayslip,
);

router.get(
  "/payslip/:employeeId/pdf",
  auth(),
  allowOwnEmployeeOrPermission("employeeId", PERMISSIONS.PAYSLIP_READ_ANY),
  PayrollReportControllers.downloadPayslipPDF,
);

router.get(
  "/monthly-report",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_REPORT_READ),
  PayrollReportControllers.getMonthlyPayrollReport,
);

router.get(
  "/monthly-report/export/csv",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_REPORT_EXPORT),
  PayrollReportControllers.exportMonthlyPayrollReportCsv,
);

router.get(
  "/monthly-report/export/excel",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_REPORT_EXPORT),
  PayrollReportControllers.exportMonthlyPayrollReportExcel,
);

export const payrollReportRoutes = router;

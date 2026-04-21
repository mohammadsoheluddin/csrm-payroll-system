import express from "express";
import auth from "../../middleware/auth";
import { PayrollReportControllers } from "./payrollReport.controller";

const router = express.Router();

router.get(
  "/payslip/:employeeId",
  auth("super_admin", "admin", "hr", "accounts", "manager", "employee"),
  PayrollReportControllers.getEmployeePayslip,
);

router.get(
  "/payslip/:employeeId/pdf",
  auth("super_admin", "admin", "hr", "accounts", "manager", "employee"),
  PayrollReportControllers.downloadPayslipPDF,
);

router.get(
  "/monthly-report",
  auth("super_admin", "admin", "hr", "accounts", "manager"),
  PayrollReportControllers.getMonthlyPayrollReport,
);

router.get(
  "/monthly-report/export/csv",
  auth("super_admin", "admin", "hr", "accounts", "manager"),
  PayrollReportControllers.exportMonthlyPayrollReportCsv,
);

router.get(
  "/monthly-report/export/excel",
  auth("super_admin", "admin", "hr", "accounts", "manager"),
  PayrollReportControllers.exportMonthlyPayrollReportExcel,
);

export const payrollReportRoutes = router;

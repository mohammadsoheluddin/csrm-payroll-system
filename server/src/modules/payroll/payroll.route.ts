import express from "express";
import auth from "../../middleware/auth";
import { PayrollController } from "./payroll.controller";

const router = express.Router();

router.patch(
  "/:id",
  auth("super_admin", "admin", "hr"),
  PayrollController.updatePayrollById,
);

router.patch(
  "/:id/process",
  auth("super_admin", "admin", "hr"),
  PayrollController.processPayrollById,
);

router.patch(
  "/:id/approve",
  auth("super_admin", "admin", "manager"),
  PayrollController.approvePayrollById,
);

router.patch(
  "/:id/pay",
  auth("super_admin", "admin", "accounts"),
  PayrollController.markPayrollAsPaid,
);

router.patch(
  "/:id/lock",
  auth("super_admin", "admin", "accounts", "manager"),
  PayrollController.lockPayrollById,
);

router.patch(
  "/:id/unlock",
  auth("super_admin", "admin"),
  PayrollController.unlockPayrollById,
);

router.get(
  "/:id/audit-timeline",
  auth("super_admin", "admin", "hr", "accounts", "manager"),
  PayrollController.getPayrollAuditTimeline,
);

router.patch(
  "/batch/approve",
  auth("super_admin", "admin", "manager"),
  PayrollController.approveMonthlyPayrollBatch,
);

router.patch(
  "/batch/lock",
  auth("super_admin", "admin", "accounts", "manager"),
  PayrollController.lockMonthlyPayrollBatch,
);

export const payrollRoutes = router;

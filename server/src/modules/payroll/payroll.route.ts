import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { PayrollController } from "./payroll.controller";

const router = express.Router();

router.patch(
  "/batch/approve",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_BATCH_APPROVE),
  PayrollController.approveMonthlyPayrollBatch,
);

router.patch(
  "/batch/lock",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_BATCH_LOCK),
  PayrollController.lockMonthlyPayrollBatch,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_UPDATE),
  PayrollController.updatePayrollById,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_PROCESS),
  PayrollController.processPayrollById,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_APPROVE),
  PayrollController.approvePayrollById,
);

router.patch(
  "/:id/pay",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_PAY),
  PayrollController.markPayrollAsPaid,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_LOCK),
  PayrollController.lockPayrollById,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_UNLOCK),
  PayrollController.unlockPayrollById,
);

router.get(
  "/:id/audit-timeline",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_AUDIT_READ),
  PayrollController.getPayrollAuditTimeline,
);

export const payrollRoutes = router;

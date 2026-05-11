import express from "express";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { PayrollController } from "./payroll.controller";
import { PayrollGenerateController } from "./payroll.generate.controller";
import { PayrollGenerateValidation } from "./payroll.generate.validation";

const router = express.Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_PROCESS),
  validateRequest(
    PayrollGenerateValidation.generateMonthlyPayrollValidationSchema,
  ),
  PayrollGenerateController.generateMonthlyPayroll,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_READ),
  PayrollController.getDeletedPayroll,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_READ),
  PayrollController.getAllPayroll,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_UPDATE),
  validateRequest(createRestoreValidationSchema("id")),
  PayrollController.restorePayroll,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_UPDATE),
  validateRequest(createSoftDeleteValidationSchema("id")),
  PayrollController.deletePayroll,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_READ),
  PayrollController.getSinglePayroll,
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
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.PAYROLL_LOCK),
  PayrollController.lockPayrollById,
);

export const payrollRoutes = router;

export default router;

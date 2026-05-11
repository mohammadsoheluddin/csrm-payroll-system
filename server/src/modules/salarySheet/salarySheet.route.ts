import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { SalarySheetControllers } from "./salarySheet.controller";
import { SalarySheetValidations } from "./salarySheet.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_PROCESS),
  validateRequest(SalarySheetValidations.generateSalarySheetValidationSchema),
  SalarySheetControllers.generateMonthlySalarySheet,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_READ),
  validateRequest(SalarySheetValidations.salarySheetSummaryQueryValidationSchema),
  SalarySheetControllers.getSalarySheetOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_READ),
  SalarySheetControllers.getAllSalarySheets,
);


router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_PROCESS),
  validateRequest(SalarySheetValidations.salarySheetBulkActionValidationSchema),
  SalarySheetControllers.bulkProcessSalarySheets,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_APPROVE),
  validateRequest(SalarySheetValidations.salarySheetBulkActionValidationSchema),
  SalarySheetControllers.bulkApproveSalarySheets,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_LOCK),
  validateRequest(SalarySheetValidations.salarySheetBulkActionValidationSchema),
  SalarySheetControllers.bulkLockSalarySheets,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_UNLOCK),
  validateRequest(SalarySheetValidations.salarySheetBulkActionValidationSchema),
  SalarySheetControllers.bulkUnlockSalarySheets,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_READ),
  SalarySheetControllers.getDeletedSalarySheets,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_PROCESS),
  validateRequest(createRestoreValidationSchema("id")),
  SalarySheetControllers.restoreSalarySheet,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_PROCESS),
  validateRequest(createSoftDeleteValidationSchema("id")),
  SalarySheetControllers.deleteSalarySheet,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_READ),
  SalarySheetControllers.getSingleSalarySheet,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_PROCESS),
  validateRequest(SalarySheetValidations.salarySheetActionValidationSchema),
  SalarySheetControllers.processSalarySheet,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_APPROVE),
  validateRequest(SalarySheetValidations.salarySheetActionValidationSchema),
  SalarySheetControllers.approveSalarySheet,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_LOCK),
  validateRequest(SalarySheetValidations.salarySheetActionValidationSchema),
  SalarySheetControllers.lockSalarySheet,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SHEET_UNLOCK),
  validateRequest(SalarySheetValidations.salarySheetActionValidationSchema),
  SalarySheetControllers.unlockSalarySheet,
);

export const SalarySheetRoutes = router;
export default router;

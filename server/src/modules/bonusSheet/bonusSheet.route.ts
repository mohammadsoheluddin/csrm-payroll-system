import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { BonusSheetControllers } from "./bonusSheet.controller";
import { BonusSheetValidations } from "./bonusSheet.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_PROCESS),
  validateRequest(BonusSheetValidations.generateBonusSheetValidationSchema),
  BonusSheetControllers.generateMonthlyBonusSheet,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_READ),
  validateRequest(BonusSheetValidations.bonusSheetSummaryQueryValidationSchema),
  BonusSheetControllers.getBonusSheetOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_READ),
  BonusSheetControllers.getAllBonusSheets,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_PROCESS),
  validateRequest(BonusSheetValidations.bonusSheetBulkActionValidationSchema),
  BonusSheetControllers.bulkProcessBonusSheets,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_APPROVE),
  validateRequest(BonusSheetValidations.bonusSheetBulkActionValidationSchema),
  BonusSheetControllers.bulkApproveBonusSheets,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_LOCK),
  validateRequest(BonusSheetValidations.bonusSheetBulkActionValidationSchema),
  BonusSheetControllers.bulkLockBonusSheets,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_UNLOCK),
  validateRequest(BonusSheetValidations.bonusSheetBulkActionValidationSchema),
  BonusSheetControllers.bulkUnlockBonusSheets,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_READ),
  BonusSheetControllers.getDeletedBonusSheets,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_PROCESS),
  validateRequest(createRestoreValidationSchema("id")),
  BonusSheetControllers.restoreBonusSheet,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_PROCESS),
  validateRequest(createSoftDeleteValidationSchema("id")),
  BonusSheetControllers.deleteBonusSheet,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_READ),
  BonusSheetControllers.getSingleBonusSheet,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_PROCESS),
  validateRequest(BonusSheetValidations.bonusSheetActionValidationSchema),
  BonusSheetControllers.processBonusSheet,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_APPROVE),
  validateRequest(BonusSheetValidations.bonusSheetActionValidationSchema),
  BonusSheetControllers.approveBonusSheet,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_LOCK),
  validateRequest(BonusSheetValidations.bonusSheetActionValidationSchema),
  BonusSheetControllers.lockBonusSheet,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_SHEET_UNLOCK),
  validateRequest(BonusSheetValidations.bonusSheetActionValidationSchema),
  BonusSheetControllers.unlockBonusSheet,
);

export const BonusSheetRoutes = router;
export default router;

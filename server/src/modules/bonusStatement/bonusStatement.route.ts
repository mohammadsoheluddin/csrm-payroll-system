import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { BonusStatementControllers } from "./bonusStatement.controller";
import { BonusStatementValidations } from "./bonusStatement.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_PROCESS),
  validateRequest(BonusStatementValidations.generateBonusStatementValidationSchema),
  BonusStatementControllers.generateMonthlyBonusStatement,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_READ),
  validateRequest(BonusStatementValidations.bonusStatementSummaryQueryValidationSchema),
  BonusStatementControllers.getBonusStatementOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_READ),
  BonusStatementControllers.getAllBonusStatements,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_PROCESS),
  validateRequest(BonusStatementValidations.bonusStatementBulkActionValidationSchema),
  BonusStatementControllers.bulkProcessBonusStatements,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_APPROVE),
  validateRequest(BonusStatementValidations.bonusStatementBulkActionValidationSchema),
  BonusStatementControllers.bulkApproveBonusStatements,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_LOCK),
  validateRequest(BonusStatementValidations.bonusStatementBulkActionValidationSchema),
  BonusStatementControllers.bulkLockBonusStatements,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_UNLOCK),
  validateRequest(BonusStatementValidations.bonusStatementBulkActionValidationSchema),
  BonusStatementControllers.bulkUnlockBonusStatements,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_READ),
  BonusStatementControllers.getSingleBonusStatement,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_PROCESS),
  validateRequest(BonusStatementValidations.bonusStatementActionValidationSchema),
  BonusStatementControllers.processBonusStatement,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_APPROVE),
  validateRequest(BonusStatementValidations.bonusStatementActionValidationSchema),
  BonusStatementControllers.approveBonusStatement,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_LOCK),
  validateRequest(BonusStatementValidations.bonusStatementActionValidationSchema),
  BonusStatementControllers.lockBonusStatement,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_STATEMENT_UNLOCK),
  validateRequest(BonusStatementValidations.bonusStatementActionValidationSchema),
  BonusStatementControllers.unlockBonusStatement,
);

export const BonusStatementRoutes = router;
export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { OtStatementControllers } from "./otStatement.controller";
import { OtStatementValidations } from "./otStatement.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_PROCESS),
  validateRequest(OtStatementValidations.generateOtStatementValidationSchema),
  OtStatementControllers.generateMonthlyOtStatement,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_READ),
  OtStatementControllers.getOtStatementOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_READ),
  OtStatementControllers.getAllOtStatements,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_PROCESS),
  validateRequest(OtStatementValidations.otStatementBulkActionValidationSchema),
  OtStatementControllers.bulkProcessOtStatements,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_APPROVE),
  validateRequest(OtStatementValidations.otStatementBulkActionValidationSchema),
  OtStatementControllers.bulkApproveOtStatements,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_LOCK),
  validateRequest(OtStatementValidations.otStatementBulkActionValidationSchema),
  OtStatementControllers.bulkLockOtStatements,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_UNLOCK),
  validateRequest(OtStatementValidations.otStatementBulkActionValidationSchema),
  OtStatementControllers.bulkUnlockOtStatements,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_READ),
  OtStatementControllers.getSingleOtStatement,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_PROCESS),
  validateRequest(OtStatementValidations.otStatementActionValidationSchema),
  OtStatementControllers.processOtStatement,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_APPROVE),
  validateRequest(OtStatementValidations.otStatementActionValidationSchema),
  OtStatementControllers.approveOtStatement,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_LOCK),
  validateRequest(OtStatementValidations.otStatementActionValidationSchema),
  OtStatementControllers.lockOtStatement,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.OT_STATEMENT_UNLOCK),
  validateRequest(OtStatementValidations.otStatementActionValidationSchema),
  OtStatementControllers.unlockOtStatement,
);

export const OtStatementRoutes = router;
export default router;

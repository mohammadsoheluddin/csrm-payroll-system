import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { SalaryStatementControllers } from "./salaryStatement.controller";
import { SalaryStatementValidations } from "./salaryStatement.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_PROCESS),
  validateRequest(
    SalaryStatementValidations.generateSalaryStatementValidationSchema,
  ),
  SalaryStatementControllers.generateMonthlySalaryStatement,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_READ),
  validateRequest(
    SalaryStatementValidations.salaryStatementSummaryQueryValidationSchema,
  ),
  SalaryStatementControllers.getSalaryStatementOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_READ),
  SalaryStatementControllers.getAllSalaryStatements,
);


router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_PROCESS),
  validateRequest(
    SalaryStatementValidations.salaryStatementBulkActionValidationSchema,
  ),
  SalaryStatementControllers.bulkProcessSalaryStatements,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_APPROVE),
  validateRequest(
    SalaryStatementValidations.salaryStatementBulkActionValidationSchema,
  ),
  SalaryStatementControllers.bulkApproveSalaryStatements,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_LOCK),
  validateRequest(
    SalaryStatementValidations.salaryStatementBulkActionValidationSchema,
  ),
  SalaryStatementControllers.bulkLockSalaryStatements,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_UNLOCK),
  validateRequest(
    SalaryStatementValidations.salaryStatementBulkActionValidationSchema,
  ),
  SalaryStatementControllers.bulkUnlockSalaryStatements,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_READ),
  SalaryStatementControllers.getDeletedSalaryStatements,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_PROCESS),
  validateRequest(createRestoreValidationSchema("id")),
  SalaryStatementControllers.restoreSalaryStatement,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_PROCESS),
  validateRequest(createSoftDeleteValidationSchema("id")),
  SalaryStatementControllers.deleteSalaryStatement,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_READ),
  SalaryStatementControllers.getSingleSalaryStatement,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_PROCESS),
  validateRequest(SalaryStatementValidations.salaryStatementActionValidationSchema),
  SalaryStatementControllers.processSalaryStatement,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_APPROVE),
  validateRequest(SalaryStatementValidations.salaryStatementActionValidationSchema),
  SalaryStatementControllers.approveSalaryStatement,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_LOCK),
  validateRequest(SalaryStatementValidations.salaryStatementActionValidationSchema),
  SalaryStatementControllers.lockSalaryStatement,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STATEMENT_UNLOCK),
  validateRequest(SalaryStatementValidations.salaryStatementActionValidationSchema),
  SalaryStatementControllers.unlockSalaryStatement,
);

export const SalaryStatementRoutes = router;
export default router;

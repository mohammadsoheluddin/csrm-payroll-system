import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { SalaryPaymentDistributionControllers } from "./salaryPaymentDistribution.controller";
import { SalaryPaymentDistributionValidations } from "./salaryPaymentDistribution.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    SalaryPaymentDistributionValidations.generateSalaryPaymentDistributionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.generateMonthlySalaryPaymentDistribution,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionSummaryQueryValidationSchema,
  ),
  SalaryPaymentDistributionControllers.getSalaryPaymentDistributionOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ),
  SalaryPaymentDistributionControllers.getAllSalaryPaymentDistributions,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionBulkActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.bulkProcessSalaryPaymentDistributions,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionBulkActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.bulkApproveSalaryPaymentDistributions,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionBulkActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.bulkLockSalaryPaymentDistributions,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionBulkActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.bulkUnlockSalaryPaymentDistributions,
);


router.get(
  "/export/preview",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionExportQueryValidationSchema,
  ),
  SalaryPaymentDistributionControllers.getSalaryPaymentDistributionExportPreview,
);

router.get(
  "/export/csv",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionExportQueryValidationSchema,
  ),
  SalaryPaymentDistributionControllers.exportSalaryPaymentDistributionCsv,
);

router.get(
  "/export/excel",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionExportQueryValidationSchema,
  ),
  SalaryPaymentDistributionControllers.exportSalaryPaymentDistributionExcel,
);

router.get(
  "/export/pdf",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionExportQueryValidationSchema,
  ),
  SalaryPaymentDistributionControllers.exportSalaryPaymentDistributionPdf,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ),
  SalaryPaymentDistributionControllers.getDeletedSalaryPaymentDistributions,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(createRestoreValidationSchema("id")),
  SalaryPaymentDistributionControllers.restoreSalaryPaymentDistribution,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(createSoftDeleteValidationSchema("id")),
  SalaryPaymentDistributionControllers.deleteSalaryPaymentDistribution,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ),
  SalaryPaymentDistributionControllers.getSingleSalaryPaymentDistribution,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.processSalaryPaymentDistribution,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.approveSalaryPaymentDistribution,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.lockSalaryPaymentDistribution,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    SalaryPaymentDistributionValidations.salaryPaymentDistributionActionValidationSchema,
  ),
  SalaryPaymentDistributionControllers.unlockSalaryPaymentDistribution,
);

export const SalaryPaymentDistributionRoutes = router;
export default router;

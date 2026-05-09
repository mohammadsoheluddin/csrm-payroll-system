import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { OtPaymentDistributionControllers } from "./otPaymentDistribution.controller";
import { OtPaymentDistributionValidations } from "./otPaymentDistribution.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    OtPaymentDistributionValidations.generateOtPaymentDistributionValidationSchema,
  ),
  OtPaymentDistributionControllers.generateMonthlyOtPaymentDistribution,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_READ),
  OtPaymentDistributionControllers.getOtPaymentDistributionOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_READ),
  OtPaymentDistributionControllers.getAllOtPaymentDistributions,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionBulkActionValidationSchema,
  ),
  OtPaymentDistributionControllers.bulkProcessOtPaymentDistributions,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionBulkActionValidationSchema,
  ),
  OtPaymentDistributionControllers.bulkApproveOtPaymentDistributions,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionBulkActionValidationSchema,
  ),
  OtPaymentDistributionControllers.bulkLockOtPaymentDistributions,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionBulkActionValidationSchema,
  ),
  OtPaymentDistributionControllers.bulkUnlockOtPaymentDistributions,
);

router.get(
  "/export/preview",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_READ),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionExportQueryValidationSchema,
  ),
  OtPaymentDistributionControllers.getOtPaymentDistributionExportPreview,
);

router.get(
  "/export/csv",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionExportQueryValidationSchema,
  ),
  OtPaymentDistributionControllers.exportOtPaymentDistributionCsv,
);

router.get(
  "/export/excel",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionExportQueryValidationSchema,
  ),
  OtPaymentDistributionControllers.exportOtPaymentDistributionExcel,
);

router.get(
  "/export/pdf",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_EXPORT),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionExportQueryValidationSchema,
  ),
  OtPaymentDistributionControllers.exportOtPaymentDistributionPdf,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_READ),
  OtPaymentDistributionControllers.getSingleOtPaymentDistribution,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionActionValidationSchema,
  ),
  OtPaymentDistributionControllers.processOtPaymentDistribution,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionActionValidationSchema,
  ),
  OtPaymentDistributionControllers.approveOtPaymentDistribution,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionActionValidationSchema,
  ),
  OtPaymentDistributionControllers.lockOtPaymentDistribution,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.OT_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    OtPaymentDistributionValidations.otPaymentDistributionActionValidationSchema,
  ),
  OtPaymentDistributionControllers.unlockOtPaymentDistribution,
);

export const OtPaymentDistributionRoutes = router;
export default router;

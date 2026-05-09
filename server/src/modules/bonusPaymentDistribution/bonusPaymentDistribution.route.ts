import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { BonusPaymentDistributionControllers } from "./bonusPaymentDistribution.controller";
import { BonusPaymentDistributionValidations } from "./bonusPaymentDistribution.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    BonusPaymentDistributionValidations.generateBonusPaymentDistributionValidationSchema,
  ),
  BonusPaymentDistributionControllers.generateMonthlyBonusPaymentDistribution,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_READ),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionSummaryQueryValidationSchema,
  ),
  BonusPaymentDistributionControllers.getBonusPaymentDistributionOperationalSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_READ),
  BonusPaymentDistributionControllers.getAllBonusPaymentDistributions,
);

router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionBulkActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.bulkProcessBonusPaymentDistributions,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionBulkActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.bulkApproveBonusPaymentDistributions,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionBulkActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.bulkLockBonusPaymentDistributions,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionBulkActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.bulkUnlockBonusPaymentDistributions,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_READ),
  BonusPaymentDistributionControllers.getSingleBonusPaymentDistribution,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_PROCESS),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.processBonusPaymentDistribution,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_APPROVE),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.approveBonusPaymentDistribution,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_LOCK),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.lockBonusPaymentDistribution,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_UNLOCK),
  validateRequest(
    BonusPaymentDistributionValidations.bonusPaymentDistributionActionValidationSchema,
  ),
  BonusPaymentDistributionControllers.unlockBonusPaymentDistribution,
);

export const BonusPaymentDistributionRoutes = router;
export default router;

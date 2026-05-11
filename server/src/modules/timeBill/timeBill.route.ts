import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { TimeBillControllers } from "./timeBill.controller";
import { TimeBillValidations } from "./timeBill.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_PROCESS),
  validateRequest(TimeBillValidations.generateTimeBillValidationSchema),
  TimeBillControllers.generateMonthlyTimeBill,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_READ),
  TimeBillControllers.getTimeBillOperationalSummary,
);

router.get(
  "/export/preview",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_READ),
  validateRequest(TimeBillValidations.timeBillExportQueryValidationSchema),
  TimeBillControllers.getTimeBillExportPreview,
);

router.get(
  "/export/csv",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_EXPORT),
  validateRequest(TimeBillValidations.timeBillExportQueryValidationSchema),
  TimeBillControllers.exportTimeBillCsv,
);

router.get(
  "/export/excel",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_EXPORT),
  validateRequest(TimeBillValidations.timeBillExportQueryValidationSchema),
  TimeBillControllers.exportTimeBillExcel,
);

router.get(
  "/export/pdf",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_EXPORT),
  validateRequest(TimeBillValidations.timeBillExportQueryValidationSchema),
  TimeBillControllers.exportTimeBillPdf,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_READ),
  TimeBillControllers.getAllTimeBills,
);


router.patch(
  "/bulk/process",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_PROCESS),
  validateRequest(TimeBillValidations.timeBillBulkActionValidationSchema),
  TimeBillControllers.bulkProcessTimeBills,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_APPROVE),
  validateRequest(TimeBillValidations.timeBillBulkActionValidationSchema),
  TimeBillControllers.bulkApproveTimeBills,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_LOCK),
  validateRequest(TimeBillValidations.timeBillBulkActionValidationSchema),
  TimeBillControllers.bulkLockTimeBills,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_UNLOCK),
  validateRequest(TimeBillValidations.timeBillBulkActionValidationSchema),
  TimeBillControllers.bulkUnlockTimeBills,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_READ),
  TimeBillControllers.getDeletedTimeBills,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_PROCESS),
  validateRequest(createRestoreValidationSchema("id")),
  TimeBillControllers.restoreTimeBill,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_PROCESS),
  validateRequest(createSoftDeleteValidationSchema("id")),
  TimeBillControllers.deleteTimeBill,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_READ),
  TimeBillControllers.getSingleTimeBill,
);

router.patch(
  "/:id/process",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_PROCESS),
  validateRequest(TimeBillValidations.timeBillActionValidationSchema),
  TimeBillControllers.processTimeBill,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_APPROVE),
  validateRequest(TimeBillValidations.timeBillActionValidationSchema),
  TimeBillControllers.approveTimeBill,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_LOCK),
  validateRequest(TimeBillValidations.timeBillActionValidationSchema),
  TimeBillControllers.lockTimeBill,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.TIME_BILL_UNLOCK),
  validateRequest(TimeBillValidations.timeBillActionValidationSchema),
  TimeBillControllers.unlockTimeBill,
);

export const TimeBillRoutes = router;
export default router;

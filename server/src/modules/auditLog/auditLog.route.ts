import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { AuditLogControllers } from "./auditLog.controller";
import { AuditLogValidations } from "./auditLog.validation";

const router = Router();

/**
 * Audit Log Viewer routes.
 * Only users with AUDIT_LOG_READ permission can access sensitive audit trails.
 */

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogSummaryQueryValidationSchema),
  AuditLogControllers.getAuditLogSummary,
);

router.get(
  "/timeline",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogTimelineQueryValidationSchema),
  AuditLogControllers.getAuditLogTimeline,
);

router.get(
  "/filter-options",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogFilterOptionsQueryValidationSchema),
  AuditLogControllers.getAuditLogFilterOptions,
);


router.get(
  "/sensitive",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogSensitiveQueryValidationSchema),
  AuditLogControllers.getSensitiveAuditLogs,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogQueryValidationSchema),
  AuditLogControllers.getAllAuditLogs,
);

router.get(
  "/entity/:entityId",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogEntityParamValidationSchema),
  AuditLogControllers.getAuditLogsByEntity,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  validateRequest(AuditLogValidations.auditLogIdParamValidationSchema),
  AuditLogControllers.getSingleAuditLog,
);

export const auditLogRoutes = router;
export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { AuditLogControllers } from "./auditLog.controller";

const router = Router();

/**
 * Global Audit Log Routes
 *
 * Only users with AUDIT_LOG_READ permission can access global audit logs.
 * By default, this should be limited to super_admin and admin.
 */

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  AuditLogControllers.getAllAuditLogs,
);

router.get(
  "/entity/:entityId",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  AuditLogControllers.getAuditLogsByEntity,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.AUDIT_LOG_READ),
  AuditLogControllers.getSingleAuditLog,
);

export const auditLogRoutes = router;
export default router;

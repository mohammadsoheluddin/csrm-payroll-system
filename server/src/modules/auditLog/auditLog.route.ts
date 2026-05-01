import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { AuditLogControllers } from "./auditLog.controller";

const router = Router();

/**
 * Added:
 * Global Audit Log read routes.
 * Only users with AUDIT_LOG_READ permission can access these routes.
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

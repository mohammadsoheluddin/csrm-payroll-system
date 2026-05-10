import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { RbacAuditControllers } from "./rbacAudit.controller";
import { RbacAuditValidations } from "./rbacAudit.validation";

const router = Router();

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  RbacAuditControllers.getRbacAuditSummary,
);

router.get(
  "/modules",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacModuleCatalog,
);

router.get(
  "/permissions",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacPermissions,
);

router.get(
  "/roles",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacRoles,
);

router.get(
  "/matrix",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacMatrix,
);

router.get(
  "/coverage",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacCoverage,
);

router.get(
  "/route-coverage",
  auth(),
  requirePermission(PERMISSIONS.RBAC_AUDIT_READ),
  validateRequest(RbacAuditValidations.commonQueryValidationSchema),
  RbacAuditControllers.getRbacRouteCoverage,
);

export const RbacAuditRoutes = router;
export default router;

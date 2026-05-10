import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { ReportCenterControllers } from "./reportCenter.controller";
import { ReportCenterValidations } from "./reportCenter.validation";

const router = Router();

router.get(
  "/catalog",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.catalogQueryValidationSchema),
  ReportCenterControllers.getReportCatalog,
);

router.get(
  "/dashboard",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.reportCenterQueryValidationSchema),
  ReportCenterControllers.getReportCenterDashboard,
);

router.get(
  "/readiness",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.reportCenterQueryValidationSchema),
  ReportCenterControllers.getReportReadiness,
);

router.get(
  "/quick-links",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.reportCenterQueryValidationSchema),
  ReportCenterControllers.getReportQuickLinks,
);

export const ReportCenterRoutes = router;
export default router;

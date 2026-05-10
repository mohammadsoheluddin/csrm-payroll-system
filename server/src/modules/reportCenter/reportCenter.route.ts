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

router.get(
  "/export-route",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.exportRouteQueryValidationSchema),
  ReportCenterControllers.getReportExportRoute,
);

router.post(
  "/saved-configs",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_CONFIG_MANAGE),
  validateRequest(ReportCenterValidations.createSavedConfigValidationSchema),
  ReportCenterControllers.createSavedReportConfig,
);

router.get(
  "/saved-configs",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.savedConfigListQueryValidationSchema),
  ReportCenterControllers.getSavedReportConfigs,
);

router.get(
  "/saved-configs/:id/export-route",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.savedConfigExportRouteValidationSchema),
  ReportCenterControllers.getSavedReportConfigExportRoute,
);

router.get(
  "/saved-configs/:id",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_READ),
  validateRequest(ReportCenterValidations.savedConfigIdParamValidationSchema),
  ReportCenterControllers.getSingleSavedReportConfig,
);

router.patch(
  "/saved-configs/:id",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_CONFIG_MANAGE),
  validateRequest(ReportCenterValidations.updateSavedConfigValidationSchema),
  ReportCenterControllers.updateSavedReportConfig,
);

router.delete(
  "/saved-configs/:id",
  auth(),
  requirePermission(PERMISSIONS.REPORT_CENTER_CONFIG_MANAGE),
  validateRequest(ReportCenterValidations.savedConfigIdParamValidationSchema),
  ReportCenterControllers.deleteSavedReportConfig,
);

export const ReportCenterRoutes = router;
export default router;

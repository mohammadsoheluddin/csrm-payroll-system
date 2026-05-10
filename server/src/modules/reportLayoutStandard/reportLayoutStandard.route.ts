import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { ReportLayoutStandardControllers } from "./reportLayoutStandard.controller";
import { ReportLayoutStandardValidations } from "./reportLayoutStandard.validation";

const router = Router();

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.REPORT_LAYOUT_STANDARD_READ),
  validateRequest(ReportLayoutStandardValidations.listQueryValidationSchema),
  ReportLayoutStandardControllers.getReportLayoutStandards,
);

router.get(
  "/export-formats",
  auth(),
  requirePermission(PERMISSIONS.REPORT_LAYOUT_STANDARD_READ),
  ReportLayoutStandardControllers.getReportExportFormatStandards,
);

router.get(
  "/:reportKey",
  auth(),
  requirePermission(PERMISSIONS.REPORT_LAYOUT_STANDARD_READ),
  validateRequest(ReportLayoutStandardValidations.singleParamValidationSchema),
  ReportLayoutStandardControllers.getSingleReportLayoutStandard,
);

export const ReportLayoutStandardRoutes = router;
export default router;

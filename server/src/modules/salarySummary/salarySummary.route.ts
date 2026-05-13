import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { SalarySummaryControllers } from "./salarySummary.controller";
import { SalarySummaryValidations } from "./salarySummary.validation";

const router = Router();

router.get(
  "/preview",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SUMMARY_READ),
  validateRequest(SalarySummaryValidations.salarySummaryQueryValidationSchema),
  SalarySummaryControllers.getSalarySummaryPreview,
);

router.get(
  "/export/csv",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SUMMARY_EXPORT),
  validateRequest(SalarySummaryValidations.salarySummaryQueryValidationSchema),
  SalarySummaryControllers.exportSalarySummaryCsv,
);

router.get(
  "/export/excel",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SUMMARY_EXPORT),
  validateRequest(SalarySummaryValidations.salarySummaryQueryValidationSchema),
  SalarySummaryControllers.exportSalarySummaryExcel,
);

router.get(
  "/export/pdf",
  auth(),
  requirePermission(PERMISSIONS.SALARY_SUMMARY_EXPORT),
  validateRequest(SalarySummaryValidations.salarySummaryQueryValidationSchema),
  SalarySummaryControllers.exportSalarySummaryPdf,
);

export const SalarySummaryRoutes = router;
export default router;

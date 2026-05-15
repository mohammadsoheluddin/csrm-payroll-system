import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { LegacySalaryImportControllers } from "./legacySalaryImport.controller";
import { LegacySalaryImportValidations } from "./legacySalaryImport.validation";

const router = Router();

router.get(
  "/template/csv",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_EXPORT),
  LegacySalaryImportControllers.exportLegacySalaryImportTemplateCsv,
);

router.get(
  "/template/excel",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_EXPORT),
  LegacySalaryImportControllers.exportLegacySalaryImportTemplateExcel,
);

router.post(
  "/parse-excel",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_PROCESS),
  validateRequest(LegacySalaryImportValidations.parseExcelValidationSchema),
  LegacySalaryImportControllers.parseExcel,
);

router.post(
  "/preview",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_PROCESS),
  validateRequest(LegacySalaryImportValidations.previewLegacySalaryImportValidationSchema),
  LegacySalaryImportControllers.previewLegacySalaryImport,
);

router.post(
  "/commit",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_PROCESS),
  validateRequest(LegacySalaryImportValidations.commitLegacySalaryImportValidationSchema),
  LegacySalaryImportControllers.commitLegacySalaryImport,
);

router.get(
  "/records/export/csv",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_EXPORT),
  validateRequest(LegacySalaryImportValidations.getLegacySalaryRecordsValidationSchema),
  LegacySalaryImportControllers.exportLegacySalaryRecordsCsv,
);

router.get(
  "/records/export/excel",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_EXPORT),
  validateRequest(LegacySalaryImportValidations.getLegacySalaryRecordsValidationSchema),
  LegacySalaryImportControllers.exportLegacySalaryRecordsExcel,
);

router.get(
  "/records",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_READ),
  validateRequest(LegacySalaryImportValidations.getLegacySalaryRecordsValidationSchema),
  LegacySalaryImportControllers.getLegacySalaryRecords,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_READ),
  validateRequest(LegacySalaryImportValidations.getLegacySalarySummaryValidationSchema),
  LegacySalaryImportControllers.getLegacySalarySummary,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_READ),
  validateRequest(LegacySalaryImportValidations.getAllLegacySalaryImportBatchesValidationSchema),
  LegacySalaryImportControllers.getDeletedLegacySalaryImportBatches,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_READ),
  validateRequest(LegacySalaryImportValidations.getAllLegacySalaryImportBatchesValidationSchema),
  LegacySalaryImportControllers.getAllLegacySalaryImportBatches,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_PROCESS),
  validateRequest(LegacySalaryImportValidations.restoreLegacySalaryImportValidationSchema),
  LegacySalaryImportControllers.restoreLegacySalaryImportBatch,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_DELETE),
  validateRequest(LegacySalaryImportValidations.deleteLegacySalaryImportValidationSchema),
  LegacySalaryImportControllers.deleteLegacySalaryImportBatch,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEGACY_SALARY_IMPORT_READ),
  validateRequest(LegacySalaryImportValidations.legacySalaryImportIdParamValidationSchema),
  LegacySalaryImportControllers.getSingleLegacySalaryImportBatch,
);

export const LegacySalaryImportRoutes = router;
export default router;

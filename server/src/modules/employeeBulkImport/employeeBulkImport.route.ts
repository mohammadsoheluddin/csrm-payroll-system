import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeBulkImportControllers } from "./employeeBulkImport.controller";
import { EmployeeBulkImportValidations } from "./employeeBulkImport.validation";

const router = Router();


router.get(
  "/template/preview",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportTemplateQueryValidationSchema),
  EmployeeBulkImportControllers.getEmployeeBulkImportTemplatePreview,
);

router.get(
  "/template/csv",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_EXPORT),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportTemplateQueryValidationSchema),
  EmployeeBulkImportControllers.exportEmployeeBulkImportTemplateCsv,
);

router.get(
  "/template/excel",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_EXPORT),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportTemplateQueryValidationSchema),
  EmployeeBulkImportControllers.exportEmployeeBulkImportTemplateExcel,
);

router.get(
  "/:id/rejections/preview",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportIdParamValidationSchema),
  EmployeeBulkImportControllers.getEmployeeBulkImportRejectionReportPreview,
);

router.get(
  "/:id/rejections/csv",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_EXPORT),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportIdParamValidationSchema),
  EmployeeBulkImportControllers.exportEmployeeBulkImportRejectionsCsv,
);

router.get(
  "/:id/rejections/excel",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_EXPORT),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportIdParamValidationSchema),
  EmployeeBulkImportControllers.exportEmployeeBulkImportRejectionsExcel,
);

router.post(
  "/preview",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_PROCESS),
  validateRequest(EmployeeBulkImportValidations.previewEmployeeBulkImportValidationSchema),
  EmployeeBulkImportControllers.previewEmployeeBulkImport,
);

router.post(
  "/commit",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_PROCESS),
  validateRequest(EmployeeBulkImportValidations.commitEmployeeBulkImportValidationSchema),
  EmployeeBulkImportControllers.commitEmployeeBulkImport,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ),
  validateRequest(EmployeeBulkImportValidations.getAllEmployeeBulkImportsValidationSchema),
  EmployeeBulkImportControllers.getAllEmployeeBulkImports,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ),
  validateRequest(EmployeeBulkImportValidations.employeeBulkImportIdParamValidationSchema),
  EmployeeBulkImportControllers.getSingleEmployeeBulkImport,
);

export const EmployeeBulkImportRoutes = router;
export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeBulkImportControllers } from "./employeeBulkImport.controller";
import { EmployeeBulkImportValidations } from "./employeeBulkImport.validation";

const router = Router();

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

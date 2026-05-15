import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeDocumentControllers } from "./employeeDocument.controller";
import { EmployeeDocumentValidations } from "./employeeDocument.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_MANAGE),
  validateRequest(
    EmployeeDocumentValidations.createEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.createEmployeeDocument,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.getAllEmployeeDocumentsValidationSchema,
  ),
  EmployeeDocumentControllers.getDeletedEmployeeDocuments,
);

router.get(
  "/expiring",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.expiringEmployeeDocumentsValidationSchema,
  ),
  EmployeeDocumentControllers.getExpiringEmployeeDocuments,
);

router.get(
  "/employee/:employeeId/summary",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.employeeDocumentEmployeeParamValidationSchema,
  ),
  EmployeeDocumentControllers.getEmployeeDocumentSummary,
);

router.get(
  "/employee/:employeeId",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.employeeDocumentEmployeeParamValidationSchema,
  ),
  EmployeeDocumentControllers.getEmployeeDocumentsByEmployee,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.employeeDocumentIdParamValidationSchema,
  ),
  EmployeeDocumentControllers.getSingleEmployeeDocument,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_READ),
  validateRequest(
    EmployeeDocumentValidations.getAllEmployeeDocumentsValidationSchema,
  ),
  EmployeeDocumentControllers.getAllEmployeeDocuments,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_MANAGE),
  validateRequest(
    EmployeeDocumentValidations.updateEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.updateEmployeeDocument,
);

router.patch(
  "/:id/verify",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_VERIFY),
  validateRequest(
    EmployeeDocumentValidations.verifyEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.verifyEmployeeDocument,
);

router.patch(
  "/:id/reject",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_VERIFY),
  validateRequest(
    EmployeeDocumentValidations.rejectEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.rejectEmployeeDocument,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_DELETE),
  validateRequest(
    EmployeeDocumentValidations.deleteEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.deleteEmployeeDocument,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_DELETE),
  validateRequest(
    EmployeeDocumentValidations.restoreEmployeeDocumentValidationSchema,
  ),
  EmployeeDocumentControllers.restoreEmployeeDocument,
);

export const EmployeeDocumentRoutes = router;
export default router;

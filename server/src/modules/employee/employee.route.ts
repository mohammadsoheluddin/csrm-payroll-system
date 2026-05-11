import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeControllers } from "./employee.controller";
import { EmployeeValidations } from "./employee.validation";

const router = express.Router();

router.post(
  "/create-employee",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  validateRequest(EmployeeValidations.createEmployeeValidationSchema),
  EmployeeControllers.createEmployee,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeValidations.getAllEmployeesValidationSchema),
  EmployeeControllers.getAllEmployees,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeValidations.getAllEmployeesValidationSchema),
  EmployeeControllers.getDeletedEmployees,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeValidations.employeeIdParamValidationSchema),
  EmployeeControllers.getSingleEmployee,
);

router.patch(
  "/:id/lifecycle",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  validateRequest(EmployeeValidations.changeEmployeeLifecycleValidationSchema),
  EmployeeControllers.changeEmployeeLifecycle,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  validateRequest(EmployeeValidations.restoreEmployeeValidationSchema),
  EmployeeControllers.restoreEmployee,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  validateRequest(EmployeeValidations.updateEmployeeValidationSchema),
  EmployeeControllers.updateEmployee,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  validateRequest(EmployeeValidations.deleteEmployeeValidationSchema),
  EmployeeControllers.deleteEmployee,
);

export const EmployeeRoutes = router;
export default router;

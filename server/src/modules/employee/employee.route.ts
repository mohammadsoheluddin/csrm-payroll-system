import express from "express";
import { EmployeeControllers } from "./employee.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeValidations } from "./employee.validation";

const router = express.Router();

/**
 * Changed:
 * Added validation middleware for employee create, list query, id params, update and delete routes.
 */

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
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeValidations.employeeIdParamValidationSchema),
  EmployeeControllers.getSingleEmployee,
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
  validateRequest(EmployeeValidations.employeeIdParamValidationSchema),
  EmployeeControllers.deleteEmployee,
);

export const EmployeeRoutes = router;
export default router;

import express from "express";
import { EmployeeControllers } from "./employee.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";

const router = express.Router();

router.post(
  "/create-employee",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  EmployeeControllers.createEmployee,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  EmployeeControllers.getAllEmployees,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  EmployeeControllers.getSingleEmployee,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  EmployeeControllers.updateEmployee,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  EmployeeControllers.deleteEmployee,
);

export const EmployeeRoutes = router;
export default router;

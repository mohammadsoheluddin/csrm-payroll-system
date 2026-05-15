import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeProfileControllers } from "./employeeProfile.controller";
import { EmployeeProfileValidations } from "./employeeProfile.validation";

const router = express.Router();

router.get(
  "/:employeeRef/summary",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeProfileValidations.getEmployeeProfileValidationSchema),
  EmployeeProfileControllers.getEmployeeProfileSummary,
);

router.get(
  "/:employeeRef",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validateRequest(EmployeeProfileValidations.getEmployeeProfileValidationSchema),
  EmployeeProfileControllers.getEmployeeProfile,
);

export const EmployeeProfileRoutes = router;
export default router;

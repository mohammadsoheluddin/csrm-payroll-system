import express from "express";

import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeMovementController } from "./employeeMovement.controller";
import { EmployeeMovementValidation } from "./employeeMovement.validation";

const router = express.Router();

router.post(
  "/create",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_MANAGE),
  validateRequest(
    EmployeeMovementValidation.createEmployeeMovementValidationSchema,
  ),
  EmployeeMovementController.createEmployeeMovement,
);

router.patch(
  "/approve/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_APPROVE),
  validateRequest(EmployeeMovementValidation.employeeMovementIdParamValidationSchema),
  EmployeeMovementController.approveEmployeeMovement,
);

router.patch(
  "/apply/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_APPLY),
  validateRequest(EmployeeMovementValidation.employeeMovementIdParamValidationSchema),
  EmployeeMovementController.applyEmployeeMovement,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_READ),
  EmployeeMovementController.getDeletedEmployeeMovements,
);

router.get(
  "/:id/payroll-impact/preview",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_PAYROLL_IMPACT_READ),
  validateRequest(EmployeeMovementValidation.employeeMovementIdParamValidationSchema),
  EmployeeMovementController.getEmployeeMovementPayrollImpactPreview,
);

router.get(
  "/timeline/:employeeId",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_READ),
  validateRequest(
    EmployeeMovementValidation.employeeMovementTimelineParamValidationSchema,
  ),
  EmployeeMovementController.getEmployeeMovementTimeline,
);

router.get(
  "/:id/pdf",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_READ),
  validateRequest(EmployeeMovementValidation.employeeMovementIdParamValidationSchema),
  EmployeeMovementController.downloadEmployeeMovementPDF,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_READ),
  EmployeeMovementController.getAllEmployeeMovements,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_READ),
  validateRequest(EmployeeMovementValidation.employeeMovementIdParamValidationSchema),
  EmployeeMovementController.getSingleEmployeeMovement,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_MANAGE),
  validateRequest(EmployeeMovementValidation.restoreEmployeeMovementValidationSchema),
  EmployeeMovementController.restoreEmployeeMovement,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MOVEMENT_MANAGE),
  validateRequest(EmployeeMovementValidation.deleteEmployeeMovementValidationSchema),
  EmployeeMovementController.deleteEmployeeMovement,
);

export const employeeMovementRoutes = router;
export default router;

import express from "express";

import auth from "../../middleware/auth";

import validateRequest from "../../middleware/validateRequest";

import { USER_ROLE } from "../user/user.constant";

import { EmployeeMovementController } from "./employeeMovement.controller";

import { EmployeeMovementValidation } from "./employeeMovement.validation";

const router = express.Router();

router.post(
  "/create",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr),
  validateRequest(
    EmployeeMovementValidation.createEmployeeMovementValidationSchema,
  ),
  EmployeeMovementController.createEmployeeMovement,
);

router.patch(
  "/approve/:id",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.manager),
  EmployeeMovementController.approveEmployeeMovement,
);

router.patch(
  "/apply/:id",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr),
  EmployeeMovementController.applyEmployeeMovement,
);

router.get(
  "/:id/payroll-impact/preview",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
    USER_ROLE.manager,
  ),
  EmployeeMovementController.getEmployeeMovementPayrollImpactPreview,
);

router.get(
  "/timeline/:employeeId",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.manager,
    USER_ROLE.accounts,
  ),
  EmployeeMovementController.getEmployeeMovementTimeline,
);

router.get(
  "/:id/pdf",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr, USER_ROLE.manager),
  EmployeeMovementController.downloadEmployeeMovementPDF,
);

router.get(
  "/",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
    USER_ROLE.manager,
  ),
  EmployeeMovementController.getAllEmployeeMovements,
);

router.get(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
    USER_ROLE.manager,
  ),
  EmployeeMovementController.getSingleEmployeeMovement,
);

export const employeeMovementRoutes = router;

export default router;

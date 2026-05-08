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

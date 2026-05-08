import express from "express";

import auth from "../../middleware/auth";

import validateRequest from "../../middleware/validateRequest";

import { USER_ROLE } from "../user/user.constant";

import { SalaryStructureControllers } from "./salaryStructure.controller";

import { SalaryStructureValidations } from "./salaryStructure.validation";

const router = express.Router();

router.post(
  "/create",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  validateRequest(
    SalaryStructureValidations.createSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.createSalaryStructure,
);

router.get(
  "/history/:employeeId",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
    USER_ROLE.manager,
  ),
  SalaryStructureControllers.getSalaryStructureHistory,
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
  SalaryStructureControllers.getAllSalaryStructure,
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
  SalaryStructureControllers.getSingleSalaryStructure,
);

router.patch(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  validateRequest(
    SalaryStructureValidations.updateSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.updateSalaryStructure,
);

router.delete(
  "/:id",
  auth(USER_ROLE.super_admin, USER_ROLE.admin),
  SalaryStructureControllers.deleteSalaryStructure,
);

export const SalaryStructureRoutes = router;

export default router;

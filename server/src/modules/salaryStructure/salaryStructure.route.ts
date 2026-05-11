import express from "express";

import auth from "../../middleware/auth";

import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";

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
  "/deleted",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
    USER_ROLE.manager,
  ),
  SalaryStructureControllers.getDeletedSalaryStructures,
);

router.patch(
  "/:id/restore",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  validateRequest(createRestoreValidationSchema("id")),
  SalaryStructureControllers.restoreSalaryStructure,
);

router.delete(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  validateRequest(createSoftDeleteValidationSchema("id")),
  SalaryStructureControllers.deleteSalaryStructure,
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

export const SalaryStructureRoutes = router;

export default router;

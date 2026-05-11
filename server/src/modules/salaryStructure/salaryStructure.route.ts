import express from "express";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { SalaryStructureControllers } from "./salaryStructure.controller";
import { SalaryStructureValidations } from "./salaryStructure.validation";

const router = express.Router();

router.post(
  "/create",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  validateRequest(
    SalaryStructureValidations.createSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.createSalaryStructure,
);

router.get(
  "/history/:employeeId",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_READ),
  SalaryStructureControllers.getSalaryStructureHistory,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_READ),
  SalaryStructureControllers.getDeletedSalaryStructures,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_READ),
  SalaryStructureControllers.getAllSalaryStructure,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  validateRequest(createRestoreValidationSchema("id")),
  SalaryStructureControllers.restoreSalaryStructure,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  validateRequest(createSoftDeleteValidationSchema("id")),
  SalaryStructureControllers.deleteSalaryStructure,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_READ),
  SalaryStructureControllers.getSingleSalaryStructure,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  validateRequest(
    SalaryStructureValidations.updateSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.updateSalaryStructure,
);

export const SalaryStructureRoutes = router;

export default router;

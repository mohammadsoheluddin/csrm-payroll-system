import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SalaryStructureControllers } from "./salaryStructure.controller";
import { SalaryStructureValidations } from "./salaryStructure.validation";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  validateRequest(
    SalaryStructureValidations.createSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.createSalaryStructure,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr"),
  SalaryStructureControllers.getAllSalaryStructure,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  SalaryStructureControllers.getSingleSalaryStructure,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  validateRequest(
    SalaryStructureValidations.updateSalaryStructureValidationSchema,
  ),
  SalaryStructureControllers.updateSalaryStructure,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  SalaryStructureControllers.deleteSalaryStructure,
);

export default router;

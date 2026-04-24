import express from "express";
import { SalaryStructureControllers } from "./salaryStructure.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";

const router = express.Router();

router.post(
  "/create-salary-structure",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  SalaryStructureControllers.createSalaryStructure,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_READ),
  SalaryStructureControllers.getAllSalaryStructure,
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
  SalaryStructureControllers.updateSalaryStructure,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.SALARY_STRUCTURE_MANAGE),
  SalaryStructureControllers.deleteSalaryStructure,
);

export const SalaryStructureRoutes = router;
export default router;

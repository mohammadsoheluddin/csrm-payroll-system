import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { DepartmentControllers } from "./department.controller";
import { DepartmentValidations } from "./department.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validateRequest(DepartmentValidations.createDepartmentValidationSchema),
  DepartmentControllers.createDepartment,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_READ),
  validateRequest(DepartmentValidations.getAllDepartmentsValidationSchema),
  DepartmentControllers.getAllDepartments,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_READ),
  validateRequest(DepartmentValidations.departmentIdValidationSchema),
  DepartmentControllers.getSingleDepartment,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validateRequest(DepartmentValidations.updateDepartmentValidationSchema),
  DepartmentControllers.updateDepartment,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validateRequest(DepartmentValidations.departmentIdValidationSchema),
  DepartmentControllers.deleteDepartment,
);

export const DepartmentRoutes = router;
export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { MajorDepartmentControllers } from "./majorDepartment.controller";
import { MajorDepartmentValidations } from "./majorDepartment.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.MAJOR_DEPARTMENT_MANAGE),
  validateRequest(
    MajorDepartmentValidations.createMajorDepartmentValidationSchema,
  ),
  MajorDepartmentControllers.createMajorDepartment,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.MAJOR_DEPARTMENT_READ),
  validateRequest(
    MajorDepartmentValidations.getAllMajorDepartmentsValidationSchema,
  ),
  MajorDepartmentControllers.getAllMajorDepartments,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.MAJOR_DEPARTMENT_READ),
  validateRequest(
    MajorDepartmentValidations.majorDepartmentIdParamValidationSchema,
  ),
  MajorDepartmentControllers.getSingleMajorDepartment,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.MAJOR_DEPARTMENT_MANAGE),
  validateRequest(
    MajorDepartmentValidations.updateMajorDepartmentValidationSchema,
  ),
  MajorDepartmentControllers.updateMajorDepartment,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.MAJOR_DEPARTMENT_MANAGE),
  validateRequest(
    MajorDepartmentValidations.majorDepartmentIdParamValidationSchema,
  ),
  MajorDepartmentControllers.deleteMajorDepartment,
);

export const MajorDepartmentRoutes = router;
export default router;

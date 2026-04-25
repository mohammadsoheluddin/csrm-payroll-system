import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { DepartmentControllers } from "./department.controller";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  DepartmentControllers.createDepartment,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_READ),
  DepartmentControllers.getAllDepartments,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_READ),
  DepartmentControllers.getSingleDepartment,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  DepartmentControllers.updateDepartment,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  DepartmentControllers.deleteDepartment,
);

export const DepartmentRoutes = router;
export default router;

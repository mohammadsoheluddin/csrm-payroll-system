import { Router } from "express";
import auth from "../../middleware/auth";
import { DepartmentControllers } from "./department.controller";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  DepartmentControllers.createDepartment,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr", "employee"),
  DepartmentControllers.getAllDepartments,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr", "employee"),
  DepartmentControllers.getSingleDepartment,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  DepartmentControllers.updateDepartment,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  DepartmentControllers.deleteDepartment,
);

export default router;

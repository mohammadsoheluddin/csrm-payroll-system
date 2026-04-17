import { Router } from "express";
import auth from "../../middleware/auth";
import { EmployeeControllers } from "./employee.controller";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  EmployeeControllers.createEmployee,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr"),
  EmployeeControllers.getAllEmployees,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  EmployeeControllers.getSingleEmployee,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  EmployeeControllers.updateEmployee,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  EmployeeControllers.deleteEmployee,
);

export default router;

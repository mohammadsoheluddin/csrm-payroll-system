import { Router } from "express";
import auth from "../../middleware/auth";
import { BranchControllers } from "./branch.controller";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  BranchControllers.createBranch,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr", "employee"),
  BranchControllers.getAllBranches,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr", "employee"),
  BranchControllers.getSingleBranch,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  BranchControllers.updateBranch,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin"),
  BranchControllers.deleteBranch,
);

export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";
import { BranchControllers } from "./branch.controller";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  BranchControllers.createBranch,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_READ),
  BranchControllers.getAllBranches,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_READ),
  BranchControllers.getSingleBranch,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  BranchControllers.updateBranch,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  BranchControllers.deleteBranch,
);

export const BranchRoutes = router;
export default router;

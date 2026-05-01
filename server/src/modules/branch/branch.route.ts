import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { BranchControllers } from "./branch.controller";
import { BranchValidations } from "./branch.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validateRequest(BranchValidations.createBranchValidationSchema),
  BranchControllers.createBranch,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_READ),
  validateRequest(BranchValidations.getAllBranchesValidationSchema),
  BranchControllers.getAllBranches,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_READ),
  validateRequest(BranchValidations.branchIdValidationSchema),
  BranchControllers.getSingleBranch,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validateRequest(BranchValidations.updateBranchValidationSchema),
  BranchControllers.updateBranch,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validateRequest(BranchValidations.branchIdValidationSchema),
  BranchControllers.deleteBranch,
);

export const BranchRoutes = router;
export default router;

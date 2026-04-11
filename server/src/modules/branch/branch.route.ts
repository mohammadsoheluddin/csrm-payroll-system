import { Router } from "express";
import auth from "../../middleware/auth";
import { BranchControllers } from "./branch.controller";

const router = Router();

router.post("/", auth("admin", "superAdmin"), BranchControllers.createBranch);
router.get(
  "/",
  auth("admin", "hr", "superAdmin"),
  BranchControllers.getAllBranches,
);
router.patch("/:id", auth("admin"), BranchControllers.updateBranch);
router.delete("/:id", auth("admin"), BranchControllers.deleteBranch);

export default router;

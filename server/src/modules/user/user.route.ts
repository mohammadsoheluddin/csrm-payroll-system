import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "./user.constant";
import { UserControllers } from "./user.controller";

const router = Router();

router.get("/me", auth(), UserControllers.getMe);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.USER_READ),
  UserControllers.getAllUsers,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.USER_READ),
  UserControllers.getSingleUser,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.USER_MANAGE),
  UserControllers.updateUser,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.USER_MANAGE),
  UserControllers.deleteUser,
);

export default router;

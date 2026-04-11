import { Router } from "express";
import auth from "../../middleware/auth";
import { UserControllers } from "./user.controller";

const router = Router();

router.get(
  "/me",
  auth("superAdmin", "admin", "hr", "employee"),
  UserControllers.getMe,
);

router.get("/", auth("superAdmin", "admin"), UserControllers.getAllUsers);

router.get("/:id", auth("superAdmin", "admin"), UserControllers.getSingleUser);

router.patch("/:id", auth("superAdmin", "admin"), UserControllers.updateUser);

router.delete("/:id", auth("superAdmin", "admin"), UserControllers.deleteUser);

export default router;

import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/register", AuthControllers.registerUser);
router.post("/login", AuthControllers.loginUser);
router.post("/refresh-token", AuthControllers.refreshToken);
router.post("/logout", AuthControllers.logoutUser);

export default router;

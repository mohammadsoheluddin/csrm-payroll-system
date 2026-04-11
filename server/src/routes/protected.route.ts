import { Router } from "express";
import auth from "../middleware/auth";

const router = Router();

router.get("/profile", auth("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin route",
    user: (req as any).user,
  });
});

export default router;

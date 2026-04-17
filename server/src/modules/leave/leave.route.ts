import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { LeaveControllers } from "./leave.controller";
import { LeaveValidations } from "./leave.validation";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  validateRequest(LeaveValidations.createLeaveValidationSchema),
  LeaveControllers.createLeave,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr"),
  LeaveControllers.getAllLeave,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  LeaveControllers.getSingleLeave,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  validateRequest(LeaveValidations.updateLeaveValidationSchema),
  LeaveControllers.updateLeave,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  LeaveControllers.deleteLeave,
);

export default router;

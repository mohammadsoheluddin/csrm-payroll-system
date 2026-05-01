import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { LeaveControllers } from "./leave.controller";
import { LeaveValidations } from "./leave.validation";

const router = express.Router();

router.post(
  "/create-leave",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  validateRequest(LeaveValidations.createLeaveValidationSchema),
  LeaveControllers.createLeave,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_READ),
  validateRequest(LeaveValidations.getAllLeaveValidationSchema),
  LeaveControllers.getAllLeave,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_READ),
  validateRequest(LeaveValidations.leaveIdParamValidationSchema),
  LeaveControllers.getSingleLeave,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_APPROVE),
  validateRequest(LeaveValidations.approveLeaveValidationSchema),
  LeaveControllers.updateLeave,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  validateRequest(LeaveValidations.updateLeaveValidationSchema),
  LeaveControllers.updateLeave,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  validateRequest(LeaveValidations.leaveIdParamValidationSchema),
  LeaveControllers.deleteLeave,
);

export const LeaveRoutes = router;
export default router;

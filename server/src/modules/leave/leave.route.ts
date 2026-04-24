import express from "express";
import { LeaveControllers } from "./leave.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";

const router = express.Router();

router.post(
  "/create-leave",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  LeaveControllers.createLeave,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_READ),
  LeaveControllers.getAllLeave,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_READ),
  LeaveControllers.getSingleLeave,
);

/**
 * Approve leave route
 * Note:
 * Your controller does not have approveLeave yet.
 * So this route uses existing updateLeave controller with LEAVE_APPROVE permission.
 *
 * Postman body example:
 * {
 *   "status": "approved"
 * }
 */
router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_APPROVE),
  LeaveControllers.updateLeave,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  LeaveControllers.updateLeave,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_MANAGE),
  LeaveControllers.deleteLeave,
);

export const LeaveRoutes = router;
export default router;

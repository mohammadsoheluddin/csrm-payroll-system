import express from "express";
import { AttendanceControllers } from "./attendance.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";

const router = express.Router();

router.post(
  "/create-attendance",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  AttendanceControllers.createAttendance,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  AttendanceControllers.getAllAttendance,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  AttendanceControllers.getSingleAttendance,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  AttendanceControllers.updateAttendance,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  AttendanceControllers.deleteAttendance,
);

export const AttendanceRoutes = router;
export default router;

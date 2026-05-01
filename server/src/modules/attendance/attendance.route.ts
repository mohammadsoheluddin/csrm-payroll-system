import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { AttendanceControllers } from "./attendance.controller";
import { AttendanceValidations } from "./attendance.validation";

const router = express.Router();

router.post(
  "/create-attendance",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  validateRequest(AttendanceValidations.createAttendanceValidationSchema),
  AttendanceControllers.createAttendance,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateRequest(AttendanceValidations.getAllAttendanceValidationSchema),
  AttendanceControllers.getAllAttendance,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateRequest(AttendanceValidations.attendanceIdParamValidationSchema),
  AttendanceControllers.getSingleAttendance,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  validateRequest(AttendanceValidations.updateAttendanceValidationSchema),
  AttendanceControllers.updateAttendance,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  validateRequest(AttendanceValidations.attendanceIdParamValidationSchema),
  AttendanceControllers.deleteAttendance,
);

export const AttendanceRoutes = router;
export default router;

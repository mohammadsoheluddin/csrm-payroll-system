import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { AttendanceControllers } from "./attendance.controller";
import { AttendanceValidations } from "./attendance.validation";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  validateRequest(AttendanceValidations.createAttendanceValidationSchema),
  AttendanceControllers.createAttendance,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr"),
  AttendanceControllers.getAllAttendance,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  AttendanceControllers.getSingleAttendance,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  validateRequest(AttendanceValidations.updateAttendanceValidationSchema),
  AttendanceControllers.updateAttendance,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  AttendanceControllers.deleteAttendance,
);

export default router;

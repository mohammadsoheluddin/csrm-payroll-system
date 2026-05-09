import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { AttendanceFinalizationControllers } from "./attendanceFinalization.controller";
import { AttendanceFinalizationValidations } from "./attendanceFinalization.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS),
  validateRequest(
    AttendanceFinalizationValidations.generateAttendanceFinalizationValidationSchema,
  ),
  AttendanceFinalizationControllers.generateMonthlyAttendanceFinalization,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_READ),
  validateRequest(
    AttendanceFinalizationValidations.getAllAttendanceFinalizationValidationSchema,
  ),
  AttendanceFinalizationControllers.getAllAttendanceFinalization,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_READ),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationIdParamValidationSchema,
  ),
  AttendanceFinalizationControllers.getSingleAttendanceFinalization,
);

router.patch(
  "/:id/finalize",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationActionValidationSchema,
  ),
  AttendanceFinalizationControllers.finalizeAttendanceFinalization,
);

router.patch(
  "/:id/approve",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_APPROVE),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationActionValidationSchema,
  ),
  AttendanceFinalizationControllers.approveAttendanceFinalization,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_LOCK),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationActionValidationSchema,
  ),
  AttendanceFinalizationControllers.lockAttendanceFinalization,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_UNLOCK),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationActionValidationSchema,
  ),
  AttendanceFinalizationControllers.unlockAttendanceFinalization,
);

export const AttendanceFinalizationRoutes = router;
export default router;

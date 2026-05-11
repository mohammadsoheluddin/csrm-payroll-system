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
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_READ),
  validateRequest(
    AttendanceFinalizationValidations.getAllAttendanceFinalizationValidationSchema,
  ),
  AttendanceFinalizationControllers.getDeletedAttendanceFinalization,
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

router.patch(
  "/bulk/finalize",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationBulkActionValidationSchema,
  ),
  AttendanceFinalizationControllers.bulkFinalizeAttendanceFinalizations,
);

router.patch(
  "/bulk/approve",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_APPROVE),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationBulkActionValidationSchema,
  ),
  AttendanceFinalizationControllers.bulkApproveAttendanceFinalizations,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_LOCK),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationBulkActionValidationSchema,
  ),
  AttendanceFinalizationControllers.bulkLockAttendanceFinalizations,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_UNLOCK),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationBulkActionValidationSchema,
  ),
  AttendanceFinalizationControllers.bulkUnlockAttendanceFinalizations,
);


router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_READ),
  validateRequest(
    AttendanceFinalizationValidations.attendanceFinalizationOperationalSummaryValidationSchema,
  ),
  AttendanceFinalizationControllers.getAttendanceFinalizationOperationalSummary,
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
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS),
  validateRequest(
    AttendanceFinalizationValidations.restoreAttendanceFinalizationValidationSchema,
  ),
  AttendanceFinalizationControllers.restoreAttendanceFinalization,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS),
  validateRequest(
    AttendanceFinalizationValidations.deleteAttendanceFinalizationValidationSchema,
  ),
  AttendanceFinalizationControllers.deleteAttendanceFinalization,
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

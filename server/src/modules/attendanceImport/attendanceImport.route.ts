import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { AttendanceImportControllers } from "./attendanceImport.controller";
import { AttendanceImportValidations } from "./attendanceImport.validation";

const router = Router();

router.post(
  "/preview",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_PROCESS),
  validateRequest(AttendanceImportValidations.previewAttendanceImportValidationSchema),
  AttendanceImportControllers.previewAttendanceImport,
);

router.post(
  "/commit",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_PROCESS),
  validateRequest(AttendanceImportValidations.commitAttendanceImportValidationSchema),
  AttendanceImportControllers.commitAttendanceImport,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_READ),
  validateRequest(AttendanceImportValidations.getAllAttendanceImportsValidationSchema),
  AttendanceImportControllers.getAllAttendanceImports,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_READ),
  validateRequest(AttendanceImportValidations.attendanceImportIdParamValidationSchema),
  AttendanceImportControllers.getSingleAttendanceImport,
);

export const AttendanceImportRoutes = router;
export default router;

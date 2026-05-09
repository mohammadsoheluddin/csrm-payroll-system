import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { AttendanceImportControllers } from "./attendanceImport.controller";
import { AttendanceImportValidations } from "./attendanceImport.validation";

const router = Router();


router.get(
  "/template/preview",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_READ),
  validateRequest(AttendanceImportValidations.attendanceImportTemplateQueryValidationSchema),
  AttendanceImportControllers.getAttendanceImportTemplatePreview,
);

router.get(
  "/template/csv",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_EXPORT),
  validateRequest(AttendanceImportValidations.attendanceImportTemplateQueryValidationSchema),
  AttendanceImportControllers.exportAttendanceImportTemplateCsv,
);

router.get(
  "/template/excel",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_EXPORT),
  validateRequest(AttendanceImportValidations.attendanceImportTemplateQueryValidationSchema),
  AttendanceImportControllers.exportAttendanceImportTemplateExcel,
);


router.get(
  "/:id/revert/preview",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_READ),
  validateRequest(AttendanceImportValidations.attendanceImportIdParamValidationSchema),
  AttendanceImportControllers.previewAttendanceImportRollback,
);

router.patch(
  "/:id/revert",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_REVERT),
  validateRequest(AttendanceImportValidations.revertAttendanceImportValidationSchema),
  AttendanceImportControllers.rollbackAttendanceImportBatch,
);

router.get(
  "/:id/rejections/preview",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_READ),
  validateRequest(AttendanceImportValidations.attendanceImportIdParamValidationSchema),
  AttendanceImportControllers.getAttendanceImportRejectionReportPreview,
);

router.get(
  "/:id/rejections/csv",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_EXPORT),
  validateRequest(AttendanceImportValidations.attendanceImportIdParamValidationSchema),
  AttendanceImportControllers.exportAttendanceImportRejectionsCsv,
);

router.get(
  "/:id/rejections/excel",
  auth(),
  requirePermission(PERMISSIONS.ATTENDANCE_IMPORT_EXPORT),
  validateRequest(AttendanceImportValidations.attendanceImportIdParamValidationSchema),
  AttendanceImportControllers.exportAttendanceImportRejectionsExcel,
);

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

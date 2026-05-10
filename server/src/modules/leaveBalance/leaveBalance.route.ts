import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { LeaveBalanceControllers } from "./leaveBalance.controller";
import { LeaveBalanceValidations } from "./leaveBalance.validation";

const router = Router();

router.post(
  "/generate",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_PROCESS),
  validateRequest(LeaveBalanceValidations.generateLeaveBalanceValidationSchema),
  LeaveBalanceControllers.generateLeaveBalances,
);


router.get(
  "/export/preview",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceExportQueryValidationSchema),
  LeaveBalanceControllers.getLeaveBalanceExportPreview,
);

router.get(
  "/export/csv",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceExportQueryValidationSchema),
  LeaveBalanceControllers.exportLeaveBalanceCsv,
);

router.get(
  "/export/excel",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceExportQueryValidationSchema),
  LeaveBalanceControllers.exportLeaveBalanceExcel,
);

router.get(
  "/export/pdf",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceExportQueryValidationSchema),
  LeaveBalanceControllers.exportLeaveBalancePdf,
);

router.get(
  "/ledger/preview",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_READ),
  validateRequest(LeaveBalanceValidations.leaveBalanceLedgerQueryValidationSchema),
  LeaveBalanceControllers.getEmployeeLeaveLedgerPreview,
);

router.get(
  "/ledger/csv",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceLedgerQueryValidationSchema),
  LeaveBalanceControllers.exportEmployeeLeaveLedgerCsv,
);

router.get(
  "/ledger/excel",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceLedgerQueryValidationSchema),
  LeaveBalanceControllers.exportEmployeeLeaveLedgerExcel,
);

router.get(
  "/ledger/pdf",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_EXPORT),
  validateRequest(LeaveBalanceValidations.leaveBalanceLedgerQueryValidationSchema),
  LeaveBalanceControllers.exportEmployeeLeaveLedgerPdf,
);

router.get(
  "/summary",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_READ),
  validateRequest(LeaveBalanceValidations.leaveBalanceSummaryQueryValidationSchema),
  LeaveBalanceControllers.getLeaveBalanceSummary,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_READ),
  validateRequest(LeaveBalanceValidations.leaveBalanceQueryValidationSchema),
  LeaveBalanceControllers.getAllLeaveBalances,
);

router.patch(
  "/bulk/lock",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_LOCK),
  validateRequest(LeaveBalanceValidations.leaveBalanceBulkActionValidationSchema),
  LeaveBalanceControllers.bulkLockLeaveBalances,
);

router.patch(
  "/bulk/unlock",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_UNLOCK),
  validateRequest(LeaveBalanceValidations.leaveBalanceBulkActionValidationSchema),
  LeaveBalanceControllers.bulkUnlockLeaveBalances,
);


router.patch(
  "/:id/opening-balance",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_ADJUST),
  validateRequest(
    LeaveBalanceValidations.leaveBalanceOpeningBalanceValidationSchema,
  ),
  LeaveBalanceControllers.setLeaveBalanceOpeningBalance,
);

router.patch(
  "/:id/adjust",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_ADJUST),
  validateRequest(LeaveBalanceValidations.leaveBalanceAdjustmentValidationSchema),
  LeaveBalanceControllers.adjustLeaveBalance,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_READ),
  validateRequest(LeaveBalanceValidations.leaveBalanceIdParamValidationSchema),
  LeaveBalanceControllers.getSingleLeaveBalance,
);

router.patch(
  "/:id/lock",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_LOCK),
  validateRequest(LeaveBalanceValidations.leaveBalanceActionValidationSchema),
  LeaveBalanceControllers.lockLeaveBalance,
);

router.patch(
  "/:id/unlock",
  auth(),
  requirePermission(PERMISSIONS.LEAVE_BALANCE_UNLOCK),
  validateRequest(LeaveBalanceValidations.leaveBalanceActionValidationSchema),
  LeaveBalanceControllers.unlockLeaveBalance,
);

export const LeaveBalanceRoutes = router;
export default router;

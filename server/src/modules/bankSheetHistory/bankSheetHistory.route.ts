import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";
import { PERMISSIONS } from "../user/user.constant";
import { BankSheetHistoryControllers } from "./bankSheetHistory.controller";
import { BankSheetHistoryValidations } from "./bankSheetHistory.validation";

const router = Router();

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.BANK_SHEET_READ),
  validateRequest(
    BankSheetHistoryValidations.getAllBankSheetHistoryValidationSchema,
  ),
  BankSheetHistoryControllers.getAllBankSheetHistory,
);


router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.BANK_SHEET_READ),
  BankSheetHistoryControllers.getDeletedBankSheetHistory,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.BANK_SHEET_MANAGE),
  validateRequest(createRestoreValidationSchema("id")),
  BankSheetHistoryControllers.restoreBankSheetHistory,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.BANK_SHEET_MANAGE),
  validateRequest(createSoftDeleteValidationSchema("id")),
  BankSheetHistoryControllers.deleteBankSheetHistory,
);

export const BankSheetHistoryRoutes = router;

export default router;

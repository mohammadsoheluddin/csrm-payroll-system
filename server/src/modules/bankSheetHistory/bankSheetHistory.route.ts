import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
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

export const BankSheetHistoryRoutes = router;

export default router;

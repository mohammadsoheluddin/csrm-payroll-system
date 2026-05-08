import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { BankSheetControllers } from "./bankSheet.controller";
import { BankSheetValidations } from "./bankSheet.validation";

const router = Router();

router.get(
  "/salary/preview",
  auth(),
  requirePermission(PERMISSIONS.BANK_SHEET_READ),
  validateRequest(
    BankSheetValidations.generateBankSheetPreviewValidationSchema,
  ),
  BankSheetControllers.generateSalaryBankSheetPreview,
);

export const BankSheetRoutes = router;
export default router;

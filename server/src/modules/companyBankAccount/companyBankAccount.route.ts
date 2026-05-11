import express from "express";

import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";

import { CompanyBankAccountControllers } from "./companyBankAccount.controller";
import { CompanyBankAccountValidations } from "./companyBankAccount.validation";

const router = express.Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_BANK_ACCOUNT_MANAGE),
  validateRequest(
    CompanyBankAccountValidations.createCompanyBankAccountValidationSchema,
  ),
  CompanyBankAccountControllers.createCompanyBankAccount,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_BANK_ACCOUNT_READ),
  validateRequest(
    CompanyBankAccountValidations.getAllCompanyBankAccountsValidationSchema,
  ),
  CompanyBankAccountControllers.getAllCompanyBankAccounts,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_BANK_ACCOUNT_READ),
  validateRequest(
    CompanyBankAccountValidations.companyBankAccountIdValidationSchema,
  ),
  CompanyBankAccountControllers.getSingleCompanyBankAccount,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_BANK_ACCOUNT_MANAGE),
  validateRequest(
    CompanyBankAccountValidations.updateCompanyBankAccountValidationSchema,
  ),
  CompanyBankAccountControllers.updateCompanyBankAccount,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_BANK_ACCOUNT_MANAGE),
  validateRequest(
    CompanyBankAccountValidations.companyBankAccountIdValidationSchema,
  ),
  CompanyBankAccountControllers.deleteCompanyBankAccount,
);

export const CompanyBankAccountRoutes = router;

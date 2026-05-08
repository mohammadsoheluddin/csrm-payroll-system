import express from "express";

import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

import { USER_ROLE } from "../user/user.constant";

import { CompanyBankAccountControllers } from "./companyBankAccount.controller";

import { CompanyBankAccountValidations } from "./companyBankAccount.validation";

const router = express.Router();

router.post(
  "/",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.accounts,
    USER_ROLE.hr,
  ),
  validateRequest(
    CompanyBankAccountValidations.createCompanyBankAccountValidationSchema,
  ),
  CompanyBankAccountControllers.createCompanyBankAccount,
);

router.get(
  "/",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.accounts,
    USER_ROLE.hr,
  ),
  CompanyBankAccountControllers.getAllCompanyBankAccounts,
);

router.get(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.accounts,
    USER_ROLE.hr,
  ),
  CompanyBankAccountControllers.getSingleCompanyBankAccount,
);

router.patch(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.accounts,
    USER_ROLE.hr,
  ),
  validateRequest(
    CompanyBankAccountValidations.updateCompanyBankAccountValidationSchema,
  ),
  CompanyBankAccountControllers.updateCompanyBankAccount,
);

router.delete(
  "/:id",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.accounts),
  CompanyBankAccountControllers.deleteCompanyBankAccount,
);

export const CompanyBankAccountRoutes = router;

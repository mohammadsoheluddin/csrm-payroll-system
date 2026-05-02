import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { CompanyControllers } from "./company.controller";
import { CompanyValidations } from "./company.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_MANAGE),
  validateRequest(CompanyValidations.createCompanyValidationSchema),
  CompanyControllers.createCompany,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_READ),
  validateRequest(CompanyValidations.getAllCompaniesValidationSchema),
  CompanyControllers.getAllCompanies,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_READ),
  validateRequest(CompanyValidations.companyIdParamValidationSchema),
  CompanyControllers.getSingleCompany,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_MANAGE),
  validateRequest(CompanyValidations.updateCompanyValidationSchema),
  CompanyControllers.updateCompany,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.COMPANY_MANAGE),
  validateRequest(CompanyValidations.companyIdParamValidationSchema),
  CompanyControllers.deleteCompany,
);

export const CompanyRoutes = router;
export default router;

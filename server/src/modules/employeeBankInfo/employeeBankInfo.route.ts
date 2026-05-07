import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { EmployeeBankInfoControllers } from "./employeeBankInfo.controller";
import { EmployeeBankInfoValidations } from "./employeeBankInfo.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BANK_INFO_MANAGE),
  validateRequest(
    EmployeeBankInfoValidations.createEmployeeBankInfoValidationSchema,
  ),
  EmployeeBankInfoControllers.createEmployeeBankInfo,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BANK_INFO_READ),
  validateRequest(
    EmployeeBankInfoValidations.getAllEmployeeBankInfosValidationSchema,
  ),
  EmployeeBankInfoControllers.getAllEmployeeBankInfos,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BANK_INFO_READ),
  validateRequest(
    EmployeeBankInfoValidations.employeeBankInfoIdParamValidationSchema,
  ),
  EmployeeBankInfoControllers.getSingleEmployeeBankInfo,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BANK_INFO_MANAGE),
  validateRequest(
    EmployeeBankInfoValidations.updateEmployeeBankInfoValidationSchema,
  ),
  EmployeeBankInfoControllers.updateEmployeeBankInfo,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_BANK_INFO_MANAGE),
  validateRequest(
    EmployeeBankInfoValidations.employeeBankInfoIdParamValidationSchema,
  ),
  EmployeeBankInfoControllers.deleteEmployeeBankInfo,
);

export const EmployeeBankInfoRoutes = router;
export default router;

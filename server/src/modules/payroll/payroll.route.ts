import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { PayrollController } from "./payroll.controller";
import { PayrollGenerateController } from "./payroll.generate.controller";
import { PayrollGenerateValidation } from "./payroll.generate.validation";

const router = express.Router();

router.post(
  "/generate",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  validateRequest(
    PayrollGenerateValidation.generateMonthlyPayrollValidationSchema,
  ),
  PayrollGenerateController.generateMonthlyPayroll,
);

router.patch(
  "/:id/process",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.admin,
    USER_ROLE.hr,
    USER_ROLE.accounts,
  ),
  PayrollController.processPayrollById,
);

router.patch(
  "/:id/approve",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.accounts),
  PayrollController.approvePayrollById,
);

router.patch(
  "/:id/lock",
  auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.accounts),
  PayrollController.lockPayrollById,
);

export const payrollRoutes = router;

export default router;

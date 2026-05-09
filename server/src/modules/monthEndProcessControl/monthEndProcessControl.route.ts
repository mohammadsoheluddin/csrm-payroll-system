import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { MonthEndProcessControlControllers } from "./monthEndProcessControl.controller";
import { MonthEndProcessControlValidations } from "./monthEndProcessControl.validation";

const router = Router();

router.get(
  "/status",
  auth(),
  requirePermission(PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ),
  validateRequest(
    MonthEndProcessControlValidations.monthEndProcessControlQueryValidationSchema,
  ),
  MonthEndProcessControlControllers.getMonthEndProcessControlStatus,
);

router.get(
  "/checklist",
  auth(),
  requirePermission(PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ),
  validateRequest(
    MonthEndProcessControlValidations.monthEndProcessControlQueryValidationSchema,
  ),
  MonthEndProcessControlControllers.getMonthEndProcessChecklist,
);

export const MonthEndProcessControlRoutes = router;
export default router;

import express from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { HolidayControllers } from "./holiday.controller";
import { HolidayValidations } from "./holiday.validation";

const router = express.Router();

router.post(
  "/create-holiday",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  validateRequest(HolidayValidations.createHolidayValidationSchema),
  HolidayControllers.createHoliday,
);

router.get(
  "/deleted",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_READ),
  HolidayControllers.getDeletedHoliday,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_READ),
  HolidayControllers.getAllHoliday,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_READ),
  validateRequest(HolidayValidations.holidayIdParamValidationSchema),
  HolidayControllers.getSingleHoliday,
);

router.patch(
  "/:id/restore",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  validateRequest(HolidayValidations.restoreHolidayValidationSchema),
  HolidayControllers.restoreHoliday,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  validateRequest(HolidayValidations.updateHolidayValidationSchema),
  HolidayControllers.updateHoliday,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  validateRequest(HolidayValidations.deleteHolidayValidationSchema),
  HolidayControllers.deleteHoliday,
);

export const HolidayRoutes = router;
export default router;

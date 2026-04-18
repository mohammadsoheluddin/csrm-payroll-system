import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { HolidayControllers } from "./holiday.controller";
import { HolidayValidations } from "./holiday.validation";

const router = Router();

router.post(
  "/",
  auth("superAdmin", "admin", "hr"),
  validateRequest(HolidayValidations.createHolidayValidationSchema),
  HolidayControllers.createHoliday,
);

router.get(
  "/",
  auth("superAdmin", "admin", "hr"),
  HolidayControllers.getAllHoliday,
);

router.get(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  HolidayControllers.getSingleHoliday,
);

router.patch(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  validateRequest(HolidayValidations.updateHolidayValidationSchema),
  HolidayControllers.updateHoliday,
);

router.delete(
  "/:id",
  auth("superAdmin", "admin", "hr"),
  HolidayControllers.deleteHoliday,
);

export default router;

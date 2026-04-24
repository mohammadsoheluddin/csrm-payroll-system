import express from "express";
import { HolidayControllers } from "./holiday.controller";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../user/user.constant";

const router = express.Router();

router.post(
  "/create-holiday",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  HolidayControllers.createHoliday,
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
  HolidayControllers.getSingleHoliday,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  HolidayControllers.updateHoliday,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.HOLIDAY_MANAGE),
  HolidayControllers.deleteHoliday,
);

export const HolidayRoutes = router;
export default router;

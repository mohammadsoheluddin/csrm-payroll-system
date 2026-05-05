import { Router } from "express";
import auth from "../../middleware/auth";
import requirePermission from "../../middleware/requirePermission";
import validateRequest from "../../middleware/validateRequest";
import { PERMISSIONS } from "../user/user.constant";
import { DesignationControllers } from "./designation.controller";
import { DesignationValidations } from "./designation.validation";

const router = Router();

router.post(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DESIGNATION_MANAGE),
  validateRequest(DesignationValidations.createDesignationValidationSchema),
  DesignationControllers.createDesignation,
);

router.get(
  "/",
  auth(),
  requirePermission(PERMISSIONS.DESIGNATION_READ),
  validateRequest(DesignationValidations.getAllDesignationsValidationSchema),
  DesignationControllers.getAllDesignations,
);

router.get(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DESIGNATION_READ),
  validateRequest(DesignationValidations.designationIdParamValidationSchema),
  DesignationControllers.getSingleDesignation,
);

router.patch(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DESIGNATION_MANAGE),
  validateRequest(DesignationValidations.updateDesignationValidationSchema),
  DesignationControllers.updateDesignation,
);

router.delete(
  "/:id",
  auth(),
  requirePermission(PERMISSIONS.DESIGNATION_MANAGE),
  validateRequest(DesignationValidations.designationIdParamValidationSchema),
  DesignationControllers.deleteDesignation,
);

export const DesignationRoutes = router;
export default router;

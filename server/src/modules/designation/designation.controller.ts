import type { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { DesignationServices } from "./designation.service";

const createDesignation = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await DesignationServices.createDesignationIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "designation",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Designation created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Designation created successfully",
    data: result,
  });
});

const getAllDesignations = catchAsync(async (req: Request, res: Response) => {
  const result = await DesignationServices.getAllDesignationsFromDB(
    req.query as unknown as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Designations retrieved successfully",
    data: result,
  });
});

const getSingleDesignation = catchAsync(async (req: Request, res: Response) => {
  const designationId = req.params.id as string;

  const result =
    await DesignationServices.getSingleDesignationFromDB(designationId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Designation retrieved successfully",
    data: result,
  });
});

const updateDesignation = catchAsync(async (req: Request, res: Response) => {
  const designationId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousDesignation =
    await DesignationServices.getSingleDesignationFromDB(designationId);

  const result = await DesignationServices.updateDesignationIntoDB(
    designationId,
    req.body,
  );

  await createAuditLogFromRequest(req, {
    module: "designation",
    action: "update",
    entityId: getAuditEntityId(result, designationId),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Designation updated",
    previousData: toAuditData(previousDesignation),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Designation updated successfully",
    data: result,
  });
});

const deleteDesignation = catchAsync(async (req: Request, res: Response) => {
  const designationId = req.params.id as string;

  const previousDesignation =
    await DesignationServices.getSingleDesignationFromDB(designationId);

  const result =
    await DesignationServices.deleteDesignationFromDB(designationId);

  await createAuditLogFromRequest(req, {
    module: "designation",
    action: "soft_delete",
    entityId: getAuditEntityId(result, designationId),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Designation soft deleted",
    previousData: toAuditData(previousDesignation),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Designation deleted successfully",
    data: result,
  });
});

export const DesignationControllers = {
  createDesignation,
  getAllDesignations,
  getSingleDesignation,
  updateDesignation,
  deleteDesignation,
};

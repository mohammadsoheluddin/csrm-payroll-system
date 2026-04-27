import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { LeaveServices } from "./leave.service";

const createLeave = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await LeaveServices.createLeaveIntoDB(req.body);

  // Added: Audit log for leave creation
  await createAuditLogFromRequest(req, {
    module: "leave",
    action: "create",
    entityId: getAuditEntityId(result),
    description: "Leave created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Leave created successfully",
    data: result,
  });
});

const getAllLeave = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveServices.getAllLeaveFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave records retrieved successfully",
    data: result,
  });
});

const getSingleLeave = catchAsync(async (req: Request, res: Response) => {
  const leaveId = req.params.id as string;

  const result = await LeaveServices.getSingleLeaveFromDB(leaveId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave record retrieved successfully",
    data: result,
  });
});

const updateLeave = catchAsync(async (req: Request, res: Response) => {
  const leaveId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousLeave = await LeaveServices.getSingleLeaveFromDB(leaveId);

  const result = await LeaveServices.updateLeaveIntoDB(leaveId, req.body);

  const isApproveRoute = req.originalUrl.includes("/approve");

  // Added: Audit log for leave update/approve
  await createAuditLogFromRequest(req, {
    module: "leave",
    action: isApproveRoute ? "approve" : "update",
    entityId: getAuditEntityId(result, leaveId),
    description: isApproveRoute ? "Leave approved" : "Leave updated",
    previousData: toAuditData(previousLeave),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
      route: req.originalUrl,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave updated successfully",
    data: result,
  });
});

const deleteLeave = catchAsync(async (req: Request, res: Response) => {
  const leaveId = req.params.id as string;

  const previousLeave = await LeaveServices.getSingleLeaveFromDB(leaveId);

  const result = await LeaveServices.deleteLeaveFromDB(leaveId);

  // Added: Audit log for leave soft delete
  await createAuditLogFromRequest(req, {
    module: "leave",
    action: "soft_delete",
    entityId: getAuditEntityId(result, leaveId),
    description: "Leave soft deleted",
    previousData: toAuditData(previousLeave),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave deleted successfully",
    data: result,
  });
});

export const LeaveControllers = {
  createLeave,
  getAllLeave,
  getSingleLeave,
  updateLeave,
  deleteLeave,
};

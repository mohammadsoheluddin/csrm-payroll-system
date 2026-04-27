import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TAuditLogQuery } from "./auditLog.interface";
import { AuditLogServices } from "./auditLog.service";

const getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getAllAuditLogsFromDB(
    req.query as TAuditLogQuery,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAuditLog = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getSingleAuditLogFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit log retrieved successfully",
    data: result,
  });
});

const getAuditLogsByEntity = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getAuditLogsByEntityFromDB(
    req.params.entityId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Entity audit logs retrieved successfully",
    data: result,
  });
});

export const AuditLogControllers = {
  getAllAuditLogs,
  getSingleAuditLog,
  getAuditLogsByEntity,
};

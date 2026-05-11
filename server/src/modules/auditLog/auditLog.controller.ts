import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  TAuditLogEntityTrailQuery,
  TAuditLogFilterOptionsQuery,
  TAuditLogQuery,
  TAuditLogSensitiveQuery,
  TAuditLogSummaryQuery,
  TAuditLogTimelineQuery,
} from "./auditLog.interface";
import { AuditLogServices } from "./auditLog.service";

/**
 * Added:
 * Safely converts route params into a single string.
 * This fixes TypeScript error: string | string[] is not assignable to string.
 */
const getRequiredStringParam = (
  value: string | string[] | undefined,
  fieldName: string,
): string => {
  if (!value || Array.isArray(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return value;
};

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

const getAuditLogSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getAuditLogSummaryFromDB(
    req.query as TAuditLogSummaryQuery,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit log summary retrieved successfully",
    data: result,
  });
});

const getAuditLogTimeline = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getAuditLogTimelineFromDB(
    req.query as TAuditLogTimelineQuery,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit log timeline retrieved successfully",
    data: result,
  });
});

const getAuditLogFilterOptions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuditLogServices.getAuditLogFilterOptionsFromDB(
      req.query as TAuditLogFilterOptionsQuery,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Audit log filter options retrieved successfully",
      data: result,
    });
  },
);


const getSensitiveAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getSensitiveAuditLogsFromDB(
    req.query as TAuditLogSensitiveQuery,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sensitive audit logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAuditLog = catchAsync(async (req: Request, res: Response) => {
  const auditLogId = getRequiredStringParam(req.params.id, "audit log id");

  const result = await AuditLogServices.getSingleAuditLogFromDB(auditLogId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit log retrieved successfully",
    data: result,
  });
});

const getAuditLogsByEntity = catchAsync(async (req: Request, res: Response) => {
  const entityId = getRequiredStringParam(req.params.entityId, "entity id");

  const result = await AuditLogServices.getAuditLogsByEntityFromDB(
    entityId,
    req.query as TAuditLogEntityTrailQuery,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Entity audit trail retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AuditLogControllers = {
  getAllAuditLogs,
  getAuditLogSummary,
  getAuditLogTimeline,
  getAuditLogFilterOptions,
  getSensitiveAuditLogs,
  getSingleAuditLog,
  getAuditLogsByEntity,
};

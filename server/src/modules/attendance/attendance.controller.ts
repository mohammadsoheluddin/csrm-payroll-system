import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { AttendanceServices } from "./attendance.service";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await AttendanceServices.createAttendanceIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "attendance",
    action: "create",
    entityId: getAuditEntityId(result),
    description: "Attendance created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Attendance created successfully",
    data: result,
  });
});

const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceServices.getAllAttendanceFromDB(
    req.query as unknown as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance retrieved successfully",
    data: result,
  });
});

const getDeletedAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceServices.getDeletedAttendanceFromDB(
    req.query as unknown as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted attendance records retrieved successfully",
    data: result,
  });
});

const getSingleAttendance = catchAsync(async (req: Request, res: Response) => {
  const attendanceId = req.params.id as string;

  const result =
    await AttendanceServices.getSingleAttendanceFromDB(attendanceId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance retrieved successfully",
    data: result,
  });
});

const updateAttendance = catchAsync(async (req: Request, res: Response) => {
  const attendanceId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousAttendance =
    await AttendanceServices.getSingleAttendanceFromDB(attendanceId);

  const result = await AttendanceServices.updateAttendanceIntoDB(
    attendanceId,
    req.body,
  );

  await createAuditLogFromRequest(req, {
    module: "attendance",
    action: "update",
    entityId: getAuditEntityId(result, attendanceId),
    description: "Attendance updated",
    previousData: toAuditData(previousAttendance),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance updated successfully",
    data: result,
  });
});

const deleteAttendance = catchAsync(async (req: Request, res: Response) => {
  const attendanceId = req.params.id as string;

  const previousAttendance =
    await AttendanceServices.getSingleAttendanceFromDB(attendanceId);

  const result = await AttendanceServices.deleteAttendanceFromDB(attendanceId, {
    userId: getRequestUserId(req),
    deleteReason: req.body?.deleteReason,
  });

  await createAuditLogFromRequest(req, {
    module: "attendance",
    action: "soft_delete",
    entityId: getAuditEntityId(result, attendanceId),
    description: "Attendance soft deleted",
    previousData: toAuditData(previousAttendance),
    newData: toAuditData(result),
    metadata: {
      deleteReason: req.body?.deleteReason || null,
      policy: "Blocked if attendance finalization month is locked",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance deleted successfully",
    data: result,
  });
});

const restoreAttendance = catchAsync(async (req: Request, res: Response) => {
  const attendanceId = req.params.id as string;

  const result = await AttendanceServices.restoreAttendanceIntoDB(attendanceId, {
    userId: getRequestUserId(req),
    restoreReason: req.body?.restoreReason,
  });

  await createAuditLogFromRequest(req, {
    module: "attendance",
    action: "restore",
    entityId: getAuditEntityId(result, attendanceId),
    description: "Attendance restored",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      restoreReason: req.body?.restoreReason || null,
      policy: "Blocked if active duplicate exists or attendance finalization month is locked",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance restored successfully",
    data: result,
  });
});

export const AttendanceControllers = {
  createAttendance,
  getAllAttendance,
  getDeletedAttendance,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance,
  restoreAttendance,
};

import { Request, Response } from "express";
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
  /**
   * Kept:
   * Extra safeguard even though route-level Zod validation now checks request body.
   */
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await AttendanceServices.createAttendanceIntoDB(req.body);

  // Added: Audit log for attendance creation
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
    req.query as {
      employee?: string;
      status?: string;
      attendanceDate?: string;
      source?: string;
      fromDate?: string;
      toDate?: string;
    },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance retrieved successfully",
    data: result,
  });
});

const getSingleAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceServices.getSingleAttendanceFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance retrieved successfully",
    data: result,
  });
});

const updateAttendance = catchAsync(async (req: Request, res: Response) => {
  /**
   * Kept:
   * Extra safeguard even though update validation already blocks empty body.
   */
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const attendanceId = req.params.id as string;

  const previousAttendance =
    await AttendanceServices.getSingleAttendanceFromDB(attendanceId);

  const result = await AttendanceServices.updateAttendanceIntoDB(
    attendanceId,
    req.body,
  );

  // Added: Audit log for attendance update
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

  const result = await AttendanceServices.deleteAttendanceFromDB(attendanceId);

  // Added: Audit log for attendance soft delete
  await createAuditLogFromRequest(req, {
    module: "attendance",
    action: "soft_delete",
    entityId: getAuditEntityId(result, attendanceId),
    description: "Attendance soft deleted",
    previousData: toAuditData(previousAttendance),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance deleted successfully",
    data: result,
  });
});

export const AttendanceControllers = {
  createAttendance,
  getAllAttendance,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance,
};

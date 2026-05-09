import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest, getAuditEntityId, toAuditData } from "../auditLog/auditLog.utils";
import { AttendanceImportServices } from "./attendanceImport.service";

const getParamId = (req: Request, paramName: string) => {
  const value = req.params[paramName];

  return Array.isArray(value) ? value[0] : value;
};

const getUserIdFromRequest = (req: Request) => {
  const requestUser = (
    req as Request & {
      user?: {
        userId?: string;
        _id?: string;
        id?: string;
      };
    }
  ).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

const previewAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.previewAttendanceImportFromPayload(
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import preview generated successfully",
    data: result,
  });
});

const commitAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await AttendanceImportServices.commitAttendanceImportIntoDB(
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "attendance_import",
    action: "process",
    entityId: getAuditEntityId(result),
    entityName: result?.batchNo,
    description: "Attendance import committed",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      source: result?.source,
      matchBy: result?.matchBy,
      totalRows: result?.totalRows,
      validRows: result?.validRows,
      invalidRows: result?.invalidRows,
      insertedAttendanceCount: result?.insertedAttendanceCount,
      updatedAttendanceCount: result?.updatedAttendanceCount,
      skippedAttendanceCount: result?.skippedAttendanceCount,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Attendance import committed successfully",
    data: result,
  });
});

const getAllAttendanceImports = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.getAllAttendanceImportsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import batches retrieved successfully",
    data: result,
  });
});

const getSingleAttendanceImport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.getSingleAttendanceImportFromDB(
      getParamId(req, "id"),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import batch retrieved successfully",
      data: result,
    });
  },
);

export const AttendanceImportControllers = {
  previewAttendanceImport,
  commitAttendanceImport,
  getAllAttendanceImports,
  getSingleAttendanceImport,
};

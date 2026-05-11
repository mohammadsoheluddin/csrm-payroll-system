import { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { HolidayServices } from "./holiday.service";

const createHoliday = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await HolidayServices.createHolidayIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "holiday",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["holidayName", "name", "title"]),
    description: "Holiday created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Holiday created successfully",
    data: result,
  });
});

const getAllHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayServices.getAllHolidayFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday records retrieved successfully",
    data: result,
  });
});

const getDeletedHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayServices.getDeletedHolidayFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted holiday records retrieved successfully",
    data: result,
  });
});

const getSingleHoliday = catchAsync(async (req: Request, res: Response) => {
  const holidayId = req.params.id as string;

  const result = await HolidayServices.getSingleHolidayFromDB(holidayId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday record retrieved successfully",
    data: result,
  });
});

const updateHoliday = catchAsync(async (req: Request, res: Response) => {
  const holidayId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousHoliday =
    await HolidayServices.getSingleHolidayFromDB(holidayId);

  const result = await HolidayServices.updateHolidayIntoDB(holidayId, req.body);

  await createAuditLogFromRequest(req, {
    module: "holiday",
    action: "update",
    entityId: getAuditEntityId(result, holidayId),
    entityName: getAuditEntityName(result, ["holidayName", "name", "title"]),
    description: "Holiday updated",
    previousData: toAuditData(previousHoliday),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday updated successfully",
    data: result,
  });
});

const deleteHoliday = catchAsync(async (req: Request, res: Response) => {
  const holidayId = req.params.id as string;

  const previousHoliday =
    await HolidayServices.getSingleHolidayFromDB(holidayId);

  const result = await HolidayServices.deleteHolidayFromDB(holidayId, {
    userId: getRequestUserId(req),
    deleteReason: req.body?.deleteReason,
  });

  await createAuditLogFromRequest(req, {
    module: "holiday",
    action: "soft_delete",
    entityId: getAuditEntityId(result, holidayId),
    entityName: getAuditEntityName(result, ["holidayName", "name", "title"]),
    description: "Holiday soft deleted",
    previousData: toAuditData(previousHoliday),
    newData: toAuditData(result),
    metadata: {
      deleteReason: req.body?.deleteReason || null,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday deleted successfully",
    data: result,
  });
});

const restoreHoliday = catchAsync(async (req: Request, res: Response) => {
  const holidayId = req.params.id as string;

  const result = await HolidayServices.restoreHolidayIntoDB(holidayId, {
    userId: getRequestUserId(req),
    restoreReason: req.body?.restoreReason,
  });

  await createAuditLogFromRequest(req, {
    module: "holiday",
    action: "restore",
    entityId: getAuditEntityId(result, holidayId),
    entityName: getAuditEntityName(result, ["holidayName", "name", "title"]),
    description: "Holiday restored",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      restoreReason: req.body?.restoreReason || null,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday restored successfully",
    data: result,
  });
});

export const HolidayControllers = {
  createHoliday,
  getAllHoliday,
  getDeletedHoliday,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
  restoreHoliday,
};

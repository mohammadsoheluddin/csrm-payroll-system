import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AttendanceServices } from "./attendance.service";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await AttendanceServices.createAttendanceIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Attendance created successfully",
    data: result,
  });
});

const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceServices.getAllAttendanceFromDB(
    req.query as Record<string, unknown>,
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
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await AttendanceServices.updateAttendanceIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance updated successfully",
    data: result,
  });
});

const deleteAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceServices.deleteAttendanceFromDB(
    req.params.id as string,
  );

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

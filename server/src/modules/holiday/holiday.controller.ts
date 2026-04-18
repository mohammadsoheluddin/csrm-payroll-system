import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { HolidayServices } from "./holiday.service";

const createHoliday = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await HolidayServices.createHolidayIntoDB(req.body);

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

const getSingleHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayServices.getSingleHolidayFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday record retrieved successfully",
    data: result,
  });
});

const updateHoliday = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await HolidayServices.updateHolidayIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday updated successfully",
    data: result,
  });
});

const deleteHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayServices.deleteHolidayFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Holiday deleted successfully",
    data: result,
  });
});

export const HolidayControllers = {
  createHoliday,
  getAllHoliday,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
};

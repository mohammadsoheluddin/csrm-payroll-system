import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LeaveServices } from "./leave.service";

const createLeave = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await LeaveServices.createLeaveIntoDB(req.body);

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
  const result = await LeaveServices.getSingleLeaveFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave record retrieved successfully",
    data: result,
  });
});

const updateLeave = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await LeaveServices.updateLeaveIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave updated successfully",
    data: result,
  });
});

const deleteLeave = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveServices.deleteLeaveFromDB(req.params.id as string);

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

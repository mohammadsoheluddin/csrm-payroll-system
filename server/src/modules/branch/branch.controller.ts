import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BranchServices } from "./branch.service";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await BranchServices.createBranchIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.getAllBranchesFromDB(
    req.query.status as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branches retrieved successfully",
    data: result,
  });
});

const getSingleBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.getSingleBranchFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch retrieved successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await BranchServices.updateBranchIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch updated successfully",
    data: result,
  });
});

const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.deleteBranchFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch deleted successfully",
    data: result,
  });
});

export const BranchControllers = {
  createBranch,
  getAllBranches,
  getSingleBranch,
  updateBranch,
  deleteBranch,
};

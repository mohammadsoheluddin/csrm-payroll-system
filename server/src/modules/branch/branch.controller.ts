import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BranchServices } from "./branch.service";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.createBranchIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.getAllBranchesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branches retrieved successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
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
  updateBranch,
  deleteBranch,
};

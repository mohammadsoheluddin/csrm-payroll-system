import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SalaryStructureServices } from "./salaryStructure.service";

const createSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await SalaryStructureServices.createSalaryStructureIntoDB(
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Salary structure created successfully",
      data: result,
    });
  },
);

const getAllSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SalaryStructureServices.getAllSalaryStructureFromDB(
      req.query as Record<string, unknown>,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary structure records retrieved successfully",
      data: result,
    });
  },
);

const getSingleSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SalaryStructureServices.getSingleSalaryStructureFromDB(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary structure record retrieved successfully",
      data: result,
    });
  },
);

const updateSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await SalaryStructureServices.updateSalaryStructureIntoDB(
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary structure updated successfully",
      data: result,
    });
  },
);

const deleteSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SalaryStructureServices.deleteSalaryStructureFromDB(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary structure deleted successfully",
      data: result,
    });
  },
);

export const SalaryStructureControllers = {
  createSalaryStructure,
  getAllSalaryStructure,
  getSingleSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
};

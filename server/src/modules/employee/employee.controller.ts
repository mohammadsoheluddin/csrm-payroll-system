import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EmployeeServices } from "./employee.service";

const createEmployee = catchAsync(async (req: Request, res: Response) => {
  /**
   * Kept:
   * Extra safeguard even though route-level Zod validation now checks request body.
   */
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await EmployeeServices.createEmployeeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Employee created successfully",
    data: result,
  });
});

const getAllEmployees = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployeeServices.getAllEmployeesFromDB(
    req.query.status as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employees retrieved successfully",
    data: result,
  });
});

const getSingleEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployeeServices.getSingleEmployeeFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee retrieved successfully",
    data: result,
  });
});

const updateEmployee = catchAsync(async (req: Request, res: Response) => {
  /**
   * Kept:
   * Extra safeguard even though update validation already blocks empty body.
   */
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await EmployeeServices.updateEmployeeIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee updated successfully",
    data: result,
  });
});

const deleteEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployeeServices.deleteEmployeeFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee deleted successfully",
    data: result,
  });
});

export const EmployeeControllers = {
  createEmployee,
  getAllEmployees,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee,
};

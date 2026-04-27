import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { EmployeeServices } from "./employee.service";

const createEmployee = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await EmployeeServices.createEmployeeIntoDB(req.body);

  // Added: Audit log for employee creation
  await createAuditLogFromRequest(req, {
    module: "employee",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["employeeId", "name", "email"]),
    description: "Employee created",
    previousData: null,
    newData: toAuditData(result),
  });

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
  const employeeId = req.params.id as string;

  const result = await EmployeeServices.getSingleEmployeeFromDB(employeeId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee retrieved successfully",
    data: result,
  });
});

const updateEmployee = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousEmployee =
    await EmployeeServices.getSingleEmployeeFromDB(employeeId);

  const result = await EmployeeServices.updateEmployeeIntoDB(
    employeeId,
    req.body,
  );

  // Added: Audit log for employee update
  await createAuditLogFromRequest(req, {
    module: "employee",
    action: "update",
    entityId: getAuditEntityId(result, employeeId),
    entityName: getAuditEntityName(result, ["employeeId", "name", "email"]),
    description: "Employee updated",
    previousData: toAuditData(previousEmployee),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee updated successfully",
    data: result,
  });
});

const deleteEmployee = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.params.id as string;

  const previousEmployee =
    await EmployeeServices.getSingleEmployeeFromDB(employeeId);

  const result = await EmployeeServices.deleteEmployeeFromDB(employeeId);

  // Added: Audit log for employee soft delete
  await createAuditLogFromRequest(req, {
    module: "employee",
    action: "soft_delete",
    entityId: getAuditEntityId(result, employeeId),
    entityName: getAuditEntityName(result, ["employeeId", "name", "email"]),
    description: "Employee soft deleted",
    previousData: toAuditData(previousEmployee),
    newData: toAuditData(result),
  });

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

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
import { DepartmentServices } from "./department.service";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await DepartmentServices.createDepartmentIntoDB(req.body);

  // Added: Audit log for department creation
  await createAuditLogFromRequest(req, {
    module: "department",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Department created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Department created successfully",
    data: result,
  });
});

const getAllDepartments = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentServices.getAllDepartmentsFromDB(
    req.query.status as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Departments retrieved successfully",
    data: result,
  });
});

const getSingleDepartment = catchAsync(async (req: Request, res: Response) => {
  const departmentId = req.params.id as string;

  const result =
    await DepartmentServices.getSingleDepartmentFromDB(departmentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department retrieved successfully",
    data: result,
  });
});

const updateDepartment = catchAsync(async (req: Request, res: Response) => {
  const departmentId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousDepartment =
    await DepartmentServices.getSingleDepartmentFromDB(departmentId);

  const result = await DepartmentServices.updateDepartmentIntoDB(
    departmentId,
    req.body,
  );

  // Added: Audit log for department update
  await createAuditLogFromRequest(req, {
    module: "department",
    action: "update",
    entityId: getAuditEntityId(result, departmentId),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Department updated",
    previousData: toAuditData(previousDepartment),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department updated successfully",
    data: result,
  });
});

const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
  const departmentId = req.params.id as string;

  const previousDepartment =
    await DepartmentServices.getSingleDepartmentFromDB(departmentId);

  const result = await DepartmentServices.deleteDepartmentFromDB(departmentId);

  // Added: Audit log for department soft delete
  await createAuditLogFromRequest(req, {
    module: "department",
    action: "soft_delete",
    entityId: getAuditEntityId(result, departmentId),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Department soft deleted",
    previousData: toAuditData(previousDepartment),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department deleted successfully",
    data: result,
  });
});

export const DepartmentControllers = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};

import type { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { MajorDepartmentServices } from "./majorDepartment.service";

const createMajorDepartment = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await MajorDepartmentServices.createMajorDepartmentIntoDB(
      req.body,
    );

    await createAuditLogFromRequest(req, {
      module: "major_department",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
      description: "Major department created",
      previousData: null,
      newData: toAuditData(result),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Major department created successfully",
      data: result,
    });
  },
);

const getAllMajorDepartments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MajorDepartmentServices.getAllMajorDepartmentsFromDB(
      req.query as unknown as Record<string, unknown>,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Major departments retrieved successfully",
      data: result,
    });
  },
);

const getSingleMajorDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const majorDepartmentId = req.params.id as string;

    const result =
      await MajorDepartmentServices.getSingleMajorDepartmentFromDB(
        majorDepartmentId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Major department retrieved successfully",
      data: result,
    });
  },
);

const updateMajorDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const majorDepartmentId = req.params.id as string;

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const previousMajorDepartment =
      await MajorDepartmentServices.getSingleMajorDepartmentFromDB(
        majorDepartmentId,
      );

    const result = await MajorDepartmentServices.updateMajorDepartmentIntoDB(
      majorDepartmentId,
      req.body,
    );

    await createAuditLogFromRequest(req, {
      module: "major_department",
      action: "update",
      entityId: getAuditEntityId(result, majorDepartmentId),
      entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
      description: "Major department updated",
      previousData: toAuditData(previousMajorDepartment),
      newData: toAuditData(result),
      metadata: {
        changedFields: Object.keys(req.body),
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Major department updated successfully",
      data: result,
    });
  },
);

const deleteMajorDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const majorDepartmentId = req.params.id as string;

    const previousMajorDepartment =
      await MajorDepartmentServices.getSingleMajorDepartmentFromDB(
        majorDepartmentId,
      );

    const result =
      await MajorDepartmentServices.deleteMajorDepartmentFromDB(
        majorDepartmentId,
      );

    await createAuditLogFromRequest(req, {
      module: "major_department",
      action: "soft_delete",
      entityId: getAuditEntityId(result, majorDepartmentId),
      entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
      description: "Major department soft deleted",
      previousData: toAuditData(previousMajorDepartment),
      newData: toAuditData(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Major department deleted successfully",
      data: result,
    });
  },
);

export const MajorDepartmentControllers = {
  createMajorDepartment,
  getAllMajorDepartments,
  getSingleMajorDepartment,
  updateMajorDepartment,
  deleteMajorDepartment,
};

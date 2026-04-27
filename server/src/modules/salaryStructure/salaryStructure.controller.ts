import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { SalaryStructureServices } from "./salaryStructure.service";

const createSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await SalaryStructureServices.createSalaryStructureIntoDB(
      req.body,
    );

    // Added: Audit log for salary structure creation
    await createAuditLogFromRequest(req, {
      module: "salary_structure",
      action: "create",
      entityId: getAuditEntityId(result),
      description: "Salary structure created",
      previousData: null,
      newData: toAuditData(result),
    });

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
    const salaryStructureId = req.params.id as string;

    const result =
      await SalaryStructureServices.getSingleSalaryStructureFromDB(
        salaryStructureId,
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
    const salaryStructureId = req.params.id as string;

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const previousSalaryStructure =
      await SalaryStructureServices.getSingleSalaryStructureFromDB(
        salaryStructureId,
      );

    const result = await SalaryStructureServices.updateSalaryStructureIntoDB(
      salaryStructureId,
      req.body,
    );

    // Added: Audit log for salary structure update
    await createAuditLogFromRequest(req, {
      module: "salary_structure",
      action: "update",
      entityId: getAuditEntityId(result, salaryStructureId),
      description: "Salary structure updated",
      previousData: toAuditData(previousSalaryStructure),
      newData: toAuditData(result),
      metadata: {
        changedFields: Object.keys(req.body),
      },
    });

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
    const salaryStructureId = req.params.id as string;

    const previousSalaryStructure =
      await SalaryStructureServices.getSingleSalaryStructureFromDB(
        salaryStructureId,
      );

    const result =
      await SalaryStructureServices.deleteSalaryStructureFromDB(
        salaryStructureId,
      );

    // Added: Audit log for salary structure soft delete
    await createAuditLogFromRequest(req, {
      module: "salary_structure",
      action: "soft_delete",
      entityId: getAuditEntityId(result, salaryStructureId),
      description: "Salary structure soft deleted",
      previousData: toAuditData(previousSalaryStructure),
      newData: toAuditData(result),
    });

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

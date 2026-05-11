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

const getSoftDeleteUserIdFromRequest = (req: Request) => {
  const requestUser = (req as Request & {
    user?: {
      userId?: string;
      _id?: string;
      id?: string;
    };
  }).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

const createSalaryStructure = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await SalaryStructureServices.createSalaryStructureIntoDB(
      req.body,
    );

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

const getSalaryStructureHistory = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.params.employeeId as string;

    const result =
      await SalaryStructureServices.getSalaryStructureHistoryFromDB(employeeId);

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Salary structure history retrieved successfully",

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
        {
          userId: getSoftDeleteUserIdFromRequest(req),
          deleteReason: req.body?.deleteReason,
        },
      );

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


const getDeletedSalaryStructures = catchAsync(async (req: Request, res: Response) => {
  const result = await SalaryStructureServices.getDeletedSalaryStructuresFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted Salary Structure records retrieved successfully",
    data: result,
  });
});

const restoreSalaryStructure = catchAsync(async (req: Request, res: Response) => {
  const result = await SalaryStructureServices.restoreSalaryStructureIntoDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    restoreReason: req.body?.restoreReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Structure restored successfully",
    data: result,
  });
});

export const SalaryStructureControllers = {
  createSalaryStructure,

  getAllSalaryStructure,

  getSingleSalaryStructure,

  getSalaryStructureHistory,

  updateSalaryStructure,

  deleteSalaryStructure,

  getDeletedSalaryStructures,
  restoreSalaryStructure,
};

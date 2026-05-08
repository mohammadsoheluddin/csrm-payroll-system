import type { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";

import sendResponse from "../../utils/sendResponse";

import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";

import { generateEmployeeMovementPDF } from "./employeeMovement.pdf";

import { EmployeeMovementService } from "./employeeMovement.service";

const getUserIdFromRequest = (req: Request) => {
  const requestUser = (
    req as Request & {
      user?: {
        userId?: string;
        _id?: string;
        id?: string;
      };
    }
  ).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

const createEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await EmployeeMovementService.createEmployeeMovementIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "employee",

      action: "create",

      entityName: result?.movementType || "employee_movement",

      description: "Employee movement created",

      previousData: null,

      newData: {
        movementId: result?._id?.toString?.(),

        movementType: result?.movementType,

        employee: result?.employee?.toString?.(),

        effectiveDate: result?.effectiveDate,

        status: result?.status,
      },

      metadata: {
        movementType: result?.movementType,

        status: result?.status,
      },
    });

    sendResponse(res, {
      statusCode: 201,

      success: true,

      message: "Employee movement created successfully",

      data: result,
    });
  },
);

const approveEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const movementId = req.params.id as string;

    const result = await EmployeeMovementService.approveEmployeeMovementIntoDB(
      movementId,
      userId,
    );

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Employee movement approved successfully",

      data: result,
    });
  },
);

const applyEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const movementId = req.params.id as string;

    const result = await EmployeeMovementService.applyEmployeeMovementIntoDB(
      movementId,
      userId,
    );

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Employee movement applied successfully",

      data: result,
    });
  },
);

const getEmployeeMovementTimeline = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.params.employeeId as string;

    const result =
      await EmployeeMovementService.getEmployeeMovementTimelineFromDB(
        employeeId,
      );

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Employee movement timeline retrieved successfully",

      data: result,
    });
  },
);

const downloadEmployeeMovementPDF = catchAsync(
  async (req: Request, res: Response) => {
    const movementId = req.params.id as string;

    const movement =
      await EmployeeMovementService.getSingleEmployeeMovementFromDB(movementId);

    await generateEmployeeMovementPDF({
      movement,
      res,
    });
  },
);

const getAllEmployeeMovements = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeMovementService.getAllEmployeeMovementsFromDB();

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Employee movements retrieved successfully",

      data: result,
    });
  },
);

const getSingleEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const movementId = req.params.id as string;

    const result =
      await EmployeeMovementService.getSingleEmployeeMovementFromDB(movementId);

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Employee movement retrieved successfully",

      data: result,
    });
  },
);

export const EmployeeMovementController = {
  createEmployeeMovement,

  approveEmployeeMovement,

  applyEmployeeMovement,

  getEmployeeMovementTimeline,

  downloadEmployeeMovementPDF,

  getAllEmployeeMovements,

  getSingleEmployeeMovement,
};

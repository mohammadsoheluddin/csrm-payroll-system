import type { Request, Response } from "express";

import { getRequestUserId } from "../../common/softDelete";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { generateEmployeeMovementPDF } from "./employeeMovement.pdf";
import { EmployeeMovementService } from "./employeeMovement.service";

const getUserIdFromRequest = (req: Request) => getRequestUserId(req) || "";

const createEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await EmployeeMovementService.createEmployeeMovementIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_movement",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: result?.movementType || "employee_movement",
      description: "Employee movement created",
      previousData: null,
      newData: toAuditData(result),
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

    await createAuditLogFromRequest(req, {
      module: "employee_movement",
      action: "approved",
      entityId: getAuditEntityId(result, movementId),
      entityName: result?.movementType || "employee_movement",
      description: "Employee movement approved",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        status: result?.status,
      },
    });

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

    await createAuditLogFromRequest(req, {
      module: "employee_movement",
      action: "applied",
      entityId: getAuditEntityId(result, movementId),
      entityName: result?.movementType || "employee_movement",
      description: "Employee movement applied",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        status: result?.status,
        effectiveDate: result?.effectiveDate,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee movement applied successfully",
      data: result,
    });
  },
);

const getEmployeeMovementPayrollImpactPreview = catchAsync(
  async (req: Request, res: Response) => {
    const movementId = req.params.id as string;

    const result =
      await EmployeeMovementService.getEmployeeMovementPayrollImpactPreviewFromDB(
        movementId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee movement payroll impact preview retrieved successfully",
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
      await EmployeeMovementService.getAllEmployeeMovementsFromDB(
        req.query as unknown as Record<string, string>,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee movements retrieved successfully",
      data: result,
    });
  },
);

const getDeletedEmployeeMovements = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeMovementService.getDeletedEmployeeMovementsFromDB(
        req.query as unknown as Record<string, string>,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deleted employee movements retrieved successfully",
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

const deleteEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const movementId = req.params.id as string;

    const previousMovement =
      await EmployeeMovementService.getSingleEmployeeMovementFromDB(movementId);

    const result = await EmployeeMovementService.deleteEmployeeMovementFromDB(
      movementId,
      {
        userId: getUserIdFromRequest(req),
        deleteReason: req.body?.deleteReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_movement",
      action: "soft_delete",
      entityId: getAuditEntityId(result, movementId),
      entityName: result?.movementType || "employee_movement",
      description: "Employee movement soft deleted",
      previousData: toAuditData(previousMovement),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
        status: result?.status,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee movement deleted successfully",
      data: result,
    });
  },
);

const restoreEmployeeMovement = catchAsync(
  async (req: Request, res: Response) => {
    const movementId = req.params.id as string;

    const previousMovement =
      await EmployeeMovementService.getSingleDeletedEmployeeMovementFromDB(
        movementId,
      );

    const result = await EmployeeMovementService.restoreEmployeeMovementFromDB(
      movementId,
      {
        userId: getUserIdFromRequest(req),
        restoreReason: req.body?.restoreReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_movement",
      action: "restore",
      entityId: getAuditEntityId(result, movementId),
      entityName: result?.movementType || "employee_movement",
      description: "Employee movement restored",
      previousData: toAuditData(previousMovement),
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
        status: result?.status,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee movement restored successfully",
      data: result,
    });
  },
);

export const EmployeeMovementController = {
  createEmployeeMovement,
  approveEmployeeMovement,
  applyEmployeeMovement,
  getEmployeeMovementPayrollImpactPreview,
  getEmployeeMovementTimeline,
  downloadEmployeeMovementPDF,
  getAllEmployeeMovements,
  getDeletedEmployeeMovements,
  getSingleEmployeeMovement,
  deleteEmployeeMovement,
  restoreEmployeeMovement,
};

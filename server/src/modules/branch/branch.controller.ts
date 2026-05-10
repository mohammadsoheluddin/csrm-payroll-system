import { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { BranchServices } from "./branch.service";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await BranchServices.createBranchIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "branch",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Branch created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.getAllBranchesFromDB(
    req.query.status as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branches retrieved successfully",
    data: result,
  });
});

const getDeletedBranches = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchServices.getDeletedBranchesFromDB(
    req.query.status as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted branches retrieved successfully",
    data: result,
  });
});

const getSingleBranch = catchAsync(async (req: Request, res: Response) => {
  const branchId = req.params.id as string;

  const result = await BranchServices.getSingleBranchFromDB(branchId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch retrieved successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const branchId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousBranch = await BranchServices.getSingleBranchFromDB(branchId);

  const result = await BranchServices.updateBranchIntoDB(branchId, req.body);

  await createAuditLogFromRequest(req, {
    module: "branch",
    action: "update",
    entityId: getAuditEntityId(result, branchId),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Branch updated",
    previousData: toAuditData(previousBranch),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch updated successfully",
    data: result,
  });
});

const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const branchId = req.params.id as string;

  const previousBranch = await BranchServices.getSingleBranchFromDB(branchId);

  const result = await BranchServices.deleteBranchFromDB(branchId, {
    userId: getRequestUserId(req),
    deleteReason: req.body?.deleteReason,
  });

  await createAuditLogFromRequest(req, {
    module: "branch",
    action: "soft_delete",
    entityId: getAuditEntityId(result, branchId),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Branch soft deleted",
    previousData: toAuditData(previousBranch),
    newData: toAuditData(result),
    metadata: {
      deleteReason: req.body?.deleteReason || null,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch deleted successfully",
    data: result,
  });
});

const restoreBranch = catchAsync(async (req: Request, res: Response) => {
  const branchId = req.params.id as string;

  const previousBranch = await BranchServices.getSingleDeletedBranchFromDB(
    branchId,
  );

  const result = await BranchServices.restoreBranchIntoDB(branchId, {
    userId: getRequestUserId(req),
    restoreReason: req.body?.restoreReason,
  });

  await createAuditLogFromRequest(req, {
    module: "branch",
    action: "restore",
    entityId: getAuditEntityId(result, branchId),
    entityName: getAuditEntityName(result, ["name", "code"]),
    description: "Branch restored",
    previousData: toAuditData(previousBranch),
    newData: toAuditData(result),
    metadata: {
      restoreReason: req.body?.restoreReason || null,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch restored successfully",
    data: result,
  });
});

export const BranchControllers = {
  createBranch,
  getAllBranches,
  getDeletedBranches,
  getSingleBranch,
  updateBranch,
  deleteBranch,
  restoreBranch,
};

import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RbacAuditServices } from "./rbacAudit.service";

const getRbacAuditSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = RbacAuditServices.getSummaryFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC audit summary retrieved successfully",
    data: result,
  });
});

const getRbacModuleCatalog = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getModuleCatalogFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC module catalog retrieved successfully",
    data: result,
  });
});

const getRbacPermissions = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getPermissionsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC permissions retrieved successfully",
    data: result,
  });
});

const getRbacRoles = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getRolesFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC role summaries retrieved successfully",
    data: result,
  });
});

const getRbacMatrix = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getMatrixFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC permission coverage matrix retrieved successfully",
    data: result,
  });
});

const getRbacCoverage = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getCoverageFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC coverage audit retrieved successfully",
    data: result,
  });
});

const getRbacRouteCoverage = catchAsync(async (req: Request, res: Response) => {
  const result = RbacAuditServices.getRouteCoverageFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "RBAC route coverage retrieved successfully",
    data: result,
  });
});

export const RbacAuditControllers = {
  getRbacAuditSummary,
  getRbacModuleCatalog,
  getRbacPermissions,
  getRbacRoles,
  getRbacMatrix,
  getRbacCoverage,
  getRbacRouteCoverage,
};

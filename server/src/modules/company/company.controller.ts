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
import { CompanyServices } from "./company.service";

const createCompany = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await CompanyServices.createCompanyIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "company",
    action: "create",
    entityId: getAuditEntityId(result),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Company/Concern created",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Company created successfully",
    data: result,
  });
});

const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyServices.getAllCompaniesFromDB(
    req.query as unknown as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Companies retrieved successfully",
    data: result,
  });
});

const getSingleCompany = catchAsync(async (req: Request, res: Response) => {
  const companyId = req.params.id as string;

  const result = await CompanyServices.getSingleCompanyFromDB(companyId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company retrieved successfully",
    data: result,
  });
});

const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const companyId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousCompany =
    await CompanyServices.getSingleCompanyFromDB(companyId);

  const result = await CompanyServices.updateCompanyIntoDB(companyId, req.body);

  await createAuditLogFromRequest(req, {
    module: "company",
    action: "update",
    entityId: getAuditEntityId(result, companyId),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Company/Concern updated",
    previousData: toAuditData(previousCompany),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company updated successfully",
    data: result,
  });
});

const deleteCompany = catchAsync(async (req: Request, res: Response) => {
  const companyId = req.params.id as string;

  const previousCompany =
    await CompanyServices.getSingleCompanyFromDB(companyId);

  const result = await CompanyServices.deleteCompanyFromDB(companyId);

  await createAuditLogFromRequest(req, {
    module: "company",
    action: "soft_delete",
    entityId: getAuditEntityId(result, companyId),
    entityName: getAuditEntityName(result, ["name", "code", "shortName"]),
    description: "Company/Concern soft deleted",
    previousData: toAuditData(previousCompany),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company deleted successfully",
    data: result,
  });
});

export const CompanyControllers = {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
};

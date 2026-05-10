import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { EmployeeBulkImportServices } from "./employeeBulkImport.service";

const getParamId = (req: Request, paramName: string) => {
  const value = req.params[paramName];

  return Array.isArray(value) ? value[0] : value;
};

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

const previewEmployeeBulkImport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.previewEmployeeBulkImportFromPayload(
      req.body,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "read",
      entityName: req.body?.sourceFileName || req.body?.source,
      description: "Employee bulk import preview generated",
      previousData: null,
      newData: null,
      metadata: {
        source: req.body?.source,
        totalRows: result.totalRows,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
        duplicateRows: result.duplicateRows,
        existingEmployeeBlockers: result.existingEmployeeBlockers,
        referenceBlockers: result.referenceBlockers,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import preview generated successfully",
      data: result,
    });
  },
);

const commitEmployeeBulkImport = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await EmployeeBulkImportServices.commitEmployeeBulkImportIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "process",
      entityId: getAuditEntityId(result),
      entityName: result?.batchNo,
      description: "Employee bulk import committed",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        source: result?.source,
        status: result?.status,
        totalRows: result?.totalRows,
        validRows: result?.validRows,
        invalidRows: result?.invalidRows,
        createdEmployeeCount: result?.createdEmployeeCount,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Employee bulk import committed successfully",
      data: result,
    });
  },
);

const getAllEmployeeBulkImports = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.getAllEmployeeBulkImportsFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import batches retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getSingleEmployeeBulkImport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.getSingleEmployeeBulkImportFromDB(
      getParamId(req, "id"),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import batch retrieved successfully",
      data: result,
    });
  },
);

export const EmployeeBulkImportControllers = {
  previewEmployeeBulkImport,
  commitEmployeeBulkImport,
  getAllEmployeeBulkImports,
  getSingleEmployeeBulkImport,
};

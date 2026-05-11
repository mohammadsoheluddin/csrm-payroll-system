import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
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


const getEmployeeBulkImportTemplatePreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = EmployeeBulkImportServices.buildEmployeeBulkImportTemplatePreview(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "read",
      entityName: result.template.source,
      description: "Employee bulk import template preview generated",
      previousData: null,
      newData: null,
      metadata: {
        template: result.template,
        columns: result.columns.map((column) => column.header),
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import template preview generated successfully",
      data: result,
    });
  },
);

const exportEmployeeBulkImportTemplateCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result = EmployeeBulkImportServices.exportEmployeeBulkImportTemplateCsv(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "export",
      entityName: result.fileName,
      description: "Employee bulk import CSV template exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        template: (result.reportData as any).template,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportEmployeeBulkImportTemplateExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.exportEmployeeBulkImportTemplateExcel(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "export",
      entityName: result.fileName,
      description: "Employee bulk import Excel template exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        template: (result.reportData as any).template,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const getEmployeeBulkImportRejectionReportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.buildEmployeeBulkImportRejectionReportFromDB(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "read",
      entityId: result.batch.id,
      entityName: result.batch.batchNo,
      description: "Employee bulk import rejection report preview generated",
      previousData: null,
      newData: null,
      metadata: {
        summary: result.summary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import rejection report preview generated successfully",
      data: result,
    });
  },
);

const exportEmployeeBulkImportRejectionsCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.exportEmployeeBulkImportRejectionsCsv(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "export",
      entityId: (result.reportData as any).batch.id,
      entityName: (result.reportData as any).batch.batchNo,
      description: "Employee bulk import rejection CSV exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        summary: (result.reportData as any).summary,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportEmployeeBulkImportRejectionsExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.exportEmployeeBulkImportRejectionsExcel(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "export",
      entityId: (result.reportData as any).batch.id,
      entityName: (result.reportData as any).batch.batchNo,
      description: "Employee bulk import rejection Excel exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        summary: (result.reportData as any).summary,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);


const getEmployeeBulkImportRevertPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.buildEmployeeBulkImportRevertPreviewFromDB(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "read",
      entityId: result.batch.id,
      entityName: result.batch.batchNo,
      description: "Employee bulk import revert preview generated",
      previousData: null,
      newData: null,
      metadata: {
        canRevert: result.canRevert,
        summary: result.summary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import revert preview generated successfully",
      data: result,
    });
  },
);

const revertEmployeeBulkImportBatch = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const result = await EmployeeBulkImportServices.revertEmployeeBulkImportBatchIntoDB(
      getParamId(req, "id"),
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "soft_delete",
      entityId: getAuditEntityId(result),
      entityName: result?.batchNo,
      description: "Employee bulk import batch reverted",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        status: result?.status,
        rollbackSummary: result?.rollbackSummary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import batch reverted successfully",
      data: result,
    });
  },
);


const getDeletedEmployeeBulkImports = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBulkImportServices.getDeletedEmployeeBulkImportsFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deleted employee bulk import batches retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const deleteEmployeeBulkImport = catchAsync(
  async (req: Request, res: Response) => {
    const batchId = getParamId(req, "id");

    const previousBatch = await EmployeeBulkImportServices.getSingleEmployeeBulkImportFromDB(
      batchId,
    );

    const result = await EmployeeBulkImportServices.deleteEmployeeBulkImportFromDB(
      batchId,
      {
        userId: getRequestUserId(req),
        deleteReason: req.body?.deleteReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "soft_delete",
      entityId: getAuditEntityId(result, batchId),
      entityName: result?.batchNo,
      description: "Employee bulk import batch soft deleted",
      previousData: toAuditData(previousBatch),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
        status: result?.status,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import batch deleted successfully",
      data: result,
    });
  },
);

const restoreEmployeeBulkImport = catchAsync(
  async (req: Request, res: Response) => {
    const batchId = getParamId(req, "id");

    const previousBatch =
      await EmployeeBulkImportServices.getSingleDeletedEmployeeBulkImportFromDB(
        batchId,
      );

    const result = await EmployeeBulkImportServices.restoreEmployeeBulkImportFromDB(
      batchId,
      {
        userId: getRequestUserId(req),
        restoreReason: req.body?.restoreReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bulk_import",
      action: "restore",
      entityId: getAuditEntityId(result, batchId),
      entityName: result?.batchNo,
      description: "Employee bulk import batch restored",
      previousData: toAuditData(previousBatch),
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
        status: result?.status,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bulk import batch restored successfully",
      data: result,
    });
  },
);

export const EmployeeBulkImportControllers = {
  previewEmployeeBulkImport,
  commitEmployeeBulkImport,
  getAllEmployeeBulkImports,
  getDeletedEmployeeBulkImports,
  getSingleEmployeeBulkImport,
  deleteEmployeeBulkImport,
  restoreEmployeeBulkImport,
  getEmployeeBulkImportTemplatePreview,
  exportEmployeeBulkImportTemplateCsv,
  exportEmployeeBulkImportTemplateExcel,
  getEmployeeBulkImportRejectionReportPreview,
  exportEmployeeBulkImportRejectionsCsv,
  exportEmployeeBulkImportRejectionsExcel,
  getEmployeeBulkImportRevertPreview,
  revertEmployeeBulkImportBatch,
};

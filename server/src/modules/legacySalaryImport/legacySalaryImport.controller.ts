import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import {
  generateLegacySalaryArchiveCsv,
  generateLegacySalaryArchiveExcel,
  generateLegacySalaryImportTemplateCsv,
  generateLegacySalaryImportTemplateExcel,
} from "./legacySalaryImport.export";
import { LegacySalaryImportServices } from "./legacySalaryImport.service";

const getParamId = (req: Request, paramName: string) => {
  const value = req.params[paramName];
  return Array.isArray(value) ? value[0] : value;
};

const sendFileResponse = (res: Response, file: { buffer: Buffer; fileName: string; contentType: string }) => {
  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", `attachment; filename=\"${file.fileName}\"`);
  res.send(file.buffer);
};

const parseExcel = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.parseLegacySalaryExcelBase64(req.body);

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "process",
    category: "data_access",
    riskLevel: "medium",
    entityName: req.body?.fileName,
    description: "Legacy salary Excel file parsed for preview mapping",
    previousData: null,
    newData: null,
    metadata: {
      fileName: result.fileName,
      sheetName: result.sheetName,
      totalRows: result.totalRows,
      headers: result.headers,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary Excel parsed successfully",
    data: result,
  });
});

const previewLegacySalaryImport = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.previewLegacySalaryImportFromPayload(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary import preview generated successfully",
    data: result,
  });
});

const commitLegacySalaryImport = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.commitLegacySalaryImportIntoDB(
    req.body,
    getRequestUserId(req),
  );

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "process",
    category: "payroll_process",
    riskLevel: "high",
    entityId: getAuditEntityId(result),
    entityName: result?.batchNo,
    description: "Legacy salary sheet archive batch committed",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      payrollMonth: result?.payrollMonth,
      source: result?.source,
      sheetType: result?.sheetType,
      totalRows: result?.totalRows,
      validRows: result?.validRows,
      invalidRows: result?.invalidRows,
      matchedRows: result?.matchedRows,
      unmatchedRows: result?.unmatchedRows,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Legacy salary sheet archive batch committed successfully",
    data: result,
  });
});

const getAllLegacySalaryImportBatches = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.getAllLegacySalaryImportBatchesFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary import batches retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDeletedLegacySalaryImportBatches = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.getDeletedLegacySalaryImportBatchesFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted legacy salary import batches retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleLegacySalaryImportBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.getSingleLegacySalaryImportBatchFromDB(
    getParamId(req, "id"),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary import batch retrieved successfully",
    data: result,
  });
});

const getLegacySalaryRecords = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.getLegacySalaryRecordsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary archive records retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getLegacySalarySummary = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.getLegacySalarySummaryFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary archive summary generated successfully",
    data: result,
  });
});

const exportLegacySalaryRecordsCsv = catchAsync(async (req: Request, res: Response) => {
  const file = await generateLegacySalaryArchiveCsv(req.query as any);

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "export",
    category: "export",
    riskLevel: "medium",
    entityName: "Legacy salary archive CSV",
    description: "Legacy salary archive CSV exported",
    metadata: { filters: req.query },
  });

  sendFileResponse(res, file);
});

const exportLegacySalaryRecordsExcel = catchAsync(async (req: Request, res: Response) => {
  const file = await generateLegacySalaryArchiveExcel(req.query as any);

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "export",
    category: "export",
    riskLevel: "medium",
    entityName: "Legacy salary archive Excel",
    description: "Legacy salary archive Excel exported",
    metadata: { filters: req.query },
  });

  sendFileResponse(res, file);
});

const exportLegacySalaryImportTemplateCsv = catchAsync(async (_req: Request, res: Response) => {
  sendFileResponse(res, generateLegacySalaryImportTemplateCsv());
});

const exportLegacySalaryImportTemplateExcel = catchAsync(async (_req: Request, res: Response) => {
  const file = await generateLegacySalaryImportTemplateExcel();
  sendFileResponse(res, file);
});

const deleteLegacySalaryImportBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.deleteLegacySalaryImportBatchFromDB(
    getParamId(req, "id"),
    req.body || {},
    getRequestUserId(req),
  );

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "soft_delete",
    category: "data_mutation",
    riskLevel: "high",
    entityId: getAuditEntityId(result),
    entityName: result?.batchNo,
    description: "Legacy salary import batch soft deleted",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary import batch deleted successfully",
    data: result,
  });
});

const restoreLegacySalaryImportBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await LegacySalaryImportServices.restoreLegacySalaryImportBatchFromDB(
    getParamId(req, "id"),
    req.body || {},
    getRequestUserId(req),
  );

  await createAuditLogFromRequest(req, {
    module: "legacy_salary_import",
    action: "restore",
    category: "data_mutation",
    riskLevel: "medium",
    entityId: getAuditEntityId(result),
    entityName: result?.batchNo,
    description: "Legacy salary import batch restored",
    previousData: null,
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Legacy salary import batch restored successfully",
    data: result,
  });
});

export const LegacySalaryImportControllers = {
  parseExcel,
  previewLegacySalaryImport,
  commitLegacySalaryImport,
  getAllLegacySalaryImportBatches,
  getDeletedLegacySalaryImportBatches,
  getSingleLegacySalaryImportBatch,
  getLegacySalaryRecords,
  getLegacySalarySummary,
  exportLegacySalaryRecordsCsv,
  exportLegacySalaryRecordsExcel,
  exportLegacySalaryImportTemplateCsv,
  exportLegacySalaryImportTemplateExcel,
  deleteLegacySalaryImportBatch,
  restoreLegacySalaryImportBatch,
};

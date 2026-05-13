import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { SalarySummaryServices } from "./salarySummary.service";

const getExportHeaders = (fileName: string, mimeType: string) => ({
  "Content-Type": mimeType,
  "Content-Disposition": `attachment; filename="${fileName}"`,
});

const getSalarySummaryPreview = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySummaryServices.buildSalarySummaryPreviewFromDB(
    req.query as any,
  );

  await createAuditLogFromRequest(req, {
    module: "salary_summary",
    action: "read",
    entityName: result.payrollMonth,
    description: "Salary Summary preview generated",
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      readiness: result.readiness,
      combinedTotals: result.combinedTotals,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Summary preview generated successfully",
    data: result,
  });
});

const createExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "salary_summary",
    action: "export",
    entityName: result.reportData.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.reportData.filters,
      readiness: result.reportData.readiness,
      combinedTotals: result.reportData.combinedTotals,
      fileName: result.fileName,
    },
  });
};

const exportSalarySummaryCsv = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySummaryServices.exportSalarySummaryCsvFromDB(
    req.query as any,
  );

  await createExportAudit({
    req,
    result,
    description: "Salary Summary CSV exported",
  });

  const headers = getExportHeaders(result.fileName, result.mimeType);
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(200).send(result.buffer);
});

const exportSalarySummaryExcel = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySummaryServices.exportSalarySummaryExcelFromDB(
    req.query as any,
  );

  await createExportAudit({
    req,
    result,
    description: "Salary Summary Excel exported",
  });

  const headers = getExportHeaders(result.fileName, result.mimeType);
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(200).send(result.buffer);
});

const exportSalarySummaryPdf = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySummaryServices.exportSalarySummaryPdfFromDB(
    req.query as any,
  );

  await createExportAudit({
    req,
    result,
    description: "Salary Summary PDF exported",
  });

  const headers = getExportHeaders(result.fileName, result.mimeType);
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(200).send(result.buffer);
});

export const SalarySummaryControllers = {
  getSalarySummaryPreview,
  exportSalarySummaryCsv,
  exportSalarySummaryExcel,
  exportSalarySummaryPdf,
};

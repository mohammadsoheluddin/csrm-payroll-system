import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import {
  TBankSheetPaymentMode,
  TBankSheetSourceType,
} from "./bankSheet.interface";
import { BankSheetServices } from "./bankSheet.service";

const getSingleQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
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

const buildBankSheetQueryFromRequest = (req: Request) => {
  const month = Number(getSingleQueryValue(req.query.month));
  const year = Number(getSingleQueryValue(req.query.year));
  const company = getSingleQueryValue(req.query.company) || "";
  const department = getSingleQueryValue(req.query.department);
  const branch = getSingleQueryValue(req.query.branch);
  const bankName = getSingleQueryValue(req.query.bankName);
  const sourceAccount = getSingleQueryValue(req.query.sourceAccount);

  const sourceType = getSingleQueryValue(req.query.sourceType) as
    | TBankSheetSourceType
    | undefined;

  const paymentMode = getSingleQueryValue(req.query.paymentMode) as
    | TBankSheetPaymentMode
    | undefined;

  return {
    sourceType,
    month,
    year,
    company,
    department,
    branch,
    bankName,
    paymentMode,
    sourceAccount,
  };
};

const generateSalaryBankSheetPreview = catchAsync(
  async (req: Request, res: Response) => {
    const query = buildBankSheetQueryFromRequest(req);
    const userId = getUserIdFromRequest(req);

    const result = await BankSheetServices.generateSalaryBankSheetPreviewFromDB(
      query,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "bank_sheet",
      action: "read",
      entityName: result.summary.payrollMonth,
      description: "Salary bank sheet preview generated",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        sourceAccount: result.sourceAccount,
        summary: result.summary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary bank sheet preview generated successfully",
      data: result,
    });
  },
);

const exportSalaryBankSheetExcel = catchAsync(
  async (req: Request, res: Response) => {
    const query = buildBankSheetQueryFromRequest(req);
    const userId = getUserIdFromRequest(req);

    const result = await BankSheetServices.exportSalaryBankSheetExcelFromDB(
      query,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "bank_sheet",
      action: "export",
      entityName: result.reportData.summary.payrollMonth,
      description: "Salary bank sheet Excel exported",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.reportData.filters,
        sourceAccount: result.reportData.sourceAccount,
        summary: result.reportData.summary,
        fileName: result.fileName,
      },
    });

    res.setHeader("Content-Type", result.mimeType);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

const exportSalaryBankSheetForwardingLetterPDF = catchAsync(
  async (req: Request, res: Response) => {
    const query = buildBankSheetQueryFromRequest(req);
    const userId = getUserIdFromRequest(req);

    const result =
      await BankSheetServices.exportSalaryBankSheetForwardingLetterPDFFromDB(
        query,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "bank_sheet",
      action: "export",
      entityName: result.reportData.summary.payrollMonth,
      description: "Salary bank sheet forwarding letter PDF exported",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.reportData.filters,
        sourceAccount: result.reportData.sourceAccount,
        summary: result.reportData.summary,
        fileName: result.fileName,
      },
    });

    res.setHeader("Content-Type", result.mimeType);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

export const BankSheetControllers = {
  generateSalaryBankSheetPreview,
  exportSalaryBankSheetExcel,
  exportSalaryBankSheetForwardingLetterPDF,
};

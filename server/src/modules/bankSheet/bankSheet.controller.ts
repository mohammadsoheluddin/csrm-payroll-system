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

const generateSalaryBankSheetPreview = catchAsync(
  async (req: Request, res: Response) => {
    const month = Number(getSingleQueryValue(req.query.month));
    const year = Number(getSingleQueryValue(req.query.year));
    const company = getSingleQueryValue(req.query.company) || "";
    const department = getSingleQueryValue(req.query.department);
    const branch = getSingleQueryValue(req.query.branch);
    const bankName = getSingleQueryValue(req.query.bankName);
    const sourceType = getSingleQueryValue(req.query.sourceType) as
      | TBankSheetSourceType
      | undefined;
    const paymentMode = getSingleQueryValue(req.query.paymentMode) as
      | TBankSheetPaymentMode
      | undefined;

    const result = await BankSheetServices.generateSalaryBankSheetPreviewFromDB(
      {
        sourceType,
        month,
        year,
        company,
        department,
        branch,
        bankName,
        paymentMode,
      },
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

export const BankSheetControllers = {
  generateSalaryBankSheetPreview,
};

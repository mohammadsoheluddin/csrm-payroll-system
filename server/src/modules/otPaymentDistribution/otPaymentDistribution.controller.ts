import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { OtPaymentDistributionServices } from "./otPaymentDistribution.service";

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

const generateMonthlyOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.generateMonthlyOtPaymentDistributionIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "process",
      entityName: result.payrollMonth,
      description:
        "Monthly OT Payment Distribution generated from locked OT Statement",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        otStatementReadiness: result.otStatementReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly OT Payment Distribution generated successfully",
      data: result,
    });
  },
);

const getAllOtPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.getAllOtPaymentDistributionsFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distributions retrieved successfully",
      data: result,
    });
  },
);

const getSingleOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.getSingleOtPaymentDistributionFromDB(
        getParamId(req, "id"),
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distribution retrieved successfully",
      data: result,
    });
  },
);

const getOtPaymentDistributionOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.getOtPaymentDistributionOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "OT Payment Distribution operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBulkOtPaymentDistributionAudit = async ({
  req,
  action,
  description,
  result,
}: {
  req: Request;
  action: "process" | "approve" | "lock" | "unlock";
  description: string;
  result: any;
}) => {
  await createAuditLogFromRequest(req, {
    module: "ot_payment_distribution",
    action,
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      totals: result.totals,
      paymentModeSummary: result.paymentModeSummary,
      otPaymentSheetReadiness: result.otPaymentSheetReadiness,
      note: req.body?.note || "",
    },
  });
};

const bulkProcessOtPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.bulkProcessOtPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkOtPaymentDistributionAudit({
      req,
      action: "process",
      description: "Bulk OT Payment Distributions processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distributions processed successfully",
      data: result,
    });
  },
);

const bulkApproveOtPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.bulkApproveOtPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkOtPaymentDistributionAudit({
      req,
      action: "approve",
      description: "Bulk OT Payment Distributions approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distributions approved successfully",
      data: result,
    });
  },
);

const bulkLockOtPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.bulkLockOtPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkOtPaymentDistributionAudit({
      req,
      action: "lock",
      description:
        "Bulk OT Payment Distributions locked for OT Bank/Cash/Mobile sheet processing",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distributions locked successfully",
      data: result,
    });
  },
);

const bulkUnlockOtPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.bulkUnlockOtPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkOtPaymentDistributionAudit({
      req,
      action: "unlock",
      description: "Bulk OT Payment Distributions unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distributions unlocked successfully",
      data: result,
    });
  },
);

const processOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.processOtPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "process",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "OT Payment Distribution processed",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
        paymentMode: result.paymentMode,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distribution processed successfully",
      data: result,
    });
  },
);

const approveOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.approveOtPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "approve",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "OT Payment Distribution approved",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
        paymentMode: result.paymentMode,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distribution approved successfully",
      data: result,
    });
  },
);

const lockOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.lockOtPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "lock",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "OT Payment Distribution locked",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
        paymentMode: result.paymentMode,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distribution locked successfully",
      data: result,
    });
  },
);

const unlockOtPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await OtPaymentDistributionServices.unlockOtPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "unlock",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "OT Payment Distribution unlocked",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
        paymentMode: result.paymentMode,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Payment Distribution unlocked successfully",
      data: result,
    });
  },
);

const getOtPaymentDistributionExportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.buildOtPaymentDistributionExportPreviewFromDB(
        req.query as any,
      );

    await createAuditLogFromRequest(req, {
      module: "ot_payment_distribution",
      action: "read",
      entityName: result.payrollMonth,
      description: "OT Bank/Cash/Mobile sheet export preview generated",
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
      message: "OT Payment Distribution export preview generated successfully",
      data: result,
    });
  },
);

const createOtPaymentDistributionExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "ot_payment_distribution",
    action: "export",
    entityName: result.reportData.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.reportData.filters,
      summary: result.reportData.summary,
      fileName: result.fileName,
    },
  });
};

const exportOtPaymentDistributionCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.exportOtPaymentDistributionCsvFromDB(
        req.query as any,
      );

    await createOtPaymentDistributionExportAudit({
      req,
      result,
      description: "OT Bank/Cash/Mobile sheet CSV exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

const exportOtPaymentDistributionExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.exportOtPaymentDistributionExcelFromDB(
        req.query as any,
      );

    await createOtPaymentDistributionExportAudit({
      req,
      result,
      description: "OT Bank/Cash/Mobile sheet Excel exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

const exportOtPaymentDistributionPdf = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtPaymentDistributionServices.exportOtPaymentDistributionPdfFromDB(
        req.query as any,
      );

    await createOtPaymentDistributionExportAudit({
      req,
      result,
      description: "OT Bank/Cash/Mobile sheet PDF exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

export const OtPaymentDistributionControllers = {
  generateMonthlyOtPaymentDistribution,
  getAllOtPaymentDistributions,
  getSingleOtPaymentDistribution,
  getOtPaymentDistributionOperationalSummary,
  processOtPaymentDistribution,
  approveOtPaymentDistribution,
  lockOtPaymentDistribution,
  unlockOtPaymentDistribution,
  bulkProcessOtPaymentDistributions,
  bulkApproveOtPaymentDistributions,
  bulkLockOtPaymentDistributions,
  bulkUnlockOtPaymentDistributions,
  getOtPaymentDistributionExportPreview,
  exportOtPaymentDistributionCsv,
  exportOtPaymentDistributionExcel,
  exportOtPaymentDistributionPdf,
};

import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { BonusPaymentDistributionServices } from "./bonusPaymentDistribution.service";

const getSoftDeleteUserIdFromRequest = (req: Request) => {
  const requestUser = (req as Request & {
    user?: {
      userId?: string;
      _id?: string;
      id?: string;
    };
  }).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

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

const generateMonthlyBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.generateMonthlyBonusPaymentDistributionIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "bonus_payment_distribution",
      action: "process",
      entityName: result.bonusMonth,
      description: "Monthly Bonus Payment Distribution generated from locked Bonus Statement",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        sourceReadiness: result.sourceReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Bonus Payment Distribution generated successfully",
      data: result,
    });
  },
);

const getAllBonusPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.getAllBonusPaymentDistributionsFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distributions retrieved successfully",
      data: result,
    });
  },
);

const getSingleBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.getSingleBonusPaymentDistributionFromDB(
        getParamId(req, "id"),
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distribution retrieved successfully",
      data: result,
    });
  },
);

const getBonusPaymentDistributionOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.getBonusPaymentDistributionOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Bonus Payment Distribution operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBonusPaymentDistributionBulkAudit = async ({
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
    module: "bonus_payment_distribution",
    action,
    entityName: result.bonusMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      bonusPaymentReadiness: result.bonusPaymentReadiness,
    },
  });
};

const bulkProcessBonusPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.bulkProcessBonusPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBonusPaymentDistributionBulkAudit({
      req,
      action: "process",
      description: "Bonus Payment Distributions bulk processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distributions bulk processed successfully",
      data: result,
    });
  },
);

const bulkApproveBonusPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.bulkApproveBonusPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBonusPaymentDistributionBulkAudit({
      req,
      action: "approve",
      description: "Bonus Payment Distributions bulk approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distributions bulk approved successfully",
      data: result,
    });
  },
);

const bulkLockBonusPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.bulkLockBonusPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBonusPaymentDistributionBulkAudit({
      req,
      action: "lock",
      description: "Bonus Payment Distributions bulk locked for Bonus Bank/Cash/Mobile sheets",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distributions bulk locked successfully",
      data: result,
    });
  },
);

const bulkUnlockBonusPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.bulkUnlockBonusPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBonusPaymentDistributionBulkAudit({
      req,
      action: "unlock",
      description: "Bonus Payment Distributions bulk unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distributions bulk unlocked successfully",
      data: result,
    });
  },
);

const createBonusPaymentDistributionAudit = async ({
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
    module: "bonus_payment_distribution",
    action,
    entityId: getParamId(req, "id"),
    entityName: `${result.bonusName} ${result.bonusMonth}`,
    description,
    previousData: null,
    newData: null,
    metadata: {
      status: result.status,
      isLocked: result.isLocked,
      paymentMode: result.paymentMode,
      payableBonusAmount: result.payableBonusAmount,
      bankAmount: result.bankAmount,
      cashAmount: result.cashAmount,
      mobileBankingAmount: result.mobileBankingAmount,
    },
  });
};

const processBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.processBonusPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createBonusPaymentDistributionAudit({
      req,
      action: "process",
      description: "Bonus Payment Distribution processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distribution processed successfully",
      data: result,
    });
  },
);

const approveBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.approveBonusPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createBonusPaymentDistributionAudit({
      req,
      action: "approve",
      description: "Bonus Payment Distribution approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distribution approved successfully",
      data: result,
    });
  },
);

const lockBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.lockBonusPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createBonusPaymentDistributionAudit({
      req,
      action: "lock",
      description: "Bonus Payment Distribution locked for Bonus Bank/Cash/Mobile sheets",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distribution locked successfully",
      data: result,
    });
  },
);

const unlockBonusPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await BonusPaymentDistributionServices.unlockBonusPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createBonusPaymentDistributionAudit({
      req,
      action: "unlock",
      description: "Bonus Payment Distribution unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Payment Distribution unlocked successfully",
      data: result,
    });
  },
);

const getBonusPaymentDistributionExportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.buildBonusPaymentDistributionExportPreviewFromDB(
        req.query as any,
      );

    await createAuditLogFromRequest(req, {
      module: "bonus_payment_distribution",
      action: "read",
      entityName: result.bonusMonth,
      description: "Bonus Bank/Cash/Mobile sheet export preview generated",
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
      message: "Bonus Payment Distribution export preview generated successfully",
      data: result,
    });
  },
);

const createBonusPaymentDistributionExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "bonus_payment_distribution",
    action: "export",
    entityName: result.reportData.bonusMonth,
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

const exportBonusPaymentDistributionCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.exportBonusPaymentDistributionCsvFromDB(
        req.query as any,
      );

    await createBonusPaymentDistributionExportAudit({
      req,
      result,
      description: "Bonus Bank/Cash/Mobile sheet CSV exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

const exportBonusPaymentDistributionExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.exportBonusPaymentDistributionExcelFromDB(
        req.query as any,
      );

    await createBonusPaymentDistributionExportAudit({
      req,
      result,
      description: "Bonus Bank/Cash/Mobile sheet Excel exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

const exportBonusPaymentDistributionPdf = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusPaymentDistributionServices.exportBonusPaymentDistributionPdfFromDB(
        req.query as any,
      );

    await createBonusPaymentDistributionExportAudit({
      req,
      result,
      description: "Bonus Bank/Cash/Mobile sheet PDF exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);


const getDeletedBonusPaymentDistributions = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusPaymentDistributionServices.getDeletedBonusPaymentDistributionsFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted Bonus Payment Distribution records retrieved successfully",
    data: result,
  });
});

const deleteBonusPaymentDistribution = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusPaymentDistributionServices.softDeleteBonusPaymentDistributionFromDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    deleteReason: req.body?.deleteReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Payment Distribution deleted successfully",
    data: result,
  });
});

const restoreBonusPaymentDistribution = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusPaymentDistributionServices.restoreBonusPaymentDistributionIntoDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    restoreReason: req.body?.restoreReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Payment Distribution restored successfully",
    data: result,
  });
});

export const BonusPaymentDistributionControllers = {
  generateMonthlyBonusPaymentDistribution,
  getAllBonusPaymentDistributions,
  getSingleBonusPaymentDistribution,
  getBonusPaymentDistributionOperationalSummary,
  bulkProcessBonusPaymentDistributions,
  bulkApproveBonusPaymentDistributions,
  bulkLockBonusPaymentDistributions,
  bulkUnlockBonusPaymentDistributions,
  processBonusPaymentDistribution,
  approveBonusPaymentDistribution,
  lockBonusPaymentDistribution,
  unlockBonusPaymentDistribution,
  getBonusPaymentDistributionExportPreview,
  exportBonusPaymentDistributionCsv,
  exportBonusPaymentDistributionExcel,
  exportBonusPaymentDistributionPdf,

  getDeletedBonusPaymentDistributions,
  deleteBonusPaymentDistribution,
  restoreBonusPaymentDistribution,
};

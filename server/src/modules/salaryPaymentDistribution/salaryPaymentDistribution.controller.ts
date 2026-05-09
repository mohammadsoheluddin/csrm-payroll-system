import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { SalaryPaymentDistributionServices } from "./salaryPaymentDistribution.service";

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

const generateMonthlySalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.generateMonthlySalaryPaymentDistributionIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_payment_distribution",
      action: "process",
      entityName: result.payrollMonth,
      description:
        "Monthly Salary Payment Distribution generated from locked Salary Statement",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        salaryStatementReadiness: result.salaryStatementReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Salary Payment Distribution generated successfully",
      data: result,
    });
  },
);

const getAllSalaryPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SalaryPaymentDistributionServices.getAllSalaryPaymentDistributionsFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distributions retrieved successfully",
      data: result,
    });
  },
);

const getSingleSalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SalaryPaymentDistributionServices.getSingleSalaryPaymentDistributionFromDB(
        getParamId(req, "id"),
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distribution retrieved successfully",
      data: result,
    });
  },
);

const getSalaryPaymentDistributionOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SalaryPaymentDistributionServices.getSalaryPaymentDistributionOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Salary Payment Distribution operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBulkSalaryPaymentDistributionAudit = async ({
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
    module: "salary_payment_distribution",
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
      salaryPaymentSheetReadiness: result.salaryPaymentSheetReadiness,
      note: req.body?.note || "",
    },
  });
};

const bulkProcessSalaryPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.bulkProcessSalaryPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkSalaryPaymentDistributionAudit({
      req,
      action: "process",
      description: "Bulk Salary Payment Distributions processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distributions processed successfully",
      data: result,
    });
  },
);

const bulkApproveSalaryPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.bulkApproveSalaryPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkSalaryPaymentDistributionAudit({
      req,
      action: "approve",
      description: "Bulk Salary Payment Distributions approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distributions approved successfully",
      data: result,
    });
  },
);

const bulkLockSalaryPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.bulkLockSalaryPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkSalaryPaymentDistributionAudit({
      req,
      action: "lock",
      description:
        "Bulk Salary Payment Distributions locked for Salary Bank/Cash/Mobile sheet processing",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distributions locked successfully",
      data: result,
    });
  },
);

const bulkUnlockSalaryPaymentDistributions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.bulkUnlockSalaryPaymentDistributionsIntoDB(
        req.body,
        userId,
      );

    await createBulkSalaryPaymentDistributionAudit({
      req,
      action: "unlock",
      description: "Bulk Salary Payment Distributions unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Payment Distributions unlocked successfully",
      data: result,
    });
  },
);

const processSalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.processSalaryPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_payment_distribution",
      action: "process",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Payment Distribution processed",
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
      message: "Salary Payment Distribution processed successfully",
      data: result,
    });
  },
);

const approveSalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.approveSalaryPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_payment_distribution",
      action: "approve",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Payment Distribution approved",
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
      message: "Salary Payment Distribution approved successfully",
      data: result,
    });
  },
);

const lockSalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.lockSalaryPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_payment_distribution",
      action: "lock",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Payment Distribution locked",
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
      message: "Salary Payment Distribution locked successfully",
      data: result,
    });
  },
);

const unlockSalaryPaymentDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryPaymentDistributionServices.unlockSalaryPaymentDistributionIntoDB(
        getParamId(req, "id"),
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_payment_distribution",
      action: "unlock",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Payment Distribution unlocked",
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
      message: "Salary Payment Distribution unlocked successfully",
      data: result,
    });
  },
);

export const SalaryPaymentDistributionControllers = {
  generateMonthlySalaryPaymentDistribution,
  getAllSalaryPaymentDistributions,
  getSingleSalaryPaymentDistribution,
  getSalaryPaymentDistributionOperationalSummary,
  processSalaryPaymentDistribution,
  approveSalaryPaymentDistribution,
  lockSalaryPaymentDistribution,
  unlockSalaryPaymentDistribution,
  bulkProcessSalaryPaymentDistributions,
  bulkApproveSalaryPaymentDistributions,
  bulkLockSalaryPaymentDistributions,
  bulkUnlockSalaryPaymentDistributions,
};

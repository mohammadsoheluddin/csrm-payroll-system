import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { SalaryStatementServices } from "./salaryStatement.service";

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

const generateMonthlySalaryStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryStatementServices.generateMonthlySalaryStatementIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "salary_statement",
      action: "process",
      entityName: result.payrollMonth,
      description: "Monthly Salary Statement generated from locked Salary Sheet",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        salarySheetReadiness: result.salarySheetReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Salary Statement generated successfully",
      data: result,
    });
  },
);

const getAllSalaryStatements = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SalaryStatementServices.getAllSalaryStatementsFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statements retrieved successfully",
      data: result,
    });
  },
);

const getSingleSalaryStatement = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SalaryStatementServices.getSingleSalaryStatementFromDB(
      getParamId(req, "id"),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statement retrieved successfully",
      data: result,
    });
  },
);

const getSalaryStatementOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SalaryStatementServices.getSalaryStatementOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statement operational summary retrieved successfully",
      data: result,
    });
  },
);


const createSalaryStatementBulkAudit = async ({
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
    module: "salary_statement",
    action,
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      salaryPaymentDistributionReadiness:
        result.salaryPaymentDistributionReadiness,
    },
  });
};

const bulkProcessSalaryStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryStatementServices.bulkProcessSalaryStatementsIntoDB(
        req.body,
        userId,
      );

    await createSalaryStatementBulkAudit({
      req,
      action: "process",
      description: "Salary Statements bulk processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statements bulk processed successfully",
      data: result,
    });
  },
);

const bulkApproveSalaryStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryStatementServices.bulkApproveSalaryStatementsIntoDB(
        req.body,
        userId,
      );

    await createSalaryStatementBulkAudit({
      req,
      action: "approve",
      description: "Salary Statements bulk approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statements bulk approved successfully",
      data: result,
    });
  },
);

const bulkLockSalaryStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalaryStatementServices.bulkLockSalaryStatementsIntoDB(
      req.body,
      userId,
    );

    await createSalaryStatementBulkAudit({
      req,
      action: "lock",
      description:
        "Salary Statements bulk locked for Salary Payment Distribution processing",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statements bulk locked successfully",
      data: result,
    });
  },
);

const bulkUnlockSalaryStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await SalaryStatementServices.bulkUnlockSalaryStatementsIntoDB(
        req.body,
        userId,
      );

    await createSalaryStatementBulkAudit({
      req,
      action: "unlock",
      description: "Salary Statements bulk unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statements bulk unlocked successfully",
      data: result,
    });
  },
);

const processSalaryStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalaryStatementServices.processSalaryStatementIntoDB(
      getParamId(req, "id"),
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "salary_statement",
      action: "process",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Statement processed",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statement processed successfully",
      data: result,
    });
  },
);

const approveSalaryStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalaryStatementServices.approveSalaryStatementIntoDB(
      getParamId(req, "id"),
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "salary_statement",
      action: "approve",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Statement approved",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statement approved successfully",
      data: result,
    });
  },
);

const lockSalaryStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalaryStatementServices.lockSalaryStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "salary_statement",
    action: "lock",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "Salary Statement locked for payment distribution processing",
    previousData: null,
    newData: null,
    metadata: {
      status: result.status,
      isLocked: result.isLocked,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Statement locked successfully",
    data: result,
  });
});

const unlockSalaryStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalaryStatementServices.unlockSalaryStatementIntoDB(
      getParamId(req, "id"),
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "salary_statement",
      action: "unlock",
      entityId: getParamId(req, "id"),
      entityName: result.payrollMonth,
      description: "Salary Statement unlocked",
      previousData: null,
      newData: null,
      metadata: {
        status: result.status,
        isLocked: result.isLocked,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Statement unlocked successfully",
      data: result,
    });
  },
);

export const SalaryStatementControllers = {
  generateMonthlySalaryStatement,
  getAllSalaryStatements,
  getSingleSalaryStatement,
  getSalaryStatementOperationalSummary,
  bulkProcessSalaryStatements,
  bulkApproveSalaryStatements,
  bulkLockSalaryStatements,
  bulkUnlockSalaryStatements,
  processSalaryStatement,
  approveSalaryStatement,
  lockSalaryStatement,
  unlockSalaryStatement,
};

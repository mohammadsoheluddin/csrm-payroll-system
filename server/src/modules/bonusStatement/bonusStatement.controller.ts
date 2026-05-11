import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { BonusStatementServices } from "./bonusStatement.service";

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

const generateMonthlyBonusStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusStatementServices.generateMonthlyBonusStatementIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "bonus_statement",
      action: "process",
      entityName: result.bonusMonth,
      description: "Monthly Bonus Statement generated from locked Bonus Sheet",
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
      message: "Monthly Bonus Statement generated successfully",
      data: result,
    });
  },
);

const getAllBonusStatements = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusStatementServices.getAllBonusStatementsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statements retrieved successfully",
    data: result,
  });
});

const getSingleBonusStatement = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusStatementServices.getSingleBonusStatementFromDB(
      getParamId(req, "id"),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Statement retrieved successfully",
      data: result,
    });
  },
);

const getBonusStatementOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await BonusStatementServices.getBonusStatementOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Statement operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBonusStatementBulkAudit = async ({
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
    module: "bonus_statement",
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

const bulkProcessBonusStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusStatementServices.bulkProcessBonusStatementsIntoDB(
      req.body,
      userId,
    );

    await createBonusStatementBulkAudit({
      req,
      action: "process",
      description: "Bonus Statements bulk processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Statements bulk processed successfully",
      data: result,
    });
  },
);

const bulkApproveBonusStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusStatementServices.bulkApproveBonusStatementsIntoDB(
      req.body,
      userId,
    );

    await createBonusStatementBulkAudit({
      req,
      action: "approve",
      description: "Bonus Statements bulk approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Statements bulk approved successfully",
      data: result,
    });
  },
);

const bulkLockBonusStatements = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusStatementServices.bulkLockBonusStatementsIntoDB(
    req.body,
    userId,
  );

  await createBonusStatementBulkAudit({
    req,
    action: "lock",
    description: "Bonus Statements bulk locked for Bonus Payment Distribution processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statements bulk locked successfully",
    data: result,
  });
});

const bulkUnlockBonusStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusStatementServices.bulkUnlockBonusStatementsIntoDB(
      req.body,
      userId,
    );

    await createBonusStatementBulkAudit({
      req,
      action: "unlock",
      description: "Bonus Statements bulk unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Statements bulk unlocked successfully",
      data: result,
    });
  },
);

const createBonusStatementAudit = async ({
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
    module: "bonus_statement",
    action,
    entityId: getParamId(req, "id"),
    entityName: `${result.bonusName} ${result.bonusMonth}`,
    description,
    previousData: null,
    newData: null,
    metadata: {
      status: result.status,
      isLocked: result.isLocked,
      calculatedBonusAmount: result.calculatedBonusAmount,
      payableBonusAmount: result.payableBonusAmount,
    },
  });
};

const processBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusStatementServices.processBonusStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusStatementAudit({
    req,
    action: "process",
    description: "Bonus Statement processed",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement processed successfully",
    data: result,
  });
});

const approveBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusStatementServices.approveBonusStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusStatementAudit({
    req,
    action: "approve",
    description: "Bonus Statement approved",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement approved successfully",
    data: result,
  });
});

const lockBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusStatementServices.lockBonusStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusStatementAudit({
    req,
    action: "lock",
    description: "Bonus Statement locked for Bonus Payment Distribution processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement locked successfully",
    data: result,
  });
});

const unlockBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusStatementServices.unlockBonusStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusStatementAudit({
    req,
    action: "unlock",
    description: "Bonus Statement unlocked",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement unlocked successfully",
    data: result,
  });
});


const getDeletedBonusStatements = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusStatementServices.getDeletedBonusStatementsFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted Bonus Statement records retrieved successfully",
    data: result,
  });
});

const deleteBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusStatementServices.softDeleteBonusStatementFromDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    deleteReason: req.body?.deleteReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement deleted successfully",
    data: result,
  });
});

const restoreBonusStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusStatementServices.restoreBonusStatementIntoDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    restoreReason: req.body?.restoreReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Statement restored successfully",
    data: result,
  });
});

export const BonusStatementControllers = {
  generateMonthlyBonusStatement,
  getAllBonusStatements,
  getSingleBonusStatement,
  getBonusStatementOperationalSummary,
  bulkProcessBonusStatements,
  bulkApproveBonusStatements,
  bulkLockBonusStatements,
  bulkUnlockBonusStatements,
  processBonusStatement,
  approveBonusStatement,
  lockBonusStatement,
  unlockBonusStatement,

  getDeletedBonusStatements,
  deleteBonusStatement,
  restoreBonusStatement,
};

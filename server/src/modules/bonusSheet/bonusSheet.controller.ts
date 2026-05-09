import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { BonusSheetServices } from "./bonusSheet.service";

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

const generateMonthlyBonusSheet = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusSheetServices.generateMonthlyBonusSheetIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "bonus_sheet",
      action: "process",
      entityName: `${result.bonusName} ${result.bonusMonth}`,
      description: "Monthly Bonus Sheet generated from employee and salary structure snapshot",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        employeeReadiness: result.employeeReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Bonus Sheet generated successfully",
      data: result,
    });
  },
);

const getAllBonusSheets = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusSheetServices.getAllBonusSheetsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheets retrieved successfully",
    data: result,
  });
});

const getSingleBonusSheet = catchAsync(async (req: Request, res: Response) => {
  const result = await BonusSheetServices.getSingleBonusSheetFromDB(
    getParamId(req, "id"),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheet retrieved successfully",
    data: result,
  });
});

const getBonusSheetOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusSheetServices.getBonusSheetOperationalSummaryFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Sheet operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBonusSheetBulkAudit = async ({
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
    module: "bonus_sheet",
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

const bulkProcessBonusSheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusSheetServices.bulkProcessBonusSheetsIntoDB(
      req.body,
      userId,
    );

    await createBonusSheetBulkAudit({
      req,
      action: "process",
      description: "Bonus Sheets bulk processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Sheets bulk processed successfully",
      data: result,
    });
  },
);

const bulkApproveBonusSheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusSheetServices.bulkApproveBonusSheetsIntoDB(
      req.body,
      userId,
    );

    await createBonusSheetBulkAudit({
      req,
      action: "approve",
      description: "Bonus Sheets bulk approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Sheets bulk approved successfully",
      data: result,
    });
  },
);

const bulkLockBonusSheets = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusSheetServices.bulkLockBonusSheetsIntoDB(
    req.body,
    userId,
  );

  await createBonusSheetBulkAudit({
    req,
    action: "lock",
    description: "Bonus Sheets bulk locked for Bonus Statement and Payment Distribution processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheets bulk locked successfully",
    data: result,
  });
});

const bulkUnlockBonusSheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await BonusSheetServices.bulkUnlockBonusSheetsIntoDB(
      req.body,
      userId,
    );

    await createBonusSheetBulkAudit({
      req,
      action: "unlock",
      description: "Bonus Sheets bulk unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus Sheets bulk unlocked successfully",
      data: result,
    });
  },
);

const createBonusSheetAudit = async ({
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
    module: "bonus_sheet",
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
      isEligible: result.isEligible,
    },
  });
};

const processBonusSheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusSheetServices.processBonusSheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusSheetAudit({
    req,
    action: "process",
    description: "Bonus Sheet processed",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheet processed successfully",
    data: result,
  });
});

const approveBonusSheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusSheetServices.approveBonusSheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusSheetAudit({
    req,
    action: "approve",
    description: "Bonus Sheet approved",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheet approved successfully",
    data: result,
  });
});

const lockBonusSheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusSheetServices.lockBonusSheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusSheetAudit({
    req,
    action: "lock",
    description: "Bonus Sheet locked for Bonus Statement and Payment Distribution processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheet locked successfully",
    data: result,
  });
});

const unlockBonusSheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await BonusSheetServices.unlockBonusSheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createBonusSheetAudit({
    req,
    action: "unlock",
    description: "Bonus Sheet unlocked",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bonus Sheet unlocked successfully",
    data: result,
  });
});

export const BonusSheetControllers = {
  generateMonthlyBonusSheet,
  getAllBonusSheets,
  getSingleBonusSheet,
  getBonusSheetOperationalSummary,
  bulkProcessBonusSheets,
  bulkApproveBonusSheets,
  bulkLockBonusSheets,
  bulkUnlockBonusSheets,
  processBonusSheet,
  approveBonusSheet,
  lockBonusSheet,
  unlockBonusSheet,
};

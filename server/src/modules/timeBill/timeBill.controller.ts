import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { TimeBillServices } from "./timeBill.service";


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

const generateMonthlyTimeBill = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await TimeBillServices.generateMonthlyTimeBillIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "time_bill",
      action: "process",
      entityName: result.payrollMonth,
      description: "Monthly Time Bill generated from locked attendance finalization",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        attendanceFinalizationReadiness: result.attendanceFinalizationReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Time Bill generated successfully",
      data: result,
    });
  },
);

const getAllTimeBills = catchAsync(async (req: Request, res: Response) => {
  const result = await TimeBillServices.getAllTimeBillsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bills retrieved successfully",
    data: result,
  });
});

const getSingleTimeBill = catchAsync(async (req: Request, res: Response) => {
  const result = await TimeBillServices.getSingleTimeBillFromDB(getParamId(req, "id"));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bill retrieved successfully",
    data: result,
  });
});

const getTimeBillOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TimeBillServices.getTimeBillOperationalSummaryFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Time Bill operational summary retrieved successfully",
      data: result,
    });
  },
);

const processTimeBill = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.processTimeBillIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "time_bill",
    action: "process",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "Time Bill processed",
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
    message: "Time Bill processed successfully",
    data: result,
  });
});

const approveTimeBill = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.approveTimeBillIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "time_bill",
    action: "approve",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "Time Bill approved",
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
    message: "Time Bill approved successfully",
    data: result,
  });
});

const lockTimeBill = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.lockTimeBillIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "time_bill",
    action: "lock",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "Time Bill locked",
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
    message: "Time Bill locked successfully",
    data: result,
  });
});

const unlockTimeBill = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.unlockTimeBillIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "time_bill",
    action: "unlock",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "Time Bill unlocked",
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
    message: "Time Bill unlocked successfully",
    data: result,
  });
});

export const TimeBillControllers = {
  generateMonthlyTimeBill,
  getAllTimeBills,
  getSingleTimeBill,
  getTimeBillOperationalSummary,
  processTimeBill,
  approveTimeBill,
  lockTimeBill,
  unlockTimeBill,
};

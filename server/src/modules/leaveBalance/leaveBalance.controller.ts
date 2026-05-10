import type { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { LeaveBalanceServices } from "./leaveBalance.service";

const generateLeaveBalances = catchAsync(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const result = await LeaveBalanceServices.generateLeaveBalancesIntoDB(req.body);

  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "process",
    entityId: `${result.year}`,
    description: "Leave balance generated",
    previousData: null,
    newData: {
      year: result.year,
      employeeCount: result.employeeCount,
      recordCount: result.recordCount,
    },
    metadata: {
      route: req.originalUrl,
      requestBody: req.body,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Leave balance generated successfully",
    data: result,
  });
});

const getAllLeaveBalances = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.getAllLeaveBalancesFromDB(
    req.query as unknown as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance records retrieved successfully",
    data: result,
  });
});

const getLeaveBalanceSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.getLeaveBalanceSummaryFromDB(
      req.query as unknown as Record<string, string>,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance summary retrieved successfully",
      data: result,
    });
  },
);

const getSingleLeaveBalance = catchAsync(
  async (req: Request, res: Response) => {
    const leaveBalanceId = req.params.id as string;
    const result = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
      leaveBalanceId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance record retrieved successfully",
      data: result,
    });
  },
);

const lockLeaveBalance = catchAsync(async (req: Request, res: Response) => {
  const leaveBalanceId = req.params.id as string;
  const previousRecord = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
    leaveBalanceId,
  );

  const result = await LeaveBalanceServices.updateLeaveBalanceLockState({
    id: leaveBalanceId,
    action: "lock",
    payload: req.body || {},
  });

  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "lock",
    entityId: getAuditEntityId(result, leaveBalanceId),
    description: "Leave balance locked",
    previousData: toAuditData(previousRecord),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance locked successfully",
    data: result,
  });
});

const unlockLeaveBalance = catchAsync(async (req: Request, res: Response) => {
  const leaveBalanceId = req.params.id as string;
  const previousRecord = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
    leaveBalanceId,
  );

  const result = await LeaveBalanceServices.updateLeaveBalanceLockState({
    id: leaveBalanceId,
    action: "unlock",
    payload: req.body || {},
  });

  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "unlock",
    entityId: getAuditEntityId(result, leaveBalanceId),
    description: "Leave balance unlocked",
    previousData: toAuditData(previousRecord),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance unlocked successfully",
    data: result,
  });
});

const bulkLockLeaveBalances = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.bulkUpdateLeaveBalanceLockState({
    action: "lock",
    payload: req.body,
  });

  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "lock",
    entityId: `${req.body?.year || ""}`,
    description: "Leave balance bulk locked",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      requestBody: req.body,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance bulk locked successfully",
    data: result,
  });
});

const bulkUnlockLeaveBalances = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.bulkUpdateLeaveBalanceLockState({
      action: "unlock",
      payload: req.body,
    });

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "unlock",
      entityId: `${req.body?.year || ""}`,
      description: "Leave balance bulk unlocked",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        requestBody: req.body,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance bulk unlocked successfully",
      data: result,
    });
  },
);

export const LeaveBalanceControllers = {
  generateLeaveBalances,
  getAllLeaveBalances,
  getLeaveBalanceSummary,
  getSingleLeaveBalance,
  lockLeaveBalance,
  unlockLeaveBalance,
  bulkLockLeaveBalances,
  bulkUnlockLeaveBalances,
};

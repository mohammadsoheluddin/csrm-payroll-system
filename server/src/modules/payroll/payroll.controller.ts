import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";

import sendResponse from "../../utils/sendResponse";

import { PayrollServices } from "./payroll.service";

const processPayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = req.params.id as string;

  const user = (
    req as Request & {
      user?: {
        userId?: string;
      };
    }
  ).user;

  const result = await PayrollServices.processPayrollByIdFromDB(
    payrollId,
    user?.userId,
  );

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll processed successfully",

    data: result,
  });
});

const approvePayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = req.params.id as string;

  const user = (
    req as Request & {
      user?: {
        userId?: string;
      };
    }
  ).user;

  const result = await PayrollServices.approvePayrollByIdFromDB(
    payrollId,
    user?.userId,
  );

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll approved successfully",

    data: result,
  });
});

const markPayrollAsPaid = catchAsync(async (req: Request, res: Response) => {
  const result = await PayrollServices.markPayrollAsPaidFromDB();

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll marked as paid successfully",

    data: result,
  });
});

const lockPayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = req.params.id as string;

  const user = (
    req as Request & {
      user?: {
        userId?: string;
      };
    }
  ).user;

  const result = await PayrollServices.lockPayrollByIdFromDB(
    payrollId,
    user?.userId,
  );

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll locked successfully",

    data: result,
  });
});

const unlockPayrollById = catchAsync(async (req: Request, res: Response) => {
  const result = await PayrollServices.unlockPayrollByIdFromDB();

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll unlocked successfully",

    data: result,
  });
});

const approveMonthlyPayrollBatch = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PayrollServices.approveMonthlyPayrollBatchFromDB();

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Monthly payroll batch approved successfully",

      data: result,
    });
  },
);

const lockMonthlyPayrollBatch = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PayrollServices.lockMonthlyPayrollBatchFromDB();

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Monthly payroll batch locked successfully",

      data: result,
    });
  },
);

const updatePayrollById = catchAsync(async (req: Request, res: Response) => {
  const result = await PayrollServices.updatePayrollByIdFromDB();

  sendResponse(res, {
    statusCode: 200,

    success: true,

    message: "Payroll updated successfully",

    data: result,
  });
});

const getPayrollAuditTimeline = catchAsync(
  async (req: Request, res: Response) => {
    const payrollId = req.params.id as string;

    const result =
      await PayrollServices.getPayrollAuditTimelineFromDB(payrollId);

    sendResponse(res, {
      statusCode: 200,

      success: true,

      message: "Payroll audit timeline retrieved successfully",

      data: result,
    });
  },
);

export const PayrollController = {
  processPayrollById,

  approvePayrollById,

  markPayrollAsPaid,

  lockPayrollById,

  unlockPayrollById,

  approveMonthlyPayrollBatch,

  lockMonthlyPayrollBatch,

  updatePayrollById,

  getPayrollAuditTimeline,
};

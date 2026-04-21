import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PayrollService } from "./payroll.service";

const getSingleParam = (value: string | string[] | undefined) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
};

const processPayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const remarks = req.body?.remarks;
  const actionBy =
    (req as any)?.user?.userId || req.body?.actionBy || undefined;

  const result = await PayrollService.processPayrollByIdFromDB(
    payrollId,
    remarks,
    actionBy,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll processed successfully",
    data: result,
  });
});

const approvePayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const remarks = req.body?.remarks;
  const approvedBy =
    (req as any)?.user?.userId || req.body?.approvedBy || undefined;

  const result = await PayrollService.approvePayrollByIdFromDB(
    payrollId,
    approvedBy,
    remarks,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll approved successfully",
    data: result,
  });
});

const markPayrollAsPaid = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const remarks = req.body?.remarks;
  const actionBy =
    (req as any)?.user?.userId || req.body?.actionBy || undefined;

  const result = await PayrollService.markPayrollAsPaidFromDB(
    payrollId,
    remarks,
    actionBy,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll marked as paid successfully",
    data: result,
  });
});

const lockPayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const lockedBy =
    (req as any)?.user?.userId || req.body?.lockedBy || undefined;

  const result = await PayrollService.lockPayrollByIdFromDB(
    payrollId,
    lockedBy,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll locked successfully",
    data: result,
  });
});

const unlockPayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const actionBy =
    (req as any)?.user?.userId || req.body?.actionBy || undefined;

  const result = await PayrollService.unlockPayrollByIdFromDB(
    payrollId,
    actionBy,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll unlocked successfully",
    data: result,
  });
});

const approveMonthlyPayrollBatch = catchAsync(
  async (req: Request, res: Response) => {
    const month = Number(req.body?.month);
    const year = Number(req.body?.year);
    const approvedBy =
      (req as any)?.user?.userId || req.body?.approvedBy || undefined;

    const result = await PayrollService.approveMonthlyPayrollBatchFromDB(
      month,
      year,
      approvedBy,
    );

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
    const month = Number(req.body?.month);
    const year = Number(req.body?.year);
    const lockedBy =
      (req as any)?.user?.userId || req.body?.lockedBy || undefined;

    const result = await PayrollService.lockMonthlyPayrollBatchFromDB(
      month,
      year,
      lockedBy,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Monthly payroll batch locked successfully",
      data: result,
    });
  },
);

const updatePayrollById = catchAsync(async (req: Request, res: Response) => {
  const payrollId = getSingleParam(req.params.id);
  const actionBy =
    (req as any)?.user?.userId || req.body?.actionBy || undefined;

  const result = await PayrollService.updatePayrollByIdFromDB(
    payrollId,
    req.body,
    actionBy,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll updated successfully",
    data: result,
  });
});

const getPayrollAuditTimeline = catchAsync(
  async (req: Request, res: Response) => {
    const payrollId = getSingleParam(req.params.id);

    const result =
      await PayrollService.getPayrollAuditTimelineFromDB(payrollId);

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

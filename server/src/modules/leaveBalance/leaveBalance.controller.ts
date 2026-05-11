import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
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
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance records retrieved successfully",
    data: result,
  });
});

const getDeletedLeaveBalances = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.getDeletedLeaveBalancesFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted leave balance records retrieved successfully",
    data: result,
  });
});

const getLeaveBalanceSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.getLeaveBalanceSummaryFromDB(
      req.query as any,
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

const setLeaveBalanceOpeningBalance = catchAsync(
  async (req: Request, res: Response) => {
    const leaveBalanceId = req.params.id as string;
    const previousRecord = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
      leaveBalanceId,
    );

    const result = await LeaveBalanceServices.setLeaveBalanceOpeningBalanceIntoDB({
      id: leaveBalanceId,
      payload: req.body,
    });

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "update",
      entityId: getAuditEntityId(result, leaveBalanceId),
      description: "Leave balance opening balance updated",
      previousData: toAuditData(previousRecord),
      newData: toAuditData(result),
      metadata: {
        requestBody: req.body,
        policy: "no_carry_forward",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance opening balance updated successfully",
      data: result,
    });
  },
);

const adjustLeaveBalance = catchAsync(async (req: Request, res: Response) => {
  const leaveBalanceId = req.params.id as string;
  const previousRecord = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
    leaveBalanceId,
  );

  const result = await LeaveBalanceServices.adjustLeaveBalanceIntoDB({
    id: leaveBalanceId,
    payload: req.body,
  });

  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "update",
    entityId: getAuditEntityId(result, leaveBalanceId),
    description: "Leave balance adjusted",
    previousData: toAuditData(previousRecord),
    newData: toAuditData(result),
    metadata: {
      requestBody: req.body,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave balance adjusted successfully",
    data: result,
  });
});

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


const getLeaveBalanceExportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.getLeaveBalanceExportPreviewFromDB(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "read",
      entityId: `${result.summary.year || ""}`,
      description: "Leave balance export preview generated",
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
      message: "Leave balance export preview generated successfully",
      data: result,
    });
  },
);

const createLeaveBalanceExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "export",
    entityId: `${result.reportData?.summary?.year || ""}`,
    description,
    previousData: null,
    newData: null,
    metadata: {
      fileName: result.fileName,
      filters: result.reportData?.filters,
      summary: result.reportData?.summary,
    },
  });
};

const exportLeaveBalanceCsv = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.exportLeaveBalanceCsvFromDB(
    req.query as any,
  );

  await createLeaveBalanceExportAudit({
    req,
    result,
    description: "Leave balance CSV exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportLeaveBalanceExcel = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.exportLeaveBalanceExcelFromDB(
    req.query as any,
  );

  await createLeaveBalanceExportAudit({
    req,
    result,
    description: "Leave balance Excel exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportLeaveBalancePdf = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveBalanceServices.exportLeaveBalancePdfFromDB(
    req.query as any,
  );

  await createLeaveBalanceExportAudit({
    req,
    result,
    description: "Leave balance PDF exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const getEmployeeLeaveLedgerPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.getEmployeeLeaveLedgerFromDB(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "read",
      entityId: result.employee.employeeId,
      description: "Employee leave ledger preview generated",
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
      message: "Employee leave ledger preview generated successfully",
      data: result,
    });
  },
);

const createEmployeeLeaveLedgerExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "leave_balance",
    action: "export",
    entityId: result.reportData?.employee?.employeeId,
    description,
    previousData: null,
    newData: null,
    metadata: {
      fileName: result.fileName,
      filters: result.reportData?.filters,
      summary: result.reportData?.summary,
    },
  });
};

const exportEmployeeLeaveLedgerCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.exportEmployeeLeaveLedgerCsvFromDB(
      req.query as any,
    );

    await createEmployeeLeaveLedgerExportAudit({
      req,
      result,
      description: "Employee leave ledger CSV exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportEmployeeLeaveLedgerExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.exportEmployeeLeaveLedgerExcelFromDB(
      req.query as any,
    );

    await createEmployeeLeaveLedgerExportAudit({
      req,
      result,
      description: "Employee leave ledger Excel exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportEmployeeLeaveLedgerPdf = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LeaveBalanceServices.exportEmployeeLeaveLedgerPdfFromDB(
      req.query as any,
    );

    await createEmployeeLeaveLedgerExportAudit({
      req,
      result,
      description: "Employee leave ledger PDF exported",
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const deleteLeaveBalance = catchAsync(
  async (req: Request, res: Response) => {
    const leaveBalanceId = req.params.id as string;
    const previousRecord = await LeaveBalanceServices.getSingleLeaveBalanceFromDB(
      leaveBalanceId,
    );

    const result = await LeaveBalanceServices.deleteLeaveBalanceFromDB(
      leaveBalanceId,
      {
        userId: getRequestUserId(req),
        deleteReason: req.body?.deleteReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "soft_delete",
      entityId: getAuditEntityId(result, leaveBalanceId),
      description: "Leave balance soft deleted",
      previousData: toAuditData(previousRecord),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
        policy: "Locked leave balance cannot be deleted",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance deleted successfully",
      data: result,
    });
  },
);

const restoreLeaveBalance = catchAsync(
  async (req: Request, res: Response) => {
    const leaveBalanceId = req.params.id as string;

    const result = await LeaveBalanceServices.restoreLeaveBalanceIntoDB(
      leaveBalanceId,
      {
        userId: getRequestUserId(req),
        restoreReason: req.body?.restoreReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "leave_balance",
      action: "restore",
      entityId: getAuditEntityId(result, leaveBalanceId),
      description: "Leave balance restored",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
        policy: "Blocked if active duplicate exists for employee, year and leave type",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leave balance restored successfully",
      data: result,
    });
  },
);

export const LeaveBalanceControllers = {
  generateLeaveBalances,
  getAllLeaveBalances,
  getDeletedLeaveBalances,
  getLeaveBalanceSummary,
  getSingleLeaveBalance,
  setLeaveBalanceOpeningBalance,
  adjustLeaveBalance,
  lockLeaveBalance,
  unlockLeaveBalance,
  deleteLeaveBalance,
  restoreLeaveBalance,
  bulkLockLeaveBalances,
  bulkUnlockLeaveBalances,
  getLeaveBalanceExportPreview,
  exportLeaveBalanceCsv,
  exportLeaveBalanceExcel,
  exportLeaveBalancePdf,
  getEmployeeLeaveLedgerPreview,
  exportEmployeeLeaveLedgerCsv,
  exportEmployeeLeaveLedgerExcel,
  exportEmployeeLeaveLedgerPdf,
};

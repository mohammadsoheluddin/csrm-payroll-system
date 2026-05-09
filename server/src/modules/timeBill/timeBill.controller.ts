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
  const result = await TimeBillServices.getSingleTimeBillFromDB(
    getParamId(req, "id"),
  );

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

const createBulkTimeBillAudit = async ({
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
    module: "time_bill",
    action,
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      otStatementReadiness: result.otStatementReadiness,
      note: req.body?.note || "",
    },
  });
};

const bulkProcessTimeBills = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.bulkProcessTimeBillsIntoDB(
    req.body,
    userId,
  );

  await createBulkTimeBillAudit({
    req,
    action: "process",
    description: "Bulk Time Bills processed",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bills processed successfully",
    data: result,
  });
});

const bulkApproveTimeBills = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.bulkApproveTimeBillsIntoDB(
    req.body,
    userId,
  );

  await createBulkTimeBillAudit({
    req,
    action: "approve",
    description: "Bulk Time Bills approved",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bills approved successfully",
    data: result,
  });
});

const bulkLockTimeBills = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.bulkLockTimeBillsIntoDB(req.body, userId);

  await createBulkTimeBillAudit({
    req,
    action: "lock",
    description: "Bulk Time Bills locked for OT Statement processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bills locked successfully",
    data: result,
  });
});

const bulkUnlockTimeBills = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await TimeBillServices.bulkUnlockTimeBillsIntoDB(
    req.body,
    userId,
  );

  await createBulkTimeBillAudit({
    req,
    action: "unlock",
    description: "Bulk Time Bills unlocked",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Time Bills unlocked successfully",
    data: result,
  });
});

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

const getTimeBillExportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TimeBillServices.buildTimeBillExportPreviewFromDB(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "time_bill",
      action: "read",
      entityName: result.payrollMonth,
      description: "Time Bill export preview generated",
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
      message: "Time Bill export preview generated successfully",
      data: result,
    });
  },
);

const createTimeBillExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "time_bill",
    action: "export",
    entityName: result.reportData.payrollMonth,
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

const exportTimeBillCsv = catchAsync(async (req: Request, res: Response) => {
  const result = await TimeBillServices.exportTimeBillCsvFromDB(req.query as any);

  await createTimeBillExportAudit({
    req,
    result,
    description: "Time Bill CSV exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportTimeBillExcel = catchAsync(async (req: Request, res: Response) => {
  const result = await TimeBillServices.exportTimeBillExcelFromDB(req.query as any);

  await createTimeBillExportAudit({
    req,
    result,
    description: "Time Bill Excel exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportTimeBillPdf = catchAsync(async (req: Request, res: Response) => {
  const result = await TimeBillServices.exportTimeBillPdfFromDB(req.query as any);

  await createTimeBillExportAudit({
    req,
    result,
    description: "Time Bill PDF exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});


export const TimeBillControllers = {
  generateMonthlyTimeBill,
  getAllTimeBills,
  getSingleTimeBill,
  getTimeBillOperationalSummary,
  bulkProcessTimeBills,
  bulkApproveTimeBills,
  bulkLockTimeBills,
  bulkUnlockTimeBills,
  processTimeBill,
  approveTimeBill,
  lockTimeBill,
  unlockTimeBill,
  getTimeBillExportPreview,
  exportTimeBillCsv,
  exportTimeBillExcel,
  exportTimeBillPdf,
};

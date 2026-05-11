import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { OtStatementServices } from "./otStatement.service";

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

const generateMonthlyOtStatement = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await OtStatementServices.generateMonthlyOtStatementIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "ot_statement",
      action: "process",
      entityName: result.payrollMonth,
      description: "Monthly OT Statement generated from locked Time Bill",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        timeBillReadiness: result.timeBillReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly OT Statement generated successfully",
      data: result,
    });
  },
);

const getAllOtStatements = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.getAllOtStatementsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OT Statements retrieved successfully",
    data: result,
  });
});

const getSingleOtStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.getSingleOtStatementFromDB(
    getParamId(req, "id"),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OT Statement retrieved successfully",
    data: result,
  });
});

const getOtStatementOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OtStatementServices.getOtStatementOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Statement operational summary retrieved successfully",
      data: result,
    });
  },
);

const createBulkOtStatementAudit = async ({
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
    module: "ot_statement",
    action,
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      otPaymentReadiness: result.otPaymentReadiness,
      note: req.body?.note || "",
    },
  });
};

const bulkProcessOtStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await OtStatementServices.bulkProcessOtStatementsIntoDB(
      req.body,
      userId,
    );

    await createBulkOtStatementAudit({
      req,
      action: "process",
      description: "Bulk OT Statements processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Statements processed successfully",
      data: result,
    });
  },
);

const bulkApproveOtStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await OtStatementServices.bulkApproveOtStatementsIntoDB(
      req.body,
      userId,
    );

    await createBulkOtStatementAudit({
      req,
      action: "approve",
      description: "Bulk OT Statements approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Statements approved successfully",
      data: result,
    });
  },
);

const bulkLockOtStatements = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await OtStatementServices.bulkLockOtStatementsIntoDB(
    req.body,
    userId,
  );

  await createBulkOtStatementAudit({
    req,
    action: "lock",
    description: "Bulk OT Statements locked for OT payment processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OT Statements locked successfully",
    data: result,
  });
});

const bulkUnlockOtStatements = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await OtStatementServices.bulkUnlockOtStatementsIntoDB(
      req.body,
      userId,
    );

    await createBulkOtStatementAudit({
      req,
      action: "unlock",
      description: "Bulk OT Statements unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OT Statements unlocked successfully",
      data: result,
    });
  },
);

const processOtStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await OtStatementServices.processOtStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "ot_statement",
    action: "process",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "OT Statement processed",
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
    message: "OT Statement processed successfully",
    data: result,
  });
});

const approveOtStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await OtStatementServices.approveOtStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "ot_statement",
    action: "approve",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "OT Statement approved",
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
    message: "OT Statement approved successfully",
    data: result,
  });
});

const lockOtStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await OtStatementServices.lockOtStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "ot_statement",
    action: "lock",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "OT Statement locked",
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
    message: "OT Statement locked successfully",
    data: result,
  });
});

const unlockOtStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await OtStatementServices.unlockOtStatementIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "ot_statement",
    action: "unlock",
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description: "OT Statement unlocked",
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
    message: "OT Statement unlocked successfully",
    data: result,
  });
});

const getOtStatementExportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OtStatementServices.buildOtStatementExportPreviewFromDB(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "ot_statement",
      action: "read",
      entityName: result.payrollMonth,
      description: "OT Statement export preview generated",
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
      message: "OT Statement export preview generated successfully",
      data: result,
    });
  },
);

const createOtStatementExportAudit = async ({
  req,
  result,
  description,
}: {
  req: Request;
  result: any;
  description: string;
}) => {
  await createAuditLogFromRequest(req, {
    module: "ot_statement",
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

const exportOtStatementCsv = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.exportOtStatementCsvFromDB(req.query as any);

  await createOtStatementExportAudit({
    req,
    result,
    description: "OT Statement CSV exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportOtStatementExcel = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.exportOtStatementExcelFromDB(req.query as any);

  await createOtStatementExportAudit({
    req,
    result,
    description: "OT Statement Excel exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});

const exportOtStatementPdf = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.exportOtStatementPdfFromDB(req.query as any);

  await createOtStatementExportAudit({
    req,
    result,
    description: "OT Statement PDF exported",
  });

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.buffer);
});



const getDeletedOtStatements = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.getDeletedOtStatementsFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted OT Statement records retrieved successfully",
    data: result,
  });
});

const deleteOtStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.softDeleteOtStatementFromDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    deleteReason: req.body?.deleteReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OT Statement deleted successfully",
    data: result,
  });
});

const restoreOtStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await OtStatementServices.restoreOtStatementIntoDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    restoreReason: req.body?.restoreReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OT Statement restored successfully",
    data: result,
  });
});

export const OtStatementControllers = {
  generateMonthlyOtStatement,
  getAllOtStatements,
  getSingleOtStatement,
  getOtStatementOperationalSummary,
  bulkProcessOtStatements,
  bulkApproveOtStatements,
  bulkLockOtStatements,
  bulkUnlockOtStatements,
  processOtStatement,
  approveOtStatement,
  lockOtStatement,
  unlockOtStatement,
  getOtStatementExportPreview,
  exportOtStatementCsv,
  exportOtStatementExcel,
  exportOtStatementPdf,

  getDeletedOtStatements,
  deleteOtStatement,
  restoreOtStatement,
};

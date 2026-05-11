import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest, getAuditEntityId, toAuditData } from "../auditLog/auditLog.utils";
import { AttendanceImportServices } from "./attendanceImport.service";

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

const previewAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.previewAttendanceImportFromPayload(
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import preview generated successfully",
    data: result,
  });
});

const commitAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await AttendanceImportServices.commitAttendanceImportIntoDB(
    req.body,
    userId,
  );

  await createAuditLogFromRequest(req, {
    module: "attendance_import",
    action: "process",
    entityId: getAuditEntityId(result),
    entityName: result?.batchNo,
    description: "Attendance import committed",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      source: result?.source,
      matchBy: result?.matchBy,
      totalRows: result?.totalRows,
      validRows: result?.validRows,
      invalidRows: result?.invalidRows,
      insertedAttendanceCount: result?.insertedAttendanceCount,
      updatedAttendanceCount: result?.updatedAttendanceCount,
      skippedAttendanceCount: result?.skippedAttendanceCount,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Attendance import committed successfully",
    data: result,
  });
});

const getAllAttendanceImports = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.getAllAttendanceImportsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import batches retrieved successfully",
    data: result,
  });
});

const getDeletedAttendanceImports = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.getDeletedAttendanceImportsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted attendance import batches retrieved successfully",
    data: result,
  });
});

const getSingleAttendanceImport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.getSingleAttendanceImportFromDB(
      getParamId(req, "id"),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import batch retrieved successfully",
      data: result,
    });
  },
);

const previewAttendanceImportRollback = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.previewAttendanceImportRollbackFromDB(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "read",
      entityId: result.batch.id,
      entityName: result.batch.batchNo,
      description: "Attendance import rollback preview generated",
      previousData: null,
      newData: null,
      metadata: {
        canRevert: result.canRevert,
        summary: result.summary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import rollback preview generated successfully",
      data: result,
    });
  },
);

const rollbackAttendanceImportBatch = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const result = await AttendanceImportServices.rollbackAttendanceImportBatchIntoDB(
      getParamId(req, "id"),
      req.body || {},
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "status_change",
      entityId: getAuditEntityId(result),
      entityName: result?.batchNo,
      description: "Attendance import batch reverted",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        status: result?.status,
        rollbackSummary: result?.rollbackSummary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import batch reverted successfully",
      data: result,
    });
  },
);



const getAttendanceImportTemplatePreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = AttendanceImportServices.buildAttendanceImportTemplatePreview(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "read",
      entityName: `${result.template.source}-${result.template.matchBy}`,
      description: "Attendance import template preview generated",
      previousData: null,
      newData: null,
      metadata: {
        template: result.template,
        columns: result.columns.map((column) => column.header),
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import template preview generated successfully",
      data: result,
    });
  },
);

const exportAttendanceImportTemplateCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result = AttendanceImportServices.exportAttendanceImportTemplateCsv(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "export",
      entityName: result.fileName,
      description: "Attendance import CSV template exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        template: (result.reportData as any).template,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportAttendanceImportTemplateExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.exportAttendanceImportTemplateExcel(
      req.query as any,
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "export",
      entityName: result.fileName,
      description: "Attendance import Excel template exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        template: (result.reportData as any).template,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const getAttendanceImportRejectionReportPreview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.buildAttendanceImportRejectionReportFromDB(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "read",
      entityId: result.batch.id,
      entityName: result.batch.batchNo,
      description: "Attendance import rejection report preview generated",
      previousData: null,
      newData: null,
      metadata: {
        summary: result.summary,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance import rejection report preview generated successfully",
      data: result,
    });
  },
);

const exportAttendanceImportRejectionsCsv = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.exportAttendanceImportRejectionsCsv(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "export",
      entityId: (result.reportData as any).batch.id,
      entityName: (result.reportData as any).batch.batchNo,
      description: "Attendance import rejection CSV exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        summary: (result.reportData as any).summary,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const exportAttendanceImportRejectionsExcel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceImportServices.exportAttendanceImportRejectionsExcel(
      getParamId(req, "id"),
    );

    await createAuditLogFromRequest(req, {
      module: "attendance_import",
      action: "export",
      entityId: (result.reportData as any).batch.id,
      entityName: (result.reportData as any).batch.batchNo,
      description: "Attendance import rejection Excel exported",
      previousData: null,
      newData: null,
      metadata: {
        fileName: result.fileName,
        summary: (result.reportData as any).summary,
      },
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  },
);

const deleteAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.deleteAttendanceImportFromDB(
    getParamId(req, "id"),
    {
      userId: getRequestUserId(req),
      deleteReason: req.body?.deleteReason,
    },
  );

  await createAuditLogFromRequest(req, {
    module: "attendance_import",
    action: "soft_delete",
    entityId: getAuditEntityId(result),
    entityName: result.batchNo,
    description: "Attendance import batch soft deleted",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      deleteReason: req.body?.deleteReason || null,
      policy: "Soft delete hides the batch only; it does not revert attendance records",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import batch deleted successfully",
    data: result,
  });
});

const restoreAttendanceImport = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceImportServices.restoreAttendanceImportIntoDB(
    getParamId(req, "id"),
    {
      userId: getRequestUserId(req),
      restoreReason: req.body?.restoreReason,
    },
  );

  await createAuditLogFromRequest(req, {
    module: "attendance_import",
    action: "restore",
    entityId: getAuditEntityId(result),
    entityName: result.batchNo,
    description: "Attendance import batch restored",
    previousData: null,
    newData: toAuditData(result),
    metadata: {
      restoreReason: req.body?.restoreReason || null,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance import batch restored successfully",
    data: result,
  });
});

export const AttendanceImportControllers = {
  previewAttendanceImport,
  commitAttendanceImport,
  getAllAttendanceImports,
  getDeletedAttendanceImports,
  getSingleAttendanceImport,
  previewAttendanceImportRollback,
  rollbackAttendanceImportBatch,
  deleteAttendanceImport,
  restoreAttendanceImport,
  getAttendanceImportTemplatePreview,
  exportAttendanceImportTemplateCsv,
  exportAttendanceImportTemplateExcel,
  getAttendanceImportRejectionReportPreview,
  exportAttendanceImportRejectionsCsv,
  exportAttendanceImportRejectionsExcel,
};

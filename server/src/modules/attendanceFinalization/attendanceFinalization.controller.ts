import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { AttendanceFinalizationServices } from "./attendanceFinalization.service";

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

const generateMonthlyAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.generateMonthlyAttendanceFinalizationIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "process",
      entityName: result.payrollMonth,
      description: "Monthly attendance finalization generated",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        summary: result.summary,
        periodStartDate: result.periodStartDate,
        periodEndDate: result.periodEndDate,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly attendance finalization generated successfully",
      data: result,
    });
  },
);

const buildBulkAuditMetadata = (result: {
  action: string;
  filters: Record<string, unknown>;
  summary: Record<string, unknown>;
}) => ({
  action: result.action,
  filters: result.filters,
  summary: result.summary,
});

const bulkFinalizeAttendanceFinalizations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.bulkFinalizeAttendanceFinalizationsIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "process",
      entityName: result.payrollMonth,
      description: "Bulk attendance finalizations changed to finalized",
      previousData: null,
      newData: null,
      metadata: buildBulkAuditMetadata(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalizations finalized successfully",
      data: result,
    });
  },
);

const bulkApproveAttendanceFinalizations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.bulkApproveAttendanceFinalizationsIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "approve",
      entityName: result.payrollMonth,
      description: "Bulk attendance finalizations approved",
      previousData: null,
      newData: null,
      metadata: buildBulkAuditMetadata(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalizations approved successfully",
      data: result,
    });
  },
);

const bulkLockAttendanceFinalizations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.bulkLockAttendanceFinalizationsIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "lock",
      entityName: result.payrollMonth,
      description: "Bulk attendance finalizations locked",
      previousData: null,
      newData: null,
      metadata: buildBulkAuditMetadata(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalizations locked successfully",
      data: result,
    });
  },
);

const bulkUnlockAttendanceFinalizations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.bulkUnlockAttendanceFinalizationsIntoDB(
        req.body,
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "unlock",
      entityName: result.payrollMonth,
      description: "Bulk attendance finalizations unlocked",
      previousData: null,
      newData: null,
      metadata: buildBulkAuditMetadata(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalizations unlocked successfully",
      data: result,
    });
  },
);

const getAllAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AttendanceFinalizationServices.getAllAttendanceFinalizationFromDB(
        req.query as unknown as Record<string, string>,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalizations retrieved successfully",
      data: result,
    });
  },
);


const getAttendanceFinalizationOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AttendanceFinalizationServices.getAttendanceFinalizationOperationalSummaryFromDB(
        req.query as unknown as {
          payrollMonth?: string;
          month?: string;
          year?: string;
          company: string;
          majorDepartment?: string;
          department?: string;
          branch?: string;
          employee?: string;
        },
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization operational summary retrieved successfully",
      data: result,
    });
  },
);

const getDeletedAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AttendanceFinalizationServices.getDeletedAttendanceFinalizationFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deleted attendance finalization records retrieved successfully",
      data: result,
    });
  },
);

const getSingleAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;

    const result =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization retrieved successfully",
      data: result,
    });
  },
);

const finalizeAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const previousFinalization =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    const result =
      await AttendanceFinalizationServices.finalizeAttendanceFinalizationIntoDB(
        finalizationId,
        req.body || {},
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "process",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization status changed to finalized",
      previousData: toAuditData(previousFinalization),
      newData: toAuditData(result),
      metadata: {
        note: req.body?.note || "",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization finalized successfully",
      data: result,
    });
  },
);

const approveAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const previousFinalization =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    const result =
      await AttendanceFinalizationServices.approveAttendanceFinalizationIntoDB(
        finalizationId,
        req.body || {},
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "approve",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization approved",
      previousData: toAuditData(previousFinalization),
      newData: toAuditData(result),
      metadata: {
        note: req.body?.note || "",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization approved successfully",
      data: result,
    });
  },
);

const lockAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const previousFinalization =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    const result =
      await AttendanceFinalizationServices.lockAttendanceFinalizationIntoDB(
        finalizationId,
        req.body || {},
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "lock",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization locked",
      previousData: toAuditData(previousFinalization),
      newData: toAuditData(result),
      metadata: {
        note: req.body?.note || "",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization locked successfully",
      data: result,
    });
  },
);

const unlockAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const previousFinalization =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    const result =
      await AttendanceFinalizationServices.unlockAttendanceFinalizationIntoDB(
        finalizationId,
        req.body || {},
        userId,
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "unlock",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization unlocked",
      previousData: toAuditData(previousFinalization),
      newData: toAuditData(result),
      metadata: {
        note: req.body?.note || "",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization unlocked successfully",
      data: result,
    });
  },
);

const deleteAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const previousFinalization =
      await AttendanceFinalizationServices.getSingleAttendanceFinalizationFromDB(
        finalizationId,
      );

    const result =
      await AttendanceFinalizationServices.deleteAttendanceFinalizationFromDB(
        finalizationId,
        {
          userId,
          deleteReason: req.body?.deleteReason,
        },
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "soft_delete",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization soft deleted",
      previousData: toAuditData(previousFinalization),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
        policy: "Locked attendance finalization cannot be deleted",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization deleted successfully",
      data: result,
    });
  },
);

const restoreAttendanceFinalization = catchAsync(
  async (req: Request, res: Response) => {
    const finalizationId = req.params.id as string;
    const userId = getUserIdFromRequest(req);

    const result =
      await AttendanceFinalizationServices.restoreAttendanceFinalizationIntoDB(
        finalizationId,
        {
          userId,
          restoreReason: req.body?.restoreReason,
        },
      );

    await createAuditLogFromRequest(req, {
      module: "attendance_finalization",
      action: "restore",
      entityId: getAuditEntityId(result, finalizationId),
      entityName: result.payrollMonth,
      description: "Attendance finalization restored",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
        policy: "Blocked if active duplicate exists for employee and payroll month",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attendance finalization restored successfully",
      data: result,
    });
  },
);

export const AttendanceFinalizationControllers = {
  generateMonthlyAttendanceFinalization,
  getAllAttendanceFinalization,
  getDeletedAttendanceFinalization,
  getAttendanceFinalizationOperationalSummary,
  getSingleAttendanceFinalization,
  bulkFinalizeAttendanceFinalizations,
  bulkApproveAttendanceFinalizations,
  bulkLockAttendanceFinalizations,
  bulkUnlockAttendanceFinalizations,
  finalizeAttendanceFinalization,
  approveAttendanceFinalization,
  lockAttendanceFinalization,
  unlockAttendanceFinalization,
  deleteAttendanceFinalization,
  restoreAttendanceFinalization,
};

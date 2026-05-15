import { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EmployeeDocumentServices } from "./employeeDocument.service";

const createEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeDocumentServices.createEmployeeDocumentIntoDB(
      req.body,
      {
        userId: getRequestUserId(req),
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document registered",
      newData: toAuditData(result),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Employee document created successfully",
      data: result,
    });
  },
);

const getAllEmployeeDocuments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeDocumentServices.getAllEmployeeDocumentsFromDB(
      req.query,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee documents retrieved successfully",
      data: result,
    });
  },
);

const getDeletedEmployeeDocuments = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getDeletedEmployeeDocumentsFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deleted employee documents retrieved successfully",
      data: result,
    });
  },
);

const getSingleEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getSingleEmployeeDocumentFromDB(
        req.params.id as string,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document retrieved successfully",
      data: result,
    });
  },
);

const getEmployeeDocumentsByEmployee = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getEmployeeDocumentsByEmployeeFromDB(
        req.params.employeeId as string,
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee-wise documents retrieved successfully",
      data: result,
    });
  },
);

const getEmployeeDocumentSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getEmployeeDocumentSummaryFromDB(
        req.params.employeeId as string,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document summary retrieved successfully",
      data: result,
    });
  },
);

const getExpiringEmployeeDocuments = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getExpiringEmployeeDocumentsFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expiring employee documents retrieved successfully",
      data: result,
    });
  },
);

const updateEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const employeeDocumentId = req.params.id as string;

    const previousEmployeeDocument =
      await EmployeeDocumentServices.getSingleEmployeeDocumentFromDB(
        employeeDocumentId,
      );

    const result = await EmployeeDocumentServices.updateEmployeeDocumentIntoDB(
      employeeDocumentId,
      req.body,
      {
        userId: getRequestUserId(req),
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "update",
      entityId: getAuditEntityId(result, employeeDocumentId),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document updated",
      previousData: toAuditData(previousEmployeeDocument),
      newData: toAuditData(result),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document updated successfully",
      data: result,
    });
  },
);

const verifyEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const employeeDocumentId = req.params.id as string;

    const previousEmployeeDocument =
      await EmployeeDocumentServices.getSingleEmployeeDocumentFromDB(
        employeeDocumentId,
      );

    const result = await EmployeeDocumentServices.verifyEmployeeDocumentIntoDB(
      employeeDocumentId,
      {
        userId: getRequestUserId(req),
        remarks: req.body?.verificationRemarks,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "approve",
      entityId: getAuditEntityId(result, employeeDocumentId),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document verified",
      previousData: toAuditData(previousEmployeeDocument),
      newData: toAuditData(result),
      metadata: {
        verificationRemarks: req.body?.verificationRemarks || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document verified successfully",
      data: result,
    });
  },
);

const rejectEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const employeeDocumentId = req.params.id as string;

    const previousEmployeeDocument =
      await EmployeeDocumentServices.getSingleEmployeeDocumentFromDB(
        employeeDocumentId,
      );

    const result = await EmployeeDocumentServices.rejectEmployeeDocumentIntoDB(
      employeeDocumentId,
      {
        userId: getRequestUserId(req),
        remarks: req.body?.rejectionReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "reject",
      entityId: getAuditEntityId(result, employeeDocumentId),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document rejected",
      previousData: toAuditData(previousEmployeeDocument),
      newData: toAuditData(result),
      metadata: {
        rejectionReason: req.body?.rejectionReason || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document rejected successfully",
      data: result,
    });
  },
);

const deleteEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const employeeDocumentId = req.params.id as string;

    const previousEmployeeDocument =
      await EmployeeDocumentServices.getSingleEmployeeDocumentFromDB(
        employeeDocumentId,
      );

    const result =
      await EmployeeDocumentServices.softDeleteEmployeeDocumentFromDB(
        employeeDocumentId,
        {
          userId: getRequestUserId(req),
          deleteReason: req.body?.deleteReason,
        },
      );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "soft_delete",
      entityId: getAuditEntityId(result, employeeDocumentId),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document soft deleted",
      previousData: toAuditData(previousEmployeeDocument),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document deleted successfully",
      data: result,
    });
  },
);

const restoreEmployeeDocument = catchAsync(
  async (req: Request, res: Response) => {
    const employeeDocumentId = req.params.id as string;

    const previousEmployeeDocument =
      await EmployeeDocumentServices.getSingleDeletedEmployeeDocumentFromDB(
        employeeDocumentId,
      );

    const result = await EmployeeDocumentServices.restoreEmployeeDocumentFromDB(
      employeeDocumentId,
      {
        userId: getRequestUserId(req),
        restoreReason: req.body?.restoreReason,
      },
    );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "restore",
      entityId: getAuditEntityId(result, employeeDocumentId),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document restored",
      previousData: toAuditData(previousEmployeeDocument),
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee document restored successfully",
      data: result,
    });
  },
);

export const EmployeeDocumentControllers = {
  createEmployeeDocument,
  getAllEmployeeDocuments,
  getDeletedEmployeeDocuments,
  getSingleEmployeeDocument,
  getEmployeeDocumentsByEmployee,
  getEmployeeDocumentSummary,
  getExpiringEmployeeDocuments,
  updateEmployeeDocument,
  verifyEmployeeDocument,
  rejectEmployeeDocument,
  deleteEmployeeDocument,
  restoreEmployeeDocument,
};

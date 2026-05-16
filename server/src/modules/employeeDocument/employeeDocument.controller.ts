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


const getSingleQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

const getHeaderValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" ? value : undefined;
};

const getTagsFromQuery = (value: unknown): string[] | undefined => {
  const rawValue = getSingleQueryValue(value);

  if (!rawValue) {
    return undefined;
  }

  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const uploadEmployeeDocumentFile = catchAsync(
  async (req: Request, res: Response) => {
    const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const originalFileName =
      getHeaderValue(req.headers["x-file-name"]) ||
      getSingleQueryValue(req.query.fileName) ||
      "employee-document.bin";

    const result =
      await EmployeeDocumentServices.uploadEmployeeDocumentFileIntoDB(
        {
          fileBuffer,
          originalFileName,
          mimeType: getHeaderValue(req.headers["content-type"]),
          metadata: {
            employee: getSingleQueryValue(req.query.employee) as string,
            company: getSingleQueryValue(req.query.company) as string,
            category: getSingleQueryValue(req.query.category) as any,
            title: getSingleQueryValue(req.query.title) as string,
            documentNo: getSingleQueryValue(req.query.documentNo),
            issuingAuthority: getSingleQueryValue(req.query.issuingAuthority),
            issueDate: getSingleQueryValue(req.query.issueDate),
            expiryDate: getSingleQueryValue(req.query.expiryDate),
            confidentiality: getSingleQueryValue(req.query.confidentiality) as any,
            status: getSingleQueryValue(req.query.status) as any,
            remarks: getSingleQueryValue(req.query.remarks),
            tags: getTagsFromQuery(req.query.tags),
          },
        },
        {
          userId: getRequestUserId(req),
        },
      );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: getAuditEntityName(result, ["title", "documentNo", "fileName"]),
      description: "Employee document file uploaded and registered",
      newData: toAuditData(result),
      metadata: {
        originalFileName,
        fileSize: fileBuffer.length,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Employee document file uploaded successfully",
      data: result,
    });
  },
);

const downloadEmployeeDocumentFile = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeDocumentServices.getEmployeeDocumentFileForDownloadFromDB(
        req.params.id as string,
      );

    await createAuditLogFromRequest(req, {
      module: "employee_document",
      action: "download",
      entityId: getAuditEntityId(result.employeeDocument, req.params.id as string),
      entityName: getAuditEntityName(result.employeeDocument, [
        "title",
        "documentNo",
        "fileName",
      ]),
      description: "Employee document file downloaded",
      metadata: {
        fileName: result.file.fileName,
        fileSize: result.file.fileSize,
      },
    });

    res.setHeader("Content-Type", result.file.mimeType);
    res.setHeader("Content-Length", String(result.file.fileSize));

    res.download(result.file.absolutePath, result.file.fileName);
  },
);

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
  uploadEmployeeDocumentFile,
  downloadEmployeeDocumentFile,
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

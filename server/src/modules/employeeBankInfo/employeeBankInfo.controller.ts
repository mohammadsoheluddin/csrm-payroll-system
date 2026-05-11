import type { Request, Response } from "express";
import { getRequestUserId } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { EmployeeBankInfoServices } from "./employeeBankInfo.service";

const createEmployeeBankInfo = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const result = await EmployeeBankInfoServices.createEmployeeBankInfoIntoDB(
      req.body,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bank_info",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: getAuditEntityName(result, [
        "accountName",
        "accountNo",
        "paymentMode",
      ]),
      description: "Employee bank/payment info created",
      previousData: null,
      newData: toAuditData(result),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Employee bank info created successfully",
      data: result,
    });
  },
);

const getAllEmployeeBankInfos = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeBankInfoServices.getAllEmployeeBankInfosFromDB(
      req.query as unknown as Record<string, string>,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bank infos retrieved successfully",
      data: result,
    });
  },
);

const getDeletedEmployeeBankInfos = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await EmployeeBankInfoServices.getDeletedEmployeeBankInfosFromDB(
        req.query as unknown as Record<string, string>,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deleted employee bank infos retrieved successfully",
      data: result,
    });
  },
);

const getSingleEmployeeBankInfo = catchAsync(
  async (req: Request, res: Response) => {
    const employeeBankInfoId = req.params.id as string;

    const result =
      await EmployeeBankInfoServices.getSingleEmployeeBankInfoFromDB(
        employeeBankInfoId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bank info retrieved successfully",
      data: result,
    });
  },
);

const updateEmployeeBankInfo = catchAsync(
  async (req: Request, res: Response) => {
    const employeeBankInfoId = req.params.id as string;

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError(400, "Request body is empty");
    }

    const previousEmployeeBankInfo =
      await EmployeeBankInfoServices.getSingleEmployeeBankInfoFromDB(
        employeeBankInfoId,
      );

    const result = await EmployeeBankInfoServices.updateEmployeeBankInfoIntoDB(
      employeeBankInfoId,
      req.body,
    );

    await createAuditLogFromRequest(req, {
      module: "employee_bank_info",
      action: "update",
      entityId: getAuditEntityId(result, employeeBankInfoId),
      entityName: getAuditEntityName(result, [
        "accountName",
        "accountNo",
        "paymentMode",
      ]),
      description: "Employee bank/payment info updated",
      previousData: toAuditData(previousEmployeeBankInfo),
      newData: toAuditData(result),
      metadata: {
        changedFields: Object.keys(req.body),
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bank info updated successfully",
      data: result,
    });
  },
);

const deleteEmployeeBankInfo = catchAsync(
  async (req: Request, res: Response) => {
    const employeeBankInfoId = req.params.id as string;

    const previousEmployeeBankInfo =
      await EmployeeBankInfoServices.getSingleEmployeeBankInfoFromDB(
        employeeBankInfoId,
      );

    const result =
      await EmployeeBankInfoServices.deleteEmployeeBankInfoFromDB(
        employeeBankInfoId,
        {
          userId: getRequestUserId(req),
          deleteReason: req.body?.deleteReason,
        },
      );

    await createAuditLogFromRequest(req, {
      module: "employee_bank_info",
      action: "soft_delete",
      entityId: getAuditEntityId(result, employeeBankInfoId),
      entityName: getAuditEntityName(result, [
        "accountName",
        "accountNo",
        "paymentMode",
      ]),
      description: "Employee bank/payment info soft deleted",
      previousData: toAuditData(previousEmployeeBankInfo),
      newData: toAuditData(result),
      metadata: {
        deleteReason: req.body?.deleteReason || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bank info deleted successfully",
      data: result,
    });
  },
);

const restoreEmployeeBankInfo = catchAsync(
  async (req: Request, res: Response) => {
    const employeeBankInfoId = req.params.id as string;

    const previousEmployeeBankInfo =
      await EmployeeBankInfoServices.getSingleDeletedEmployeeBankInfoFromDB(
        employeeBankInfoId,
      );

    const result =
      await EmployeeBankInfoServices.restoreEmployeeBankInfoFromDB(
        employeeBankInfoId,
        {
          userId: getRequestUserId(req),
          restoreReason: req.body?.restoreReason,
        },
      );

    await createAuditLogFromRequest(req, {
      module: "employee_bank_info",
      action: "restore",
      entityId: getAuditEntityId(result, employeeBankInfoId),
      entityName: getAuditEntityName(result, [
        "accountName",
        "accountNo",
        "paymentMode",
      ]),
      description: "Employee bank/payment info restored",
      previousData: toAuditData(previousEmployeeBankInfo),
      newData: toAuditData(result),
      metadata: {
        restoreReason: req.body?.restoreReason || null,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee bank info restored successfully",
      data: result,
    });
  },
);

export const EmployeeBankInfoControllers = {
  createEmployeeBankInfo,
  getAllEmployeeBankInfos,
  getDeletedEmployeeBankInfos,
  getSingleEmployeeBankInfo,
  updateEmployeeBankInfo,
  deleteEmployeeBankInfo,
  restoreEmployeeBankInfo,
};

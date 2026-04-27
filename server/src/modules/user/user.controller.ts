import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  getAuditEntityName,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { UserServices } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userEmail = (req as any).user.email;

  const result = await UserServices.getMeFromDB(userEmail);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My profile retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const result = await UserServices.getSingleUserFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(400, "Request body is empty");
  }

  const previousUser = await UserServices.getSingleUserFromDB(userId);

  const result = await UserServices.updateUserIntoDB(userId, req.body);

  // Added: Audit log for user update and role change
  await createAuditLogFromRequest(req, {
    module: "user",
    action: req.body.role ? "role_change" : "update",
    entityId: getAuditEntityId(result, userId),
    entityName: getAuditEntityName(result, ["name", "email"]),
    description: req.body.role
      ? "User role changed"
      : "User information updated",
    previousData: toAuditData(previousUser),
    newData: toAuditData(result),
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const previousUser = await UserServices.getSingleUserFromDB(userId);

  const result = await UserServices.deleteUserFromDB(userId);

  // Added: Audit log for user soft delete
  await createAuditLogFromRequest(req, {
    module: "user",
    action: "soft_delete",
    entityId: getAuditEntityId(result, userId),
    entityName: getAuditEntityName(result, ["name", "email"]),
    description: "User soft deleted",
    previousData: toAuditData(previousUser),
    newData: toAuditData(result),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  getMe,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};

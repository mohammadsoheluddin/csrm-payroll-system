import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AppError from "../errors/AppError";
import Employee from "../modules/employee/employee.model";
import {
  hasPermission,
  TPermission,
  USER_ROLE,
} from "../modules/user/user.constant";

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

export const allowOwnEmployeeOrPermission =
  (employeeParamName: string, ...allowedPermissions: TPermission[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized.");
      }

      const requestedEmployeeId = req.params[employeeParamName];

      if (!requestedEmployeeId) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "Employee ID is required in request params.",
        );
      }

      if (user.role === USER_ROLE.employee) {
        let linkedEmployeeId = user.employeeId ? String(user.employeeId) : "";

        if (!linkedEmployeeId) {
          const searchConditions: Record<string, unknown>[] = [];

          if (user.userId && Types.ObjectId.isValid(user.userId)) {
            searchConditions.push({
              user: new Types.ObjectId(user.userId),
            });
          }

          if (user.email) {
            searchConditions.push({
              email: user.email,
            });
          }

          const linkedEmployee = await Employee.findOne({
            isDeleted: false,
            $or: searchConditions,
          }).select("_id");

          if (linkedEmployee?._id) {
            linkedEmployeeId = String(linkedEmployee._id);
          }
        }

        if (!linkedEmployeeId) {
          throw new AppError(
            HTTP_STATUS.FORBIDDEN,
            "Employee profile is not linked with this user account.",
          );
        }

        if (String(linkedEmployeeId) !== String(requestedEmployeeId)) {
          throw new AppError(
            HTTP_STATUS.FORBIDDEN,
            "You can access only your own employee resource.",
          );
        }

        return next();
      }

      const isAllowed = hasPermission(user.role, allowedPermissions);

      if (!isAllowed) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "You do not have permission to access this employee resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

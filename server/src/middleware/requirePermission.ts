import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { hasPermission, TPermission } from "../modules/user/user.constant";

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

const requirePermission =
  (...requiredPermissions: TPermission[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized.");
      }

      const isAllowed = hasPermission(user.role, requiredPermissions);

      if (!isAllowed) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "You do not have permission to perform this action.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default requirePermission;

import { NextFunction, Request, Response } from "express";
import config from "../app/config";
import AppError from "../errors/AppError";
import { verifyToken } from "../modules/auth/auth.utils";
import { TUserRole, USER_ROLES } from "../modules/user/user.constant";

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

export type TRequestUser = {
  userId: string;
  email: string;
  role: TUserRole;
  employeeId?: string;
};

const auth =
  (...requiredRoles: TUserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized.");
      }

      const token = authorizationHeader.startsWith("Bearer ")
        ? authorizationHeader.split(" ")[1]
        : authorizationHeader;

      if (!token) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized.");
      }

      const decoded = verifyToken(token, config.jwt_access_secret);

      const decodedRole = decoded.role as TUserRole;

      if (!USER_ROLES.includes(decodedRole)) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid token role.");
      }

      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decodedRole,
        employeeId: decoded.employeeId,
      } as TRequestUser;

      if (requiredRoles.length && !requiredRoles.includes(decodedRole)) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "You are forbidden to access this resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;

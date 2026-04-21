import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { verifyToken } from "../modules/auth/auth.utils";

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

type TRequestUser = {
  userId: string;
  email: string;
  role: string;
};

const auth =
  (...requiredRoles: string[]) =>
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

      const decoded = verifyToken(
        token,
        process.env.JWT_ACCESS_SECRET as string,
      );

      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      } as TRequestUser;

      if (
        requiredRoles.length &&
        !requiredRoles.includes((req as any).user.role)
      ) {
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

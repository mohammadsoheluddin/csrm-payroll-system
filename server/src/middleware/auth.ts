import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../app/config";
import AppError from "../errors/AppError";

type TRole = "superAdmin" | "admin" | "hr" | "employee";

const auth = (...requiredRoles: TRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(401, "You are not authorized!");
      }

      const decoded = jwt.verify(token, config.jwt_access_secret) as {
        userId: string;
        role: TRole;
        email: string;
      };

      console.log("Decoded user:", decoded);
      console.log("Required roles:", requiredRoles);

      (req as any).user = decoded;

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(403, "Forbidden access");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

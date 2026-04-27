import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import config from "../app/config";
import AppError from "../errors/AppError";
import handleCastError from "../errors/handleCastError";
import { TErrorSource } from "../interface/error";

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource[] = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  /**
   * Added:
   * Clean Zod validation error response.
   * Without this, Zod validation errors may look unclear in Postman.
   */
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorSources = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.node_env === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;

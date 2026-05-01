import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import config from "../app/config";
import AppError from "../errors/AppError";
import handleCastError from "../errors/handleCastError";
import type { TErrorSource } from "../interface/error";

type TMongooseDuplicateKeyError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
};

const formatZodErrorSources = (err: ZodError): TErrorSource[] => {
  return err.issues.map((issue) => ({
    path: issue.path.length ? issue.path.map(String).join(".") : "root",
    message: issue.message,
  }));
};

const formatMongooseValidationErrorSources = (
  err: mongoose.Error.ValidationError,
): TErrorSource[] => {
  return Object.values(err.errors).map((error) => ({
    path: error.path,
    message: error.message,
  }));
};

const formatDuplicateKeyErrorSources = (
  err: TMongooseDuplicateKeyError,
): TErrorSource[] => {
  const keyValue = err.keyValue || {};

  return Object.keys(keyValue).map((key) => ({
    path: key,
    message: `${key} already exists`,
  }));
};

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource[] = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorSources = formatZodErrorSources(err);
  } else if (err instanceof mongoose.Error.CastError) {
    const simplifiedError = handleCastError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Mongoose validation failed";
    errorSources = formatMongooseValidationErrorSources(err);
  } else if ((err as TMongooseDuplicateKeyError)?.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
    errorSources = formatDuplicateKeyErrorSources(
      err as TMongooseDuplicateKeyError,
    );
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

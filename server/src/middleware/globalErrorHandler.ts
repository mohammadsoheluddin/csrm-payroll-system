import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import config from "../app/config";
import AppError from "../errors/AppError";
import handleCastError from "../errors/handleCastError";
import type { TErrorResponseBody, TErrorSource } from "../interface/error";

type TMongooseDuplicateKeyError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
};

type THttpError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: unknown;
};

const fallbackErrorSource = (message: string): TErrorSource[] => [
  {
    path: "",
    message,
  },
];

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
  const keys = Object.keys(keyValue);

  if (!keys.length) {
    return fallbackErrorSource("Duplicate value already exists");
  }

  return keys.map((key) => ({
    path: key,
    message: `${key} already exists`,
  }));
};

const isJsonSyntaxError = (err: unknown): err is THttpError => {
  const error = err as THttpError;

  return (
    error instanceof SyntaxError &&
    (error.status === 400 || error.statusCode === 400) &&
    "body" in error
  );
};

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource[] = fallbackErrorSource("Something went wrong");

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorSources = formatZodErrorSources(err);
  } else if (isJsonSyntaxError(err)) {
    statusCode = 400;
    message = "Invalid JSON payload";
    errorSources = fallbackErrorSource("Request body contains invalid JSON");
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
    errorSources = err.errorSources?.length
      ? err.errorSources
      : fallbackErrorSource(err.message);
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = fallbackErrorSource(err.message);
  }

  const isProduction = config.node_env === "production";

  if (isProduction && statusCode >= 500) {
    message = "Internal server error";
    errorSources = fallbackErrorSource("Internal server error");
  }

  const responseBody: TErrorResponseBody = {
    success: false,
    message,
    errorSources,
  };

  if (!isProduction && err instanceof Error && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

export default globalErrorHandler;

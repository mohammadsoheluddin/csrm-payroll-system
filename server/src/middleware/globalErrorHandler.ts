import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import config from "../app/config";
import AppError from "../errors/AppError";
import handleCastError from "../errors/handleCastError";
import { TErrorSource } from "../interface/error";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource[] = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof mongoose.Error.CastError) {
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

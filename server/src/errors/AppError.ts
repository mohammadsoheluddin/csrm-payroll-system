import type { TErrorSource } from "../interface/error";

class AppError extends Error {
  public statusCode: number;
  public errorSources?: TErrorSource[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorSources?: TErrorSource[],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorSources = errorSources;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

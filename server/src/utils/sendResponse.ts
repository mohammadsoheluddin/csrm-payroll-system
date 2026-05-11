import { Response } from "express";
import { TMeta } from "../common/types";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data: T;
};

export type TSuccessResponseBody<T> = {
  success: true;
  message: string;
  meta?: TMeta;
  data: T;
};

const getDefaultSuccessMessage = (statusCode: number): string => {
  if (statusCode === 201) {
    return "Resource created successfully";
  }

  if (statusCode === 204) {
    return "Resource processed successfully";
  }

  return "Request completed successfully";
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const responseBody: TSuccessResponseBody<T> = {
    success: true,
    message: data.message || getDefaultSuccessMessage(data.statusCode),
    data: data.data,
  };

  if (data.meta) {
    responseBody.meta = data.meta;
  }

  res.status(data.statusCode).json(responseBody);
};

export default sendResponse;

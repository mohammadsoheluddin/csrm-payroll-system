import { Response } from "express";
import { TMeta } from "../common/types";
import sendResponse from "./sendResponse";

export type TPaginationInput = {
  page?: number | string;
  limit?: number | string;
  total?: number;
};

const toPositiveNumber = (value: number | string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
};

export const buildPaginationMeta = ({
  page,
  limit,
  total = 0,
}: TPaginationInput): TMeta => {
  const normalizedPage = toPositiveNumber(page, 1);
  const normalizedLimit = toPositiveNumber(limit, 10);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total,
  };
};

export const sendOkResponse = <T>(
  res: Response,
  options: {
    message: string;
    data: T;
    meta?: TMeta;
  },
) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: options.message,
    meta: options.meta,
    data: options.data,
  });
};

export const sendCreatedResponse = <T>(
  res: Response,
  options: {
    message: string;
    data: T;
    meta?: TMeta;
  },
) => {
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: options.message,
    meta: options.meta,
    data: options.data,
  });
};

export const sendDeletedResponse = <T>(
  res: Response,
  options: {
    message?: string;
    data: T;
  },
) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: options.message || "Record deleted successfully",
    data: options.data,
  });
};

export const sendRestoredResponse = <T>(
  res: Response,
  options: {
    message?: string;
    data: T;
  },
) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: options.message || "Record restored successfully",
    data: options.data,
  });
};

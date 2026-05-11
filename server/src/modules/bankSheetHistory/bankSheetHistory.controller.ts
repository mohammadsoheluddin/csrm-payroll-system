import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BankSheetHistoryServices } from "./bankSheetHistory.service";

const getSoftDeleteUserIdFromRequest = (req: Request) => {
  const requestUser = (req as Request & {
    user?: {
      userId?: string;
      _id?: string;
      id?: string;
    };
  }).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

const getAllBankSheetHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BankSheetHistoryServices.getAllBankSheetHistoryFromDB(
      req.query,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bank sheet export history retrieved successfully",
      meta: result.meta,
      data: result.result,
    });
  },
);


const getDeletedBankSheetHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await BankSheetHistoryServices.getDeletedBankSheetHistoryFromDB(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deleted Bank Sheet History records retrieved successfully",
    data: result,
  });
});

const deleteBankSheetHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await BankSheetHistoryServices.softDeleteBankSheetHistoryFromDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    deleteReason: req.body?.deleteReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bank Sheet History deleted successfully",
    data: result,
  });
});

const restoreBankSheetHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await BankSheetHistoryServices.restoreBankSheetHistoryIntoDB(req.params.id as string, {
    userId: getSoftDeleteUserIdFromRequest(req),
    restoreReason: req.body?.restoreReason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bank Sheet History restored successfully",
    data: result,
  });
});

export const BankSheetHistoryControllers = {
  getAllBankSheetHistory,

  getDeletedBankSheetHistory,
  deleteBankSheetHistory,
  restoreBankSheetHistory,
};

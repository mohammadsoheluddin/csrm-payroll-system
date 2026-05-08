import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BankSheetHistoryServices } from "./bankSheetHistory.service";

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

export const BankSheetHistoryControllers = {
  getAllBankSheetHistory,
};

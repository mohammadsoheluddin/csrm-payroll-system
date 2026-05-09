import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MonthEndProcessControlServices } from "./monthEndProcessControl.service";

const getMonthEndProcessControlStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await MonthEndProcessControlServices.getMonthEndProcessControlStatusFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Month-end process control status retrieved successfully",
      data: result,
    });
  },
);

const getMonthEndProcessChecklist = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await MonthEndProcessControlServices.getMonthEndProcessChecklistFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Month-end process checklist retrieved successfully",
      data: result,
    });
  },
);

export const MonthEndProcessControlControllers = {
  getMonthEndProcessControlStatus,
  getMonthEndProcessChecklist,
};

import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReportLayoutStandardServices } from "./reportLayoutStandard.service";

const getReportLayoutStandards = catchAsync(
  async (req: Request, res: Response) => {
    const result = ReportLayoutStandardServices.getReportLayoutStandardsFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report layout standards retrieved successfully",
      data: result,
    });
  },
);

const getSingleReportLayoutStandard = catchAsync(
  async (req: Request, res: Response) => {
    const result = ReportLayoutStandardServices.getSingleReportLayoutStandardFromDB(
      req.params.reportKey as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report layout standard retrieved successfully",
      data: result,
    });
  },
);

const getReportExportFormatStandards = catchAsync(
  async (_req: Request, res: Response) => {
    const result = ReportLayoutStandardServices.getReportExportFormatStandardsFromDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report export format standards retrieved successfully",
      data: result,
    });
  },
);

export const ReportLayoutStandardControllers = {
  getReportLayoutStandards,
  getSingleReportLayoutStandard,
  getReportExportFormatStandards,
};

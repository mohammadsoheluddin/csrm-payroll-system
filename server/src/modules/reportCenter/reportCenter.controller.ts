import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReportCenterServices } from "./reportCenter.service";

const getReportCatalog = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportCenterServices.getReportCatalogFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Center catalog retrieved successfully",
    data: result,
  });
});

const getReportCenterDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReportCenterServices.getReportCenterDashboardFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report Center dashboard retrieved successfully",
      data: result,
    });
  },
);

const getReportReadiness = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportCenterServices.getReportReadinessFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Center readiness retrieved successfully",
    data: result,
  });
});

const getReportQuickLinks = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportCenterServices.getReportQuickLinksFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Center quick links retrieved successfully",
    data: result,
  });
});

export const ReportCenterControllers = {
  getReportCatalog,
  getReportCenterDashboard,
  getReportReadiness,
  getReportQuickLinks,
};

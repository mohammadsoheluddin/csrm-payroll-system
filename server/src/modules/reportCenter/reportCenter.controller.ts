import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  createAuditLogFromRequest,
  getAuditEntityId,
  toAuditData,
} from "../auditLog/auditLog.utils";
import { ReportCenterServices } from "./reportCenter.service";

const getUserIdFromRequest = (req: Request) => {
  const requestUser = (
    req as Request & {
      user?: {
        userId?: string;
        _id?: string;
        id?: string;
      };
    }
  ).user;

  return requestUser?.userId || requestUser?._id || requestUser?.id || "";
};

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

const getReportExportRoute = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportCenterServices.getReportExportRouteFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Center export route resolved successfully",
    data: result,
  });
});

const createSavedReportConfig = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const result = await ReportCenterServices.createSavedReportConfigIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "report_center",
      action: "create",
      entityId: getAuditEntityId(result),
      entityName: result.configName,
      description: "Report Center saved configuration created",
      previousData: null,
      newData: toAuditData(result),
      metadata: {
        reportId: result.reportId,
        defaultFormat: result.defaultFormat,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Report Center saved configuration created successfully",
      data: result,
    });
  },
);

const getSavedReportConfigs = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReportCenterServices.getSavedReportConfigsFromDB(
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report Center saved configurations retrieved successfully",
      data: result,
    });
  },
);

const getSingleSavedReportConfig = catchAsync(
  async (req: Request, res: Response) => {
    const configId = req.params.id as string;
    const result = await ReportCenterServices.getSingleSavedReportConfigFromDB(
      configId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report Center saved configuration retrieved successfully",
      data: result,
    });
  },
);

const updateSavedReportConfig = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const configId = req.params.id as string;
    const previousRecord = await ReportCenterServices.getSingleSavedReportConfigFromDB(
      configId,
    );
    const result = await ReportCenterServices.updateSavedReportConfigIntoDB(
      configId,
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "report_center",
      action: "update",
      entityId: getAuditEntityId(result, configId),
      entityName: result.configName,
      description: "Report Center saved configuration updated",
      previousData: toAuditData(previousRecord),
      newData: toAuditData(result),
      metadata: {
        reportId: result.reportId,
        defaultFormat: result.defaultFormat,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report Center saved configuration updated successfully",
      data: result,
    });
  },
);

const deleteSavedReportConfig = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const configId = req.params.id as string;
    const previousRecord = await ReportCenterServices.getSingleSavedReportConfigFromDB(
      configId,
    );
    const result = await ReportCenterServices.deleteSavedReportConfigFromDB(
      configId,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "report_center",
      action: "soft_delete",
      entityId: getAuditEntityId(result, configId),
      entityName: result.configName,
      description: "Report Center saved configuration deleted",
      previousData: toAuditData(previousRecord),
      newData: toAuditData(result),
      metadata: {
        reportId: result.reportId,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report Center saved configuration deleted successfully",
      data: result,
    });
  },
);

const getSavedReportConfigExportRoute = catchAsync(
  async (req: Request, res: Response) => {
    const configId = req.params.id as string;
    const result = await ReportCenterServices.getSavedReportConfigExportRouteFromDB(
      configId,
      req.query as any,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Saved report configuration export route resolved successfully",
      data: result,
    });
  },
);

export const ReportCenterControllers = {
  getReportCatalog,
  getReportCenterDashboard,
  getReportReadiness,
  getReportQuickLinks,
  getReportExportRoute,
  createSavedReportConfig,
  getSavedReportConfigs,
  getSingleSavedReportConfig,
  updateSavedReportConfig,
  deleteSavedReportConfig,
  getSavedReportConfigExportRoute,
};

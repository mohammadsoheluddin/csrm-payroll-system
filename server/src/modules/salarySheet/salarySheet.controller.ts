import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { SalarySheetServices } from "./salarySheet.service";

const getParamId = (req: Request, paramName: string) => {
  const value = req.params[paramName];

  return Array.isArray(value) ? value[0] : value;
};

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

const generateMonthlySalarySheet = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalarySheetServices.generateMonthlySalarySheetIntoDB(
      req.body,
      userId,
    );

    await createAuditLogFromRequest(req, {
      module: "salary_sheet",
      action: "process",
      entityName: result.payrollMonth,
      description:
        "Monthly Salary Sheet generated from locked attendance finalization",
      previousData: null,
      newData: null,
      metadata: {
        filters: result.filters,
        totals: result.totals,
        attendanceFinalizationReadiness: result.attendanceFinalizationReadiness,
        totalGenerated: result.totalGenerated,
        totalRegenerated: result.totalRegenerated,
        totalSkipped: result.totalSkipped,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly Salary Sheet generated successfully",
      data: result,
    });
  },
);

const getAllSalarySheets = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySheetServices.getAllSalarySheetsFromDB(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheets retrieved successfully",
    data: result,
  });
});

const getSingleSalarySheet = catchAsync(async (req: Request, res: Response) => {
  const result = await SalarySheetServices.getSingleSalarySheetFromDB(
    getParamId(req, "id"),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheet retrieved successfully",
    data: result,
  });
});

const getSalarySheetOperationalSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SalarySheetServices.getSalarySheetOperationalSummaryFromDB(
        req.query as any,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Sheet operational summary retrieved successfully",
      data: result,
    });
  },
);


const createSalarySheetBulkAudit = async ({
  req,
  action,
  description,
  result,
}: {
  req: Request;
  action: "process" | "approve" | "lock" | "unlock";
  description: string;
  result: any;
}) => {
  await createAuditLogFromRequest(req, {
    module: "salary_sheet",
    action,
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      filters: result.filters,
      summary: result.summary,
      salaryStatementReadiness: result.salaryStatementReadiness,
    },
  });
};

const bulkProcessSalarySheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalarySheetServices.bulkProcessSalarySheetsIntoDB(
      req.body,
      userId,
    );

    await createSalarySheetBulkAudit({
      req,
      action: "process",
      description: "Salary Sheets bulk processed",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Sheets bulk processed successfully",
      data: result,
    });
  },
);

const bulkApproveSalarySheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalarySheetServices.bulkApproveSalarySheetsIntoDB(
      req.body,
      userId,
    );

    await createSalarySheetBulkAudit({
      req,
      action: "approve",
      description: "Salary Sheets bulk approved",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Sheets bulk approved successfully",
      data: result,
    });
  },
);

const bulkLockSalarySheets = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalarySheetServices.bulkLockSalarySheetsIntoDB(
    req.body,
    userId,
  );

  await createSalarySheetBulkAudit({
    req,
    action: "lock",
    description: "Salary Sheets bulk locked for Salary Statement processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheets bulk locked successfully",
    data: result,
  });
});

const bulkUnlockSalarySheets = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await SalarySheetServices.bulkUnlockSalarySheetsIntoDB(
      req.body,
      userId,
    );

    await createSalarySheetBulkAudit({
      req,
      action: "unlock",
      description: "Salary Sheets bulk unlocked",
      result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Salary Sheets bulk unlocked successfully",
      data: result,
    });
  },
);

const createSalarySheetAudit = async ({
  req,
  action,
  description,
  result,
}: {
  req: Request;
  action: "process" | "approve" | "lock" | "unlock";
  description: string;
  result: any;
}) => {
  await createAuditLogFromRequest(req, {
    module: "salary_sheet",
    action,
    entityId: getParamId(req, "id"),
    entityName: result.payrollMonth,
    description,
    previousData: null,
    newData: null,
    metadata: {
      status: result.status,
      isLocked: result.isLocked,
      grossSalary: result.grossSalary,
      attendanceDeduction: result.attendanceDeduction,
      payableSalary: result.payableSalary,
    },
  });
};

const processSalarySheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalarySheetServices.processSalarySheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createSalarySheetAudit({
    req,
    action: "process",
    description: "Salary Sheet processed",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheet processed successfully",
    data: result,
  });
});

const approveSalarySheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalarySheetServices.approveSalarySheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createSalarySheetAudit({
    req,
    action: "approve",
    description: "Salary Sheet approved",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheet approved successfully",
    data: result,
  });
});

const lockSalarySheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalarySheetServices.lockSalarySheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createSalarySheetAudit({
    req,
    action: "lock",
    description: "Salary Sheet locked for Salary Statement processing",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheet locked successfully",
    data: result,
  });
});

const unlockSalarySheet = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const result = await SalarySheetServices.unlockSalarySheetIntoDB(
    getParamId(req, "id"),
    req.body,
    userId,
  );

  await createSalarySheetAudit({
    req,
    action: "unlock",
    description: "Salary Sheet unlocked",
    result,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Salary Sheet unlocked successfully",
    data: result,
  });
});

export const SalarySheetControllers = {
  generateMonthlySalarySheet,
  getAllSalarySheets,
  getSingleSalarySheet,
  getSalarySheetOperationalSummary,
  bulkProcessSalarySheets,
  bulkApproveSalarySheets,
  bulkLockSalarySheets,
  bulkUnlockSalarySheets,
  processSalarySheet,
  approveSalarySheet,
  lockSalarySheet,
  unlockSalarySheet,
};

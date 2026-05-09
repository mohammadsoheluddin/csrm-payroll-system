import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createAuditLogFromRequest } from "../auditLog/auditLog.utils";
import { PayrollGenerateService } from "./payroll.generate.service";

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

const generateMonthlyPayroll = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await PayrollGenerateService.generateMonthlyPayrollFromDB({
      month: req.body.month,
      year: req.body.year,
      company: req.body.company,
      actionBy: userId,
    });

    await createAuditLogFromRequest(req, {
      module: "payroll",
      action: "create",
      entityName: result.payrollMonth,
      description: "Monthly payroll generated",
      previousData: null,
      newData: {
        payrollMonth: result.payrollMonth,
        totalEmployees: result.totalEmployees,
        totalGenerated: result.totalGenerated,
        totalSkipped: result.totalSkipped,
        attendanceFinalizationReadiness:
          result.attendanceFinalizationReadiness,
      },
      metadata: {
        payrollMonth: result.payrollMonth,
        totalEmployees: result.totalEmployees,
        totalGenerated: result.totalGenerated,
        totalSkipped: result.totalSkipped,
        attendanceFinalizationReadiness:
          result.attendanceFinalizationReadiness,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly payroll generated successfully",
      data: result,
    });
  },
);

export const PayrollGenerateController = {
  generateMonthlyPayroll,
};

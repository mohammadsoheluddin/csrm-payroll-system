import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EmployeeProfileServices } from "./employeeProfile.service";

const getEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployeeProfileServices.getEmployeeProfileFromDB(
    req.params.employeeRef as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee profile retrieved successfully",
    data: result,
  });
});

const getEmployeeProfileSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeProfileServices.getEmployeeProfileSummaryFromDB(
      req.params.employeeRef as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee profile summary retrieved successfully",
      data: result,
    });
  },
);

export const EmployeeProfileControllers = {
  getEmployeeProfile,
  getEmployeeProfileSummary,
};

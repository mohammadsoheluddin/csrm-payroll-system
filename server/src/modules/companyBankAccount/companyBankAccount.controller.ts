import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { CompanyBankAccountServices } from "./companyBankAccount.service";

const createCompanyBankAccount = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await CompanyBankAccountServices.createCompanyBankAccountIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Company bank account created successfully",
      data: result,
    });
  },
);

const getAllCompanyBankAccounts = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await CompanyBankAccountServices.getAllCompanyBankAccountsFromDB(
        req.query,
      );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Company bank accounts retrieved successfully",
      data: result,
    });
  },
);

const getSingleCompanyBankAccount = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const result =
      await CompanyBankAccountServices.getSingleCompanyBankAccountFromDB(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Company bank account retrieved successfully",
      data: result,
    });
  },
);

const updateCompanyBankAccount = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const result =
      await CompanyBankAccountServices.updateCompanyBankAccountIntoDB(
        id,
        req.body,
      );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Company bank account updated successfully",
      data: result,
    });
  },
);

const deleteCompanyBankAccount = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const result =
      await CompanyBankAccountServices.deleteCompanyBankAccountFromDB(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Company bank account deleted successfully",
      data: result,
    });
  },
);

export const CompanyBankAccountControllers = {
  createCompanyBankAccount,
  getAllCompanyBankAccounts,
  getSingleCompanyBankAccount,
  updateCompanyBankAccount,
  deleteCompanyBankAccount,
};

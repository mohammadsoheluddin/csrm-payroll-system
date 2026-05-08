import httpStatus = require("http-status");
import mongoose from "mongoose";

import AppError from "../../errors/AppError";

import Employee from "../employee/employee.model";
import Company from "../company/company.model";

import { TEmployeeBankInfo } from "./employeeBankInfo.interface";
import EmployeeBankInfo from "./employeeBankInfo.model";

const createEmployeeBankInfo = async (
  payload: TEmployeeBankInfo,
  createdBy?: mongoose.Types.ObjectId,
) => {
  const employee = await Employee.findById(payload.employee);

  if (!employee) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee not found");
  }

  const company = await Company.findById(payload.company);

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  /**
   * =====================================================
   * Duplicate Prevention Logic
   * =====================================================
   */

  if (payload.paymentMode === "bank") {
    const existingBankInfo = await EmployeeBankInfo.findOne({
      employee: payload.employee,
      paymentMode: "bank",
      bankName: payload.bankName,
      bankBranchCode: payload.bankBranchCode,
      accountNo: payload.accountNo,
      processBankBranchNo: payload.processBankBranchNo,
      isDeleted: false,
    });

    if (existingBankInfo) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same bank account information already exists for this employee",
      );
    }
  }

  if (payload.paymentMode === "mobile_banking") {
    const existingMobileInfo = await EmployeeBankInfo.findOne({
      employee: payload.employee,
      paymentMode: "mobile_banking",
      mobileBankingProvider: payload.mobileBankingProvider,
      mobileBankingNo: payload.mobileBankingNo,
      isDeleted: false,
    });

    if (existingMobileInfo) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same mobile banking information already exists for this employee",
      );
    }
  }

  if (payload.paymentMode === "cash") {
    const existingCashInfo = await EmployeeBankInfo.findOne({
      employee: payload.employee,
      paymentMode: "cash",
      cashPayReason: payload.cashPayReason,
      isDeleted: false,
    });

    if (existingCashInfo) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same cash payment setup already exists for this employee",
      );
    }
  }

  /**
   * =====================================================
   * Primary Logic
   * =====================================================
   */

  const existingPrimary = await EmployeeBankInfo.findOne({
    employee: payload.employee,
    isPrimary: true,
    isDeleted: false,
    status: "active",
  });

  let isPrimary = false;

  /**
   * First active payment info
   */
  if (!existingPrimary && payload.status === "active") {
    isPrimary = true;
  }

  /**
   * Explicit primary request
   */
  if (payload.isPrimary === true) {
    isPrimary = true;

    await EmployeeBankInfo.updateMany(
      {
        employee: payload.employee,
        isPrimary: true,
      },
      {
        $set: {
          isPrimary: false,
        },
      },
    );
  }

  const result = await EmployeeBankInfo.create({
    ...payload,
    isPrimary,
    createdBy,
  });

  return result;
};

const getAllEmployeeBankInfos = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.employee) {
    filter.employee = query.employee;
  }

  if (query.company) {
    filter.company = query.company;
  }

  if (query.paymentMode) {
    filter.paymentMode = query.paymentMode;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const result = await EmployeeBankInfo.find(filter)
    .populate("employee")
    .populate("company")
    .sort({ createdAt: -1 });

  return result;
};

const getSingleEmployeeBankInfo = async (id: string) => {
  const result = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("company");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee bank info not found");
  }

  return result;
};

const updateEmployeeBankInfo = async (
  id: string,
  payload: Partial<TEmployeeBankInfo>,
) => {
  const existingData = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingData) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee bank info not found");
  }

  /**
   * =====================================================
   * Duplicate Check During Update
   * =====================================================
   */

  const employee = payload.employee || existingData.employee;

  const paymentMode = payload.paymentMode || existingData.paymentMode;

  if (paymentMode === "bank") {
    const duplicateBank = await EmployeeBankInfo.findOne({
      _id: { $ne: id },
      employee,
      paymentMode: "bank",
      bankName: payload.bankName || existingData.bankName,
      bankBranchCode: payload.bankBranchCode || existingData.bankBranchCode,
      accountNo: payload.accountNo || existingData.accountNo,
      processBankBranchNo:
        payload.processBankBranchNo || existingData.processBankBranchNo,
      isDeleted: false,
    });

    if (duplicateBank) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same bank account information already exists for this employee",
      );
    }
  }

  if (paymentMode === "mobile_banking") {
    const duplicateMobile = await EmployeeBankInfo.findOne({
      _id: { $ne: id },
      employee,
      paymentMode: "mobile_banking",
      mobileBankingProvider:
        payload.mobileBankingProvider || existingData.mobileBankingProvider,
      mobileBankingNo: payload.mobileBankingNo || existingData.mobileBankingNo,
      isDeleted: false,
    });

    if (duplicateMobile) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same mobile banking information already exists for this employee",
      );
    }
  }

  if (paymentMode === "cash") {
    const duplicateCash = await EmployeeBankInfo.findOne({
      _id: { $ne: id },
      employee,
      paymentMode: "cash",
      cashPayReason: payload.cashPayReason || existingData.cashPayReason,
      isDeleted: false,
    });

    if (duplicateCash) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Same cash payment setup already exists for this employee",
      );
    }
  }

  /**
   * =====================================================
   * Primary Update Logic
   * =====================================================
   */

  if (payload.isPrimary === true) {
    await EmployeeBankInfo.updateMany(
      {
        employee,
        _id: { $ne: id },
        isPrimary: true,
      },
      {
        $set: {
          isPrimary: false,
        },
      },
    );
  }

  const result = await EmployeeBankInfo.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteEmployeeBankInfo = async (id: string) => {
  const existingData = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingData) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee bank info not found");
  }

  const result = await EmployeeBankInfo.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      isPrimary: false,
    },
    {
      new: true,
    },
  );

  /**
   * If deleted record was primary,
   * assign another active payment info as primary
   */

  if (existingData.isPrimary) {
    const anotherActiveInfo = await EmployeeBankInfo.findOne({
      employee: existingData.employee,
      isDeleted: false,
      status: "active",
    });

    if (anotherActiveInfo) {
      await EmployeeBankInfo.findByIdAndUpdate(anotherActiveInfo._id, {
        isPrimary: true,
      });
    }
  }

  return result;
};

export const EmployeeBankInfoServices = {
  createEmployeeBankInfo,
  getAllEmployeeBankInfos,
  getSingleEmployeeBankInfo,
  updateEmployeeBankInfo,
  deleteEmployeeBankInfo,
};

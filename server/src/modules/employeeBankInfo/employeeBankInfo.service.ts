import mongoose from "mongoose";

import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  getObjectIdStringOrThrow,
  normalizeSoftDeleteReason,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";

import Company from "../company/company.model";
import Employee from "../employee/employee.model";

import { TEmployeeBankInfo } from "./employeeBankInfo.interface";
import EmployeeBankInfo from "./employeeBankInfo.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

type TEmployeeBankInfoQuery = Record<string, unknown>;

type TSoftDeleteOptions = {
  userId?: string;
  deleteReason?: string;
};

type TRestoreOptions = {
  userId?: string;
  restoreReason?: string;
};

const buildEmployeeBankInfoQuery = (
  query: TEmployeeBankInfoQuery = {},
  includeDeleted = false,
) => {
  const filter: Record<string, unknown> = includeDeleted
    ? buildDeletedFilter()
    : { isDeleted: { $ne: true } };

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

  if (query.isPrimary === "true") {
    filter.isPrimary = true;
  }

  if (query.isPrimary === "false") {
    filter.isPrimary = false;
  }

  return filter;
};

const checkEmployeeAndCompany = async (payload: {
  employee?: unknown;
  company?: unknown;
}) => {
  const employeeId = getObjectIdStringOrThrow(payload.employee, "employee id");
  const companyId = getObjectIdStringOrThrow(payload.company, "company id");

  const [employee, company] = await Promise.all([
    Employee.findOne({ _id: employeeId, isDeleted: { $ne: true } }),
    Company.findOne({ _id: companyId, isDeleted: { $ne: true } }),
  ]);

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  if (!company) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company not found");
  }
};

const ensureNoDuplicatePaymentInfo = async (
  payload: Partial<TEmployeeBankInfo>,
  excludeId?: string,
) => {
  const employee = payload.employee;
  const paymentMode = payload.paymentMode;

  if (!employee || !paymentMode) {
    return;
  }

  const baseFilter: Record<string, unknown> = {
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    employee,
    paymentMode,
    isDeleted: { $ne: true },
  };

  if (paymentMode === "bank") {
    const existingBankInfo = await EmployeeBankInfo.findOne({
      ...baseFilter,
      bankName: payload.bankName,
      bankBranchCode: payload.bankBranchCode,
      accountNo: payload.accountNo,
      processBankBranchNo: payload.processBankBranchNo,
    });

    if (existingBankInfo) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Same bank account information already exists for this employee",
      );
    }
  }

  if (paymentMode === "mobile_banking") {
    const existingMobileInfo = await EmployeeBankInfo.findOne({
      ...baseFilter,
      mobileBankingProvider: payload.mobileBankingProvider,
      mobileBankingNo: payload.mobileBankingNo,
    });

    if (existingMobileInfo) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Same mobile banking information already exists for this employee",
      );
    }
  }

  if (paymentMode === "cash") {
    const existingCashInfo = await EmployeeBankInfo.findOne({
      ...baseFilter,
      cashPayReason: payload.cashPayReason,
    });

    if (existingCashInfo) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Same cash payment setup already exists for this employee",
      );
    }
  }
};

const assignFallbackPrimaryPaymentInfo = async (employeeId: unknown) => {
  const employeeObjectId = getObjectIdStringOrThrow(employeeId, "employee id");

  const anotherActiveInfo = await EmployeeBankInfo.findOne({
    employee: employeeObjectId,
    isDeleted: { $ne: true },
    status: "active",
  }).sort({
    effectiveFrom: -1,
    createdAt: -1,
  });

  if (anotherActiveInfo) {
    await EmployeeBankInfo.findByIdAndUpdate((anotherActiveInfo as any)._id, {
      isPrimary: true,
    });
  }
};

const createEmployeeBankInfoIntoDB = async (
  payload: TEmployeeBankInfo,
  _createdBy?: mongoose.Types.ObjectId,
) => {
  await checkEmployeeAndCompany(payload);
  await ensureNoDuplicatePaymentInfo(payload);

  const existingPrimary = await EmployeeBankInfo.findOne({
    employee: payload.employee,
    isPrimary: true,
    isDeleted: { $ne: true },
    status: "active",
  });

  let isPrimary = false;

  if (!existingPrimary && payload.status !== "inactive") {
    isPrimary = true;
  }

  if (payload.isPrimary === true) {
    isPrimary = true;

    await EmployeeBankInfo.updateMany(
      {
        employee: payload.employee,
        isPrimary: true,
        isDeleted: { $ne: true },
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
    isDeleted: false,
  });

  return result;
};

const getAllEmployeeBankInfosFromDB = async (
  query: TEmployeeBankInfoQuery,
) => {
  const result = await EmployeeBankInfo.find(buildEmployeeBankInfoQuery(query))
    .populate("employee")
    .populate("company")
    .sort({ createdAt: -1 });

  return result;
};

const getDeletedEmployeeBankInfosFromDB = async (
  query: TEmployeeBankInfoQuery,
) => {
  const result = await EmployeeBankInfo.find(
    buildEmployeeBankInfoQuery(query, true),
  )
    .populate("employee")
    .populate("company")
    .populate("deletedBy", "name email role")
    .populate("restoredBy", "name email role")
    .sort({ deletedAt: -1, createdAt: -1 });

  return result;
};

const getSingleEmployeeBankInfoFromDB = async (id: string) => {
  const result = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: { $ne: true },
  })
    .populate("employee")
    .populate("company");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee bank info not found");
  }

  return result;
};

const getSingleDeletedEmployeeBankInfoFromDB = async (id: string) => {
  const result = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: true,
  })
    .populate("employee")
    .populate("company")
    .populate("deletedBy", "name email role")
    .populate("restoredBy", "name email role");

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Deleted employee bank info not found",
    );
  }

  return result;
};

const updateEmployeeBankInfoIntoDB = async (
  id: string,
  payload: Partial<TEmployeeBankInfo>,
) => {
  const existingData = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!existingData) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee bank info not found");
  }

  const employee = payload.employee || existingData.employee;
  const company = payload.company || existingData.company;

  await checkEmployeeAndCompany({ employee, company });

  const mergedPayload: Partial<TEmployeeBankInfo> = {
    employee,
    company,
    paymentMode: payload.paymentMode || existingData.paymentMode,
    bankName: payload.bankName ?? existingData.bankName,
    bankBranchCode: payload.bankBranchCode ?? existingData.bankBranchCode,
    accountNo: payload.accountNo ?? existingData.accountNo,
    processBankBranchNo:
      payload.processBankBranchNo ?? existingData.processBankBranchNo,
    mobileBankingProvider:
      payload.mobileBankingProvider ?? existingData.mobileBankingProvider,
    mobileBankingNo: payload.mobileBankingNo ?? existingData.mobileBankingNo,
    cashPayReason: payload.cashPayReason ?? existingData.cashPayReason,
  };

  await ensureNoDuplicatePaymentInfo(mergedPayload, id);

  if (payload.isPrimary === true) {
    await EmployeeBankInfo.updateMany(
      {
        employee,
        _id: { $ne: id },
        isPrimary: true,
        isDeleted: { $ne: true },
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

const deleteEmployeeBankInfoFromDB = async (
  id: string,
  options: TSoftDeleteOptions = {},
) => {
  const existingData = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!existingData) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee bank info not found");
  }

  const result = await EmployeeBankInfo.findByIdAndUpdate(
    id,
    {
      ...buildSoftDeleteUpdate({
        userId: options.userId,
        deleteReason: normalizeSoftDeleteReason(options.deleteReason),
      }),
      $set: {
        ...buildSoftDeleteUpdate({
          userId: options.userId,
          deleteReason: normalizeSoftDeleteReason(options.deleteReason),
        }).$set,
        isPrimary: false,
      },
    },
    {
      new: true,
    },
  );

  if (existingData.isPrimary) {
    await assignFallbackPrimaryPaymentInfo(existingData.employee);
  }

  return result;
};

const restoreEmployeeBankInfoFromDB = async (
  id: string,
  options: TRestoreOptions = {},
) => {
  const existingData = await EmployeeBankInfo.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!existingData) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Deleted employee bank info not found",
    );
  }

  await checkEmployeeAndCompany({
    employee: existingData.employee,
    company: existingData.company,
  });

  await ensureNoDuplicatePaymentInfo(existingData, id);

  const existingPrimary = await EmployeeBankInfo.findOne({
    employee: existingData.employee,
    isPrimary: true,
    isDeleted: { $ne: true },
    status: "active",
  });

  const shouldBecomePrimary = !existingPrimary && existingData.status !== "inactive";

  const result = await EmployeeBankInfo.findByIdAndUpdate(
    id,
    {
      ...buildRestoreUpdate({
        userId: options.userId,
        restoreReason: normalizeSoftDeleteReason(options.restoreReason),
      }),
      $set: {
        ...buildRestoreUpdate({
          userId: options.userId,
          restoreReason: normalizeSoftDeleteReason(options.restoreReason),
        }).$set,
        isPrimary: shouldBecomePrimary,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("employee")
    .populate("company");

  return result;
};

export const EmployeeBankInfoServices = {
  createEmployeeBankInfoIntoDB,
  getAllEmployeeBankInfosFromDB,
  getDeletedEmployeeBankInfosFromDB,
  getSingleEmployeeBankInfoFromDB,
  getSingleDeletedEmployeeBankInfoFromDB,
  updateEmployeeBankInfoIntoDB,
  deleteEmployeeBankInfoFromDB,
  restoreEmployeeBankInfoFromDB,
};

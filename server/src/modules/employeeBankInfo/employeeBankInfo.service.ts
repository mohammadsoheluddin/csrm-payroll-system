import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import Employee from "../employee/employee.model";
import type {
  TEmployeeBankInfo,
  TEmployeeBankInfoStatus,
  TEmployeePaymentMode,
} from "./employeeBankInfo.interface";
import EmployeeBankInfo from "./employeeBankInfo.model";

type TEmployeeBankInfoQueryFilters = {
  employee?: string;
  company?: string;
  paymentMode?: string;
  status?: string;
  isPrimary?: string;
};

type TEmployeeBankInfoDBQuery = {
  isDeleted: boolean;
  employee?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  paymentMode?: TEmployeePaymentMode;
  status?: TEmployeeBankInfoStatus;
  isPrimary?: boolean;
};

type TCreateEmployeeBankInfoPayload = Omit<
  TEmployeeBankInfo,
  "employee" | "company"
> & {
  employee: string | mongoose.Types.ObjectId;
  company: string | mongoose.Types.ObjectId;
};

type TUpdateEmployeeBankInfoPayload = Partial<
  Omit<TEmployeeBankInfo, "employee" | "company">
> & {
  employee?: string | mongoose.Types.ObjectId;
  company?: string | mongoose.Types.ObjectId;
};

type TResolvedEmployeeCompany = {
  employeeObjectId: mongoose.Types.ObjectId;
  companyObjectId: mongoose.Types.ObjectId;
};

const toObjectId = (value: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(String(value));
};

const getStringQueryValue = (
  query: TEmployeeBankInfoQueryFilters,
  key: keyof TEmployeeBankInfoQueryFilters,
): string | undefined => {
  const value = query[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
};

const getRequiredText = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const ensureEmployeeAndCompany = async (
  employeeId: unknown,
  companyId: unknown,
): Promise<TResolvedEmployeeCompany> => {
  const employeeObjectId = toObjectId(employeeId, "employee ID");
  const companyObjectId = toObjectId(companyId, "company ID");

  const company = await Company.findOne({
    _id: companyObjectId,
    isDeleted: false,
    status: "active",
  });

  if (!company) {
    throw new AppError(404, "Company not found");
  }

  const employee = await Employee.findOne({
    _id: employeeObjectId,
    isDeleted: false,
    status: "active",
  });

  if (!employee) {
    throw new AppError(404, "Active employee not found");
  }

  const employeeCompany = String(employee.company);

  if (employeeCompany !== String(companyObjectId)) {
    throw new AppError(400, "Employee does not belong to this company");
  }

  return {
    employeeObjectId,
    companyObjectId,
  };
};

const validatePaymentModeDetails = (payload: Partial<TEmployeeBankInfo>) => {
  if (payload.paymentMode === "bank") {
    const requiredFields = [
      {
        key: "accountName",
        label: "Account name",
        value: payload.accountName,
      },
      {
        key: "bankName",
        label: "Bank name",
        value: payload.bankName,
      },
      {
        key: "bankBranchName",
        label: "Bank branch name",
        value: payload.bankBranchName,
      },
      {
        key: "bankBranchCode",
        label: "Bank branch code",
        value: payload.bankBranchCode,
      },
      {
        key: "accountNo",
        label: "Account no",
        value: payload.accountNo,
      },
      {
        key: "processBankBranchNo",
        label: "Process bank branch no",
        value: payload.processBankBranchNo,
      },
    ];

    const missingField = requiredFields.find(
      (field) => !getRequiredText(field.value),
    );

    if (missingField) {
      throw new AppError(
        400,
        `${missingField.label} is required for bank payment`,
      );
    }
  }

  if (payload.paymentMode === "mobile_banking") {
    if (!payload.mobileBankingProvider) {
      throw new AppError(
        400,
        "Mobile banking provider is required for mobile banking payment",
      );
    }

    if (!getRequiredText(payload.mobileBankingNo)) {
      throw new AppError(
        400,
        "Mobile banking no is required for mobile banking payment",
      );
    }
  }

  if (payload.paymentMode === "cash") {
    if (!getRequiredText(payload.cashPayReason)) {
      throw new AppError(400, "Cash pay reason is required for cash payment");
    }
  }

  if (payload.effectiveFrom && payload.effectiveTo) {
    const effectiveFrom = new Date(payload.effectiveFrom);
    const effectiveTo = new Date(payload.effectiveTo);

    if (effectiveTo < effectiveFrom) {
      throw new AppError(400, "Effective to cannot be before effective from");
    }
  }
};

const clearOtherPrimaryPaymentInfos = async (
  employee: mongoose.Types.ObjectId,
  excludeId?: string,
) => {
  await EmployeeBankInfo.updateMany(
    {
      employee,
      isDeleted: false,
      isPrimary: true,
      ...(excludeId
        ? {
            _id: {
              $ne: toObjectId(excludeId, "employee bank info ID"),
            },
          }
        : {}),
    },
    {
      isPrimary: false,
    },
  );
};

const populateEmployeeBankInfoQuery = () => [
  {
    path: "employee",
    select:
      "employeeId officeId cardNo name email phone company majorDepartment department designation branch employmentStatus status",
    populate: [
      {
        path: "company",
      },
      {
        path: "majorDepartment",
      },
      {
        path: "department",
      },
      {
        path: "designation",
      },
      {
        path: "branch",
      },
    ],
  },
  {
    path: "company",
  },
];

const createEmployeeBankInfoIntoDB = async (
  payload: TCreateEmployeeBankInfoPayload,
) => {
  const { employeeObjectId, companyObjectId } = await ensureEmployeeAndCompany(
    payload.employee,
    payload.company,
  );

  const isPrimary = payload.isPrimary ?? true;
  const status = payload.status ?? "active";

  validatePaymentModeDetails({
    ...payload,
    employee: employeeObjectId,
    company: companyObjectId,
    isPrimary,
    status,
  });

  if (isPrimary && status === "active") {
    await clearOtherPrimaryPaymentInfos(employeeObjectId);
  }

  const result = await EmployeeBankInfo.create({
    ...payload,
    employee: employeeObjectId,
    company: companyObjectId,
    isPrimary,
    status,
  });

  const populatedResult = await EmployeeBankInfo.findById(result._id).populate(
    populateEmployeeBankInfoQuery(),
  );

  return populatedResult;
};

const getAllEmployeeBankInfosFromDB = async (
  filters: TEmployeeBankInfoQueryFilters = {},
) => {
  const query: TEmployeeBankInfoDBQuery = {
    isDeleted: false,
  };

  const employee = getStringQueryValue(filters, "employee");
  const company = getStringQueryValue(filters, "company");
  const paymentMode = getStringQueryValue(filters, "paymentMode");
  const status = getStringQueryValue(filters, "status");
  const isPrimary = getStringQueryValue(filters, "isPrimary");

  if (employee) {
    query.employee = toObjectId(employee, "employee ID");
  }

  if (company) {
    query.company = toObjectId(company, "company ID");
  }

  if (paymentMode) {
    query.paymentMode = paymentMode as TEmployeePaymentMode;
  }

  if (status) {
    query.status = status as TEmployeeBankInfoStatus;
  }

  if (isPrimary) {
    query.isPrimary = isPrimary === "true";
  }

  const result = await EmployeeBankInfo.find(query)
    .populate(populateEmployeeBankInfoQuery())
    .sort({
      isPrimary: -1,
      effectiveFrom: -1,
      createdAt: -1,
    });

  return result;
};

const getSingleEmployeeBankInfoFromDB = async (id: string) => {
  const employeeBankInfoObjectId = toObjectId(id, "employee bank info ID");

  const result = await EmployeeBankInfo.findOne({
    _id: employeeBankInfoObjectId,
    isDeleted: false,
  }).populate(populateEmployeeBankInfoQuery());

  if (!result) {
    throw new AppError(404, "Employee bank info not found");
  }

  return result;
};

const updateEmployeeBankInfoIntoDB = async (
  id: string,
  payload: TUpdateEmployeeBankInfoPayload,
) => {
  const employeeBankInfoObjectId = toObjectId(id, "employee bank info ID");

  const existingEmployeeBankInfo = await EmployeeBankInfo.findOne({
    _id: employeeBankInfoObjectId,
    isDeleted: false,
  });

  if (!existingEmployeeBankInfo) {
    throw new AppError(404, "Employee bank info not found");
  }

  const nextEmployee = payload.employee ?? existingEmployeeBankInfo.employee;
  const nextCompany = payload.company ?? existingEmployeeBankInfo.company;

  const { employeeObjectId, companyObjectId } = await ensureEmployeeAndCompany(
    nextEmployee,
    nextCompany,
  );

  const nextData: Partial<TEmployeeBankInfo> = {
    employee: employeeObjectId,
    company: companyObjectId,
    accountName: payload.accountName ?? existingEmployeeBankInfo.accountName,
    bankName: payload.bankName ?? existingEmployeeBankInfo.bankName,
    bankBranchName:
      payload.bankBranchName ?? existingEmployeeBankInfo.bankBranchName,
    bankBranchCode:
      payload.bankBranchCode ?? existingEmployeeBankInfo.bankBranchCode,
    accountNo: payload.accountNo ?? existingEmployeeBankInfo.accountNo,
    processBankBranchNo:
      payload.processBankBranchNo ??
      existingEmployeeBankInfo.processBankBranchNo,
    routingNo: payload.routingNo ?? existingEmployeeBankInfo.routingNo,
    paymentMode: payload.paymentMode ?? existingEmployeeBankInfo.paymentMode,
    mobileBankingProvider:
      payload.mobileBankingProvider ??
      existingEmployeeBankInfo.mobileBankingProvider,
    mobileBankingNo:
      payload.mobileBankingNo ?? existingEmployeeBankInfo.mobileBankingNo,
    cashPayReason:
      payload.cashPayReason ?? existingEmployeeBankInfo.cashPayReason,
    effectiveFrom:
      payload.effectiveFrom ?? existingEmployeeBankInfo.effectiveFrom,
    effectiveTo: payload.effectiveTo ?? existingEmployeeBankInfo.effectiveTo,
    isPrimary: payload.isPrimary ?? existingEmployeeBankInfo.isPrimary,
    status: payload.status ?? existingEmployeeBankInfo.status,
  };

  validatePaymentModeDetails(nextData);

  if (nextData.isPrimary && nextData.status === "active") {
    await clearOtherPrimaryPaymentInfos(employeeObjectId, id);
  }

  const result = await EmployeeBankInfo.findOneAndUpdate(
    {
      _id: employeeBankInfoObjectId,
      isDeleted: false,
    },
    {
      ...payload,
      employee: employeeObjectId,
      company: companyObjectId,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeBankInfoQuery());

  if (!result) {
    throw new AppError(404, "Employee bank info not found");
  }

  return result;
};

const deleteEmployeeBankInfoFromDB = async (id: string) => {
  const employeeBankInfoObjectId = toObjectId(id, "employee bank info ID");

  const result = await EmployeeBankInfo.findOneAndUpdate(
    {
      _id: employeeBankInfoObjectId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      status: "inactive",
      isPrimary: false,
    },
    {
      new: true,
    },
  ).populate(populateEmployeeBankInfoQuery());

  if (!result) {
    throw new AppError(404, "Employee bank info not found");
  }

  return result;
};

export const EmployeeBankInfoServices = {
  createEmployeeBankInfoIntoDB,
  getAllEmployeeBankInfosFromDB,
  getSingleEmployeeBankInfoFromDB,
  updateEmployeeBankInfoIntoDB,
  deleteEmployeeBankInfoFromDB,
};

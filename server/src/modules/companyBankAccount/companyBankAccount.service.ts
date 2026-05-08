import AppError from "../../errors/AppError";

import Company from "../company/company.model";

import { TCompanyBankAccount } from "./companyBankAccount.interface";

import CompanyBankAccount from "./companyBankAccount.model";

const HTTP_STATUS = {
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const createCompanyBankAccountIntoDB = async (payload: TCompanyBankAccount) => {
  const company = await Company.findById(payload.company);

  if (!company) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company not found");
  }

  /**
   * Duplicate Prevention
   */

  const existingDuplicate = await CompanyBankAccount.findOne({
    company: payload.company,
    bankName: payload.bankName,
    branchCode: payload.branchCode,
    accountNo: payload.accountNo,
    processBankBranchNo: payload.processBankBranchNo,
    isDeleted: false,
  });

  if (existingDuplicate) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Same company bank account already exists",
    );
  }

  /**
   * Primary Logic
   */

  const existingPrimary = await CompanyBankAccount.findOne({
    company: payload.company,
    isPrimary: true,
    isDeleted: false,
    status: "active",
  });

  let isPrimary = false;

  if (!existingPrimary && payload.status === "active") {
    isPrimary = true;
  }

  if (payload.isPrimary === true) {
    isPrimary = true;

    await CompanyBankAccount.updateMany(
      {
        company: payload.company,
        isPrimary: true,
      },
      {
        $set: {
          isPrimary: false,
        },
      },
    );
  }

  const result = await CompanyBankAccount.create({
    ...payload,
    isPrimary,
  });

  return result;
};

const getAllCompanyBankAccountsFromDB = async (
  query: Record<string, unknown>,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.company) {
    filter.company = query.company;
  }

  if (query.accountType) {
    filter.accountType = query.accountType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const result = await CompanyBankAccount.find(filter)
    .populate("company")
    .sort({ createdAt: -1 });

  return result;
};

const getSingleCompanyBankAccountFromDB = async (id: string) => {
  const result = await CompanyBankAccount.findOne({
    _id: id,
    isDeleted: false,
  }).populate("company");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company bank account not found");
  }

  return result;
};

const updateCompanyBankAccountIntoDB = async (
  id: string,
  payload: Partial<TCompanyBankAccount>,
) => {
  const existingData = await CompanyBankAccount.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingData) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company bank account not found");
  }

  const company = payload.company || existingData.company;

  const duplicate = await CompanyBankAccount.findOne({
    _id: { $ne: id },

    company,

    bankName: payload.bankName || existingData.bankName,

    branchCode: payload.branchCode || existingData.branchCode,

    accountNo: payload.accountNo || existingData.accountNo,

    processBankBranchNo:
      payload.processBankBranchNo || existingData.processBankBranchNo,

    isDeleted: false,
  });

  if (duplicate) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Same company bank account already exists",
    );
  }

  /**
   * Primary Update
   */

  if (payload.isPrimary === true) {
    await CompanyBankAccount.updateMany(
      {
        company,
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

  const result = await CompanyBankAccount.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteCompanyBankAccountFromDB = async (id: string) => {
  const existingData = await CompanyBankAccount.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingData) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company bank account not found");
  }

  const result = await CompanyBankAccount.findByIdAndUpdate(
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
   * Reassign Primary
   */

  if (existingData.isPrimary) {
    const anotherActive = await CompanyBankAccount.findOne({
      company: existingData.company,
      isDeleted: false,
      status: "active",
    });

    if (anotherActive) {
      await CompanyBankAccount.findByIdAndUpdate(anotherActive._id, {
        isPrimary: true,
      });
    }
  }

  return result;
};

export const CompanyBankAccountServices = {
  createCompanyBankAccountIntoDB,
  getAllCompanyBankAccountsFromDB,
  getSingleCompanyBankAccountFromDB,
  updateCompanyBankAccountIntoDB,
  deleteCompanyBankAccountFromDB,
};

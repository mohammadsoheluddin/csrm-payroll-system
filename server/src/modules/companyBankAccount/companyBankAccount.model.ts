import { Schema, model } from "mongoose";

import {
  CompanyBankAccountModel,
  TCompanyBankAccount,
} from "./companyBankAccount.interface";

const companyBankAccountSchema = new Schema<
  TCompanyBankAccount,
  CompanyBankAccountModel
>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    branchCode: {
      type: String,
      required: true,
      trim: true,
    },

    routingNo: {
      type: String,
      trim: true,
    },

    swiftCode: {
      type: String,
      trim: true,
    },

    accountNo: {
      type: String,
      required: true,
      trim: true,
    },

    processBankBranchNo: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["salary", "ot", "bonus", "general", "tada", "allowance"],
      required: true,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    remarks: {
      type: String,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const CompanyBankAccount = model<TCompanyBankAccount, CompanyBankAccountModel>(
  "CompanyBankAccount",
  companyBankAccountSchema,
);

export default CompanyBankAccount;

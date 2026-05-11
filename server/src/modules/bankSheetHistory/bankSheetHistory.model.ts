import { model, Schema } from "mongoose";
import {
  BankSheetHistoryModel,
  TBankSheetHistory,
} from "./bankSheetHistory.interface";

import { softDeleteSchemaFields } from "../../common/softDelete";
const bankSheetHistorySchema = new Schema<
  TBankSheetHistory,
  BankSheetHistoryModel
>(
  {
    exportType: {
      type: String,
      enum: ["preview", "excel", "pdf"],
      required: true,
      trim: true,
    },

    sourceType: {
      type: String,
      enum: ["salary"],
      required: true,
      trim: true,
    },

    payrollMonth: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    sourceAccount: {
      type: Schema.Types.ObjectId,
      ref: "CompanyBankAccount",
      default: null,
    },

    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paymentMode: {
      type: String,
      enum: ["bank", "cash", "mobile_banking"],
      required: true,
      trim: true,
    },

    totalPayrollFound: {
      type: Number,
      required: true,
      min: 0,
    },

    totalIncluded: {
      type: Number,
      required: true,
      min: 0,
    },

    totalExcluded: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    filters: {
      department: {
        type: String,
        default: null,
      },

      branch: {
        type: String,
        default: null,
      },

      bankName: {
        type: String,
        default: null,
      },
    },

    fileName: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    ...softDeleteSchemaFields,
  },
  {
    timestamps: true,
  },
);

bankSheetHistorySchema.index({
  payrollMonth: 1,
  exportType: 1,
  company: 1,
});

const BankSheetHistory = model<TBankSheetHistory, BankSheetHistoryModel>(
  "BankSheetHistory",
  bankSheetHistorySchema,
);

export default BankSheetHistory;

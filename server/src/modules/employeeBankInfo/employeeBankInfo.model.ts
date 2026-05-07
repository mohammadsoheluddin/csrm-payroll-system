import { Schema, model } from "mongoose";
import type { TEmployeeBankInfo } from "./employeeBankInfo.interface";

const employeeBankInfoSchema = new Schema<TEmployeeBankInfo>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    accountName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankBranchName: {
      type: String,
      trim: true,
    },
    bankBranchCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    accountNo: {
      type: String,
      trim: true,
    },
    processBankBranchNo: {
      type: String,
      trim: true,
      uppercase: true,
    },
    routingNo: {
      type: String,
      trim: true,
    },

    paymentMode: {
      type: String,
      enum: ["bank", "cash", "mobile_banking"],
      required: true,
      default: "bank",
    },

    mobileBankingProvider: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", "other"],
    },
    mobileBankingNo: {
      type: String,
      trim: true,
    },

    cashPayReason: {
      type: String,
      trim: true,
    },

    effectiveFrom: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveTo: {
      type: String,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: true,
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

employeeBankInfoSchema.index({
  employee: 1,
  company: 1,
  paymentMode: 1,
  status: 1,
  isDeleted: 1,
});

employeeBankInfoSchema.index({
  company: 1,
  paymentMode: 1,
  status: 1,
  isDeleted: 1,
});

employeeBankInfoSchema.index({
  bankName: 1,
  bankBranchCode: 1,
  accountNo: 1,
  isDeleted: 1,
});

/**
 * One active primary payment info per employee.
 * Historical/non-primary records are allowed.
 */
employeeBankInfoSchema.index(
  {
    employee: 1,
    isPrimary: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      isPrimary: true,
      status: "active",
    },
  },
);

const EmployeeBankInfo = model<TEmployeeBankInfo>(
  "EmployeeBankInfo",
  employeeBankInfoSchema,
);

export default EmployeeBankInfo;

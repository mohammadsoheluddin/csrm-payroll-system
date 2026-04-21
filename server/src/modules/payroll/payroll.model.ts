import { Schema, model } from "mongoose";
import { PayrollModel, TPayroll, TPayrollAuditLog } from "./payroll.interface";

const payrollAuditLogSchema = new Schema<TPayrollAuditLog>(
  {
    action: {
      type: String,
      enum: [
        "generated",
        "updated",
        "processed",
        "approved",
        "paid",
        "locked",
        "unlocked",
      ],
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ["draft", "processed", "approved", "paid"],
      default: null,
    },
    toStatus: {
      type: String,
      enum: ["draft", "processed", "approved", "paid"],
      default: null,
    },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actionAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const payrollSchema = new Schema<TPayroll, PayrollModel>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    payrollMonth: {
      type: String,
      required: true,
      trim: true,
    },
    salaryStructure: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    fixedDeduction: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    attendanceDeduction: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    payableSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "processed", "approved", "paid"],
      default: "draft",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },

    auditLogs: {
      type: [payrollAuditLogSchema],
      default: [],
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

payrollSchema.index({ employee: 1, payrollMonth: 1 }, { unique: true });

export const Payroll = model<TPayroll, PayrollModel>("Payroll", payrollSchema);

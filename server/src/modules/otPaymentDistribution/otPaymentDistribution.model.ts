import { Schema, model } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import {
  OtPaymentDistributionModel,
  TOtPaymentDistribution,
  TOtPaymentDistributionAuditLog,
  TOtPaymentDistributionEmployeeSnapshot,
  TOtPaymentDistributionOtStatementSnapshot,
  TOtPaymentDistributionPaymentInfoSnapshot,
  TOtPaymentDistributionSnapshot,
} from "./otPaymentDistribution.interface";

import { softDeleteSchemaFields } from "../../common/softDelete";
const otPaymentDistributionEmployeeSnapshotSchema =
  new Schema<TOtPaymentDistributionEmployeeSnapshot>(
    {
      employeeDbId: { type: String, default: "" },
      employeeId: { type: String, default: "" },
      employeeName: { type: String, default: "" },
      officeId: { type: String, default: "" },
      cardNo: { type: String, default: "" },
      company: {
        id: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      majorDepartment: {
        id: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      department: {
        id: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      designation: {
        id: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      branch: {
        id: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      serviceType: { type: String, default: "" },
      payType: { type: String, default: "" },
      employmentStatus: { type: String, default: "" },
      joiningDate: { type: String, default: "" },
    },
    { _id: false },
  );

const otPaymentDistributionOtStatementSnapshotSchema =
  new Schema<TOtPaymentDistributionOtStatementSnapshot>(
    {
      otStatementId: { type: String, default: "" },
      payrollMonth: { type: String, default: "" },
      status: { type: String, default: "" },
      isLocked: { type: Boolean, default: false },
      timeBillId: { type: String, default: "" },
      attendanceFinalizationId: { type: String, default: "" },
      salaryStructureId: { type: String, default: "" },
      grossSalary: { type: Number, default: 0 },
      dutyHourPerDay: { type: Number, default: 0 },
      otHours: { type: Number, default: 0 },
      otRate: { type: Number, default: 0 },
      otAmount: { type: Number, default: 0 },
      tiffinDays: { type: Number, default: 0 },
      tiffinRate: { type: Number, default: 0 },
      tiffinAmount: { type: Number, default: 0 },
      totalPayableAmount: { type: Number, default: 0 },
    },
    { _id: false },
  );

const otPaymentDistributionPaymentInfoSnapshotSchema =
  new Schema<TOtPaymentDistributionPaymentInfoSnapshot>(
    {
      paymentInfoId: { type: String, default: "" },
      paymentMode: {
        type: String,
        enum: ["bank", "cash", "mobile_banking"],
        required: true,
      },
      isPrimary: { type: Boolean, default: false },
      status: { type: String, default: "" },
      accountName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      bankBranchName: { type: String, default: "" },
      bankBranchCode: { type: String, default: "" },
      accountNo: { type: String, default: "" },
      processBankBranchNo: { type: String, default: "" },
      routingNo: { type: String, default: "" },
      mobileBankingProvider: { type: String, default: "" },
      mobileBankingNo: { type: String, default: "" },
      cashPayReason: { type: String, default: "" },
      effectiveFrom: { type: String, default: "" },
      effectiveTo: { type: String, default: "" },
      source: {
        type: String,
        enum: ["employee_payment_info", "fallback_cash"],
        required: true,
      },
      warning: { type: String, default: "" },
    },
    { _id: false },
  );

const otPaymentDistributionSnapshotSchema =
  new Schema<TOtPaymentDistributionSnapshot>(
    {
      employee: {
        type: otPaymentDistributionEmployeeSnapshotSchema,
        default: null,
      },
      otStatement: {
        type: otPaymentDistributionOtStatementSnapshotSchema,
        default: null,
      },
      paymentInfo: {
        type: otPaymentDistributionPaymentInfoSnapshotSchema,
        default: null,
      },
    },
    { _id: false },
  );

const otPaymentDistributionAuditLogSchema =
  new Schema<TOtPaymentDistributionAuditLog>(
    {
      action: {
        type: String,
        enum: [
          "generated",
          "regenerated",
          "processed",
          "approved",
          "locked",
          "unlocked",
        ],
        required: true,
      },
      fromStatus: {
        type: String,
        enum: ["draft", "processed", "approved", "locked"],
        default: null,
      },
      toStatus: {
        type: String,
        enum: ["draft", "processed", "approved", "locked"],
        default: null,
      },
      actionBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      actionAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
      note: {
        type: String,
        trim: true,
        default: "",
      },
    },
    { _id: false },
  );

const payrollImmutableSealSchema = new Schema<TPayrollImmutableSeal>(
  {
    sealVersion: { type: String, required: true, trim: true },
    sourceModule: { type: String, required: true, trim: true },
    sourceId: { type: String, required: true, trim: true },
    checksum: { type: String, required: true, trim: true },
    sealedAt: { type: Date, required: true },
    sealedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const otPaymentDistributionSchema =
  new Schema<TOtPaymentDistribution, OtPaymentDistributionModel>(
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
      majorDepartment: {
        type: Schema.Types.ObjectId,
        ref: "MajorDepartment",
        required: true,
      },
      department: {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      designation: {
        type: Schema.Types.ObjectId,
        ref: "Designation",
        required: true,
      },
      branch: {
        type: Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
      },

      payrollMonth: {
        type: String,
        required: true,
        trim: true,
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
        max: 2100,
      },
      periodStartDate: {
        type: String,
        required: true,
        trim: true,
      },
      periodEndDate: {
        type: String,
        required: true,
        trim: true,
      },

      otStatement: {
        type: Schema.Types.ObjectId,
        ref: "OtStatement",
        required: true,
      },
      timeBill: {
        type: Schema.Types.ObjectId,
        ref: "TimeBill",
        required: true,
      },
      attendanceFinalization: {
        type: Schema.Types.ObjectId,
        ref: "AttendanceFinalization",
        required: true,
      },
      salaryStructure: {
        type: Schema.Types.ObjectId,
        ref: "SalaryStructure",
        required: true,
      },

      grossSalary: { type: Number, required: true, min: 0 },
      dutyHourPerDay: { type: Number, required: true, min: 0 },
      otHours: { type: Number, default: 0, min: 0 },
      otRate: { type: Number, default: 0, min: 0 },
      otAmount: { type: Number, default: 0, min: 0 },
      tiffinDays: { type: Number, default: 0, min: 0 },
      tiffinRate: { type: Number, default: 0, min: 0 },
      tiffinAmount: { type: Number, default: 0, min: 0 },
      totalPayableAmount: { type: Number, default: 0, min: 0 },

      paymentMode: {
        type: String,
        enum: ["bank", "cash", "mobile_banking"],
        required: true,
      },
      paymentInfo: {
        type: Schema.Types.ObjectId,
        ref: "EmployeeBankInfo",
        default: null,
      },
      accountName: { type: String, trim: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      bankBranchName: { type: String, trim: true, default: "" },
      bankBranchCode: { type: String, trim: true, default: "" },
      accountNo: { type: String, trim: true, default: "" },
      processBankBranchNo: { type: String, trim: true, default: "" },
      routingNo: { type: String, trim: true, default: "" },
      mobileBankingProvider: { type: String, trim: true, default: "" },
      mobileBankingNo: { type: String, trim: true, default: "" },
      cashPayReason: { type: String, trim: true, default: "" },
      paymentInfoSource: {
        type: String,
        enum: ["employee_payment_info", "fallback_cash"],
        required: true,
      },
      paymentInfoWarning: { type: String, trim: true, default: "" },

      bankAmount: { type: Number, default: 0, min: 0 },
      cashAmount: { type: Number, default: 0, min: 0 },
      mobileBankingAmount: { type: Number, default: 0, min: 0 },

      status: {
        type: String,
        enum: ["draft", "processed", "approved", "locked"],
        default: "draft",
      },
      isLocked: {
        type: Boolean,
        default: false,
      },

      generatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      generatedAt: { type: Date, default: null },
      processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      processedAt: { type: Date, default: null },
      approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      approvedAt: { type: Date, default: null },
      lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      lockedAt: { type: Date, default: null },

      immutableSeal: { type: payrollImmutableSealSchema, default: null },
    snapshot: {
        type: otPaymentDistributionSnapshotSchema,
        default: null,
      },
      auditLogs: {
        type: [otPaymentDistributionAuditLogSchema],
        default: [],
      },
      remarks: {
        type: String,
        trim: true,
        default: "",
      },
      ...softDeleteSchemaFields,
    },
    {
      timestamps: true,
    },
  );

otPaymentDistributionSchema.index(
  {
    employee: 1,
    payrollMonth: 1,
  },
  {
    unique: true,
  },
);

otPaymentDistributionSchema.index({
  payrollMonth: 1,
  company: 1,
  majorDepartment: 1,
  department: 1,
  branch: 1,
  paymentMode: 1,
  status: 1,
  isLocked: 1,
  isDeleted: 1,
});

otPaymentDistributionSchema.index({
  otStatement: 1,
  payrollMonth: 1,
  isDeleted: 1,
});

const OtPaymentDistribution = model<
  TOtPaymentDistribution,
  OtPaymentDistributionModel
>("OtPaymentDistribution", otPaymentDistributionSchema);

export default OtPaymentDistribution;

import { Schema, model } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import {
  BonusPaymentDistributionModel,
  TBonusPaymentDistribution,
  TBonusPaymentDistributionAuditLog,
  TBonusPaymentDistributionPaymentInfoSnapshot,
  TBonusPaymentDistributionSnapshot,
} from "./bonusPaymentDistribution.interface";

import { softDeleteSchemaFields } from "../../common/softDelete";
const paymentInfoSnapshotSchema =
  new Schema<TBonusPaymentDistributionPaymentInfoSnapshot>(
    {
      paymentInfoId: { type: String, default: "" },
      paymentMode: {
        type: String,
        enum: ["bank", "cash", "mobile_banking"],
        default: "cash",
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

const bonusPaymentDistributionSnapshotSchema =
  new Schema<TBonusPaymentDistributionSnapshot>(
    {
      bonusStatement: { type: Schema.Types.Mixed, default: null },
      paymentInfo: { type: paymentInfoSnapshotSchema, default: null },
    },
    { _id: false },
  );

const bonusPaymentDistributionAuditLogSchema =
  new Schema<TBonusPaymentDistributionAuditLog>(
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
      actionBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      actionAt: { type: Date, default: Date.now },
      note: { type: String, default: "" },
    },
    { _id: false },
  );

const payrollImmutableSealSchema = new Schema<TPayrollImmutableSeal>(
  {
    sealVersion: { type: String, default: "PAYROLL_IMMUTABLE_SEAL_V1" },
    sourceModule: { type: String, required: true },
    sourceId: { type: String, default: "" },
    checksum: { type: String, required: true },
    sealedAt: { type: Date, default: Date.now },
    sealedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const bonusPaymentDistributionSchema = new Schema<
  TBonusPaymentDistribution,
  BonusPaymentDistributionModel
>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    majorDepartment: {
      type: Schema.Types.ObjectId,
      ref: "MajorDepartment",
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    designation: { type: Schema.Types.ObjectId, ref: "Designation", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    bonusMonth: { type: String, required: true, trim: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 1900 },
    bonusName: { type: String, required: true, trim: true },
    bonusType: {
      type: String,
      enum: [
        "eid",
        "puja",
        "festival",
        "attendance",
        "production",
        "special_incentive",
        "other",
      ],
      required: true,
    },
    calculationBasis: {
      type: String,
      enum: [
        "gross_salary",
        "basic_salary",
        "percentage_of_gross",
        "percentage_of_basic",
        "fixed_amount",
      ],
      required: true,
    },

    bonusStatement: {
      type: Schema.Types.ObjectId,
      ref: "BonusStatement",
      required: true,
    },
    bonusSheet: { type: Schema.Types.ObjectId, ref: "BonusSheet", required: true },
    salaryStructure: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    basicSalary: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, default: 0, min: 0 },
    calculatedBonusAmount: { type: Number, default: 0, min: 0 },
    payableBonusAmount: { type: Number, default: 0, min: 0 },
    isEligible: { type: Boolean, default: true },
    eligibilityReason: { type: String, default: "" },

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
    paymentInfoSource: {
      type: String,
      enum: ["employee_payment_info", "fallback_cash"],
      required: true,
    },
    paymentInfoWarning: { type: String, default: "" },

    bankAmount: { type: Number, default: 0, min: 0 },
    cashAmount: { type: Number, default: 0, min: 0 },
    mobileBankingAmount: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["draft", "processed", "approved", "locked"],
      default: "draft",
      required: true,
    },
    isLocked: { type: Boolean, default: false },

    generatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    generatedAt: { type: Date, default: null },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null },
    immutableSeal: { type: payrollImmutableSealSchema, default: null },

    snapshot: { type: bonusPaymentDistributionSnapshotSchema, default: null },
    auditLogs: { type: [bonusPaymentDistributionAuditLogSchema], default: [] },
    remarks: { type: String, default: "" },
    ...softDeleteSchemaFields,
  },
  { timestamps: true },
);

bonusPaymentDistributionSchema.index({ bonusMonth: 1, company: 1, status: 1, isLocked: 1 });
bonusPaymentDistributionSchema.index({ employee: 1, bonusMonth: 1, bonusName: 1, isDeleted: 1 });
bonusPaymentDistributionSchema.index(
  { bonusStatement: 1, isDeleted: 1 },
  { unique: true },
);
bonusPaymentDistributionSchema.index({ company: 1, paymentMode: 1, status: 1 });

const BonusPaymentDistribution = model<
  TBonusPaymentDistribution,
  BonusPaymentDistributionModel
>("BonusPaymentDistribution", bonusPaymentDistributionSchema);

export default BonusPaymentDistribution;

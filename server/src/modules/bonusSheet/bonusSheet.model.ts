import { Schema, model } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import {
  BonusSheetModel,
  TBonusSheet,
  TBonusSheetAuditLog,
  TBonusSheetCalculationSnapshot,
  TBonusSheetEmployeeSnapshot,
  TBonusSheetRuleSnapshot,
  TBonusSheetSalarySnapshot,
  TBonusSheetSnapshot,
} from "./bonusSheet.interface";

const bonusSheetEmployeeSnapshotSchema = new Schema<TBonusSheetEmployeeSnapshot>(
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

const bonusSheetSalarySnapshotSchema = new Schema<TBonusSheetSalarySnapshot>(
  {
    salaryStructureId: { type: String, default: "" },
    basicSalary: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },
    effectiveFrom: { type: String, default: "" },
  },
  { _id: false },
);

const bonusSheetRuleSnapshotSchema = new Schema<TBonusSheetRuleSnapshot>(
  {
    bonusName: { type: String, default: "" },
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
      default: "festival",
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
      default: "gross_salary",
    },
    bonusPercentage: { type: Number, default: 0 },
    fixedAmount: { type: Number, default: 0 },
    minimumServiceDays: { type: Number, default: 0 },
    includeProbation: { type: Boolean, default: true },
    ruleVersion: { type: String, default: "BONUS_ENGINE_V1" },
  },
  { _id: false },
);

const bonusSheetCalculationSnapshotSchema =
  new Schema<TBonusSheetCalculationSnapshot>(
    {
      serviceDays: { type: Number, default: 0 },
      baseAmount: { type: Number, default: 0 },
      calculatedBonusAmount: { type: Number, default: 0 },
      payableBonusAmount: { type: Number, default: 0 },
      isEligible: { type: Boolean, default: true },
      eligibilityReason: { type: String, default: "" },
    },
    { _id: false },
  );

const bonusSheetSnapshotSchema = new Schema<TBonusSheetSnapshot>(
  {
    employee: { type: bonusSheetEmployeeSnapshotSchema, default: null },
    salaryStructure: { type: bonusSheetSalarySnapshotSchema, default: null },
    rule: { type: bonusSheetRuleSnapshotSchema, default: null },
    calculation: { type: bonusSheetCalculationSnapshotSchema, default: null },
  },
  { _id: false },
);

const bonusSheetAuditLogSchema = new Schema<TBonusSheetAuditLog>(
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

const bonusSheetSchema = new Schema<TBonusSheet, BonusSheetModel>(
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
    bonusPercentage: { type: Number, default: 0, min: 0 },
    fixedAmount: { type: Number, default: 0, min: 0 },
    minimumServiceDays: { type: Number, default: 0, min: 0 },
    includeProbation: { type: Boolean, default: true },

    salaryStructure: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },
    basicSalary: { type: Number, required: true, min: 0 },
    grossSalary: { type: Number, required: true, min: 0 },
    serviceDays: { type: Number, default: 0, min: 0 },
    baseAmount: { type: Number, default: 0, min: 0 },
    calculatedBonusAmount: { type: Number, default: 0, min: 0 },
    payableBonusAmount: { type: Number, default: 0, min: 0 },
    isEligible: { type: Boolean, default: true },
    eligibilityReason: { type: String, default: "" },

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

    snapshot: { type: bonusSheetSnapshotSchema, default: null },
    auditLogs: { type: [bonusSheetAuditLogSchema], default: [] },
    remarks: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bonusSheetSchema.index({ bonusMonth: 1, company: 1, status: 1, isLocked: 1 });
bonusSheetSchema.index({ employee: 1, bonusMonth: 1, bonusName: 1, isDeleted: 1 });
bonusSheetSchema.index({ company: 1, majorDepartment: 1, department: 1, branch: 1 });

const BonusSheet = model<TBonusSheet, BonusSheetModel>(
  "BonusSheet",
  bonusSheetSchema,
);

export default BonusSheet;

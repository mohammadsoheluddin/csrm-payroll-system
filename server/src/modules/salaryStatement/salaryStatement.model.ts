import { Schema, model } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import {
  SalaryStatementModel,
  TSalaryStatement,
  TSalaryStatementAuditLog,
  TSalaryStatementEmployeeSnapshot,
  TSalaryStatementSalarySheetSnapshot,
  TSalaryStatementSnapshot,
} from "./salaryStatement.interface";

import { softDeleteSchemaFields } from "../../common/softDelete";
const salaryStatementEmployeeSnapshotSchema =
  new Schema<TSalaryStatementEmployeeSnapshot>(
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

const salaryStatementSalarySheetSnapshotSchema =
  new Schema<TSalaryStatementSalarySheetSnapshot>(
    {
      salarySheetId: { type: String, default: "" },
      payrollMonth: { type: String, default: "" },
      status: { type: String, default: "" },
      isLocked: { type: Boolean, default: false },
      attendanceFinalizationId: { type: String, default: "" },
      salaryStructureId: { type: String, default: "" },
      basicSalary: { type: Number, default: 0 },
      houseRent: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      transportAllowance: { type: Number, default: 0 },
      otherAllowance: { type: Number, default: 0 },
      grossSalary: { type: Number, default: 0 },
      fixedDeduction: { type: Number, default: 0 },
      attendanceDeduction: { type: Number, default: 0 },
      totalDeduction: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
      payableSalary: { type: Number, default: 0 },
      totalPayableDays: { type: Number, default: 0 },
      totalDeductionDays: { type: Number, default: 0 },
      totalAbsentDays: { type: Number, default: 0 },
      totalPaidLeaveDays: { type: Number, default: 0 },
      totalUnpaidLeaveDays: { type: Number, default: 0 },
    },
    { _id: false },
  );

const salaryStatementSnapshotSchema = new Schema<TSalaryStatementSnapshot>(
  {
    employee: { type: salaryStatementEmployeeSnapshotSchema, default: null },
    salarySheet: {
      type: salaryStatementSalarySheetSnapshotSchema,
      default: null,
    },
  },
  { _id: false },
);

const salaryStatementAuditLogSchema = new Schema<TSalaryStatementAuditLog>(
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
    actionAt: { type: Date, default: Date.now, required: true },
    note: { type: String, trim: true, default: "" },
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

const salaryStatementSchema = new Schema<TSalaryStatement, SalaryStatementModel>(
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

    payrollMonth: { type: String, required: true, trim: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    periodStartDate: { type: String, required: true, trim: true },
    periodEndDate: { type: String, required: true, trim: true },

    salarySheet: {
      type: Schema.Types.ObjectId,
      ref: "SalarySheet",
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

    basicSalary: { type: Number, default: 0, min: 0 },
    houseRent: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    transportAllowance: { type: Number, default: 0, min: 0 },
    otherAllowance: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, default: 0, min: 0 },

    fixedDeduction: { type: Number, default: 0, min: 0 },
    attendanceDeduction: { type: Number, default: 0, min: 0 },
    totalDeduction: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0 },
    payableSalary: { type: Number, default: 0, min: 0 },

    totalPayableDays: { type: Number, default: 0, min: 0 },
    totalDeductionDays: { type: Number, default: 0, min: 0 },
    totalAbsentDays: { type: Number, default: 0, min: 0 },
    totalPaidLeaveDays: { type: Number, default: 0, min: 0 },
    totalUnpaidLeaveDays: { type: Number, default: 0, min: 0 },

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
    snapshot: { type: salaryStatementSnapshotSchema, default: null },
    auditLogs: { type: [salaryStatementAuditLogSchema], default: [] },
    remarks: { type: String, trim: true, default: "" },
    ...softDeleteSchemaFields,
  },
  { timestamps: true },
);

salaryStatementSchema.index(
  { employee: 1, payrollMonth: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
salaryStatementSchema.index({ company: 1, payrollMonth: 1, status: 1 });
salaryStatementSchema.index({ company: 1, payrollMonth: 1, isLocked: 1 });
salaryStatementSchema.index({ majorDepartment: 1, department: 1, branch: 1 });

const SalaryStatement = model<TSalaryStatement, SalaryStatementModel>(
  "SalaryStatement",
  salaryStatementSchema,
);

export default SalaryStatement;

import { Schema, model } from "mongoose";
import { softDeleteSchemaFields } from "../../common/softDelete";
import type {
  TLegacySalaryImportBatch,
  TLegacySalaryImportRejectedRow,
  TLegacySalaryRecord,
} from "./legacySalaryImport.interface";

const amountTotalsSchema = new Schema(
  {
    employeeCount: { type: Number, default: 0 },
    grossAmount: { type: Number, default: 0 },
    basicAmount: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    tiffinAmount: { type: Number, default: 0 },
    bonusAmount: { type: Number, default: 0 },
    otherAllowanceAmount: { type: Number, default: 0 },
    bankAmount: { type: Number, default: 0 },
    cashAmount: { type: Number, default: 0 },
    mobileBankAmount: { type: Number, default: 0 },
    suspenseAmount: { type: Number, default: 0 },
    aitAmount: { type: Number, default: 0 },
    loanAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    pfAmount: { type: Number, default: 0 },
    stampAmount: { type: Number, default: 0 },
    foodAmount: { type: Number, default: 0 },
    absentDeductionAmount: { type: Number, default: 0 },
    leaveDeductionAmount: { type: Number, default: 0 },
    otherDeductionAmount: { type: Number, default: 0 },
    totalDeductionAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    payableAmount: { type: Number, default: 0 },
  },
  { _id: false },
);

const rejectedRowSchema = new Schema<TLegacySalaryImportRejectedRow>(
  {
    rowNo: { type: Number, required: true },
    employeeIdentifier: { type: String, trim: true, uppercase: true },
    employeeName: { type: String, trim: true },
    reason: { type: String, required: true, trim: true },
    rawPayload: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const legacySalaryImportBatchSchema = new Schema<TLegacySalaryImportBatch>(
  {
    batchNo: { type: String, required: true, unique: true, trim: true, uppercase: true },
    source: {
      type: String,
      enum: ["old_payroll_software", "current_payroll_software", "manual_excel", "other"],
      required: true,
      index: true,
    },
    sheetType: {
      type: String,
      enum: ["salary", "wages", "salary_and_wages", "ot", "bonus", "mixed"],
      required: true,
      index: true,
    },
    payrollMonth: { type: String, required: true, trim: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    sourceFileName: { type: String, trim: true },
    sourceSheetName: { type: String, trim: true },
    matchBy: {
      type: String,
      enum: ["employeeId", "officeId", "cardNo", "name"],
      default: "employeeId",
    },
    status: {
      type: String,
      enum: ["committed", "archived", "deleted"],
      default: "committed",
      index: true,
    },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    matchedRows: { type: Number, default: 0 },
    unmatchedRows: { type: Number, default: 0 },
    duplicateIdentifierRows: { type: Number, default: 0 },
    totals: { type: amountTotalsSchema, required: true },
    rejectedRows: { type: [rejectedRowSchema], default: [] },
    remarks: { type: String, trim: true },
    committedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    committedAt: { type: Date, default: null },
    ...softDeleteSchemaFields,
  },
  { timestamps: true },
);

legacySalaryImportBatchSchema.index({ payrollMonth: 1, company: 1, sheetType: 1, isDeleted: 1 });
legacySalaryImportBatchSchema.index({ source: 1, status: 1, isDeleted: 1 });

const legacySalaryRecordSchema = new Schema<TLegacySalaryRecord>(
  {
    batch: { type: Schema.Types.ObjectId, ref: "LegacySalaryImportBatch", required: true, index: true },
    payrollMonth: { type: String, required: true, trim: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    source: {
      type: String,
      enum: ["old_payroll_software", "current_payroll_software", "manual_excel", "other"],
      required: true,
      index: true,
    },
    sheetType: {
      type: String,
      enum: ["salary", "wages", "salary_and_wages", "ot", "bonus", "mixed"],
      required: true,
      index: true,
    },
    rowNo: { type: Number, required: true },
    status: {
      type: String,
      enum: ["matched", "unmatched", "duplicate_identifier", "invalid"],
      required: true,
      index: true,
    },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    employeeId: { type: String, trim: true, uppercase: true, index: true },
    officeId: { type: String, trim: true, uppercase: true, index: true },
    cardNo: { type: String, trim: true, uppercase: true, index: true },
    employeeIdentifier: { type: String, trim: true, uppercase: true, index: true },
    employeeName: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, trim: true },
    majorDepartmentName: { type: String, trim: true },
    departmentName: { type: String, trim: true, index: true },
    designationName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    payType: { type: String, trim: true },
    paymentMode: {
      type: String,
      enum: ["bank", "cash", "mobile", "mixed", "unknown"],
      default: "unknown",
    },
    grossAmount: { type: Number, default: 0 },
    basicAmount: { type: Number, default: 0 },
    houseRentAmount: { type: Number, default: 0 },
    medicalAmount: { type: Number, default: 0 },
    conveyanceAmount: { type: Number, default: 0 },
    tiffinAmount: { type: Number, default: 0 },
    overtimeHour: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    bonusAmount: { type: Number, default: 0 },
    otherAllowanceAmount: { type: Number, default: 0 },
    bankAmount: { type: Number, default: 0 },
    cashAmount: { type: Number, default: 0 },
    mobileBankAmount: { type: Number, default: 0 },
    suspenseAmount: { type: Number, default: 0 },
    aitAmount: { type: Number, default: 0 },
    loanAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    pfAmount: { type: Number, default: 0 },
    stampAmount: { type: Number, default: 0 },
    foodAmount: { type: Number, default: 0 },
    absentDeductionAmount: { type: Number, default: 0 },
    leaveDeductionAmount: { type: Number, default: 0 },
    otherDeductionAmount: { type: Number, default: 0 },
    totalDeductionAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    payableAmount: { type: Number, default: 0 },
    remarks: { type: String, trim: true },
    rawPayload: { type: Schema.Types.Mixed },
    ...softDeleteSchemaFields,
  },
  { timestamps: true },
);

legacySalaryRecordSchema.index({ batch: 1, rowNo: 1 }, { unique: true });
legacySalaryRecordSchema.index({ payrollMonth: 1, company: 1, sheetType: 1, isDeleted: 1 });
legacySalaryRecordSchema.index({ employeeId: 1, officeId: 1, cardNo: 1, isDeleted: 1 });

export const LegacySalaryImportBatch = model<TLegacySalaryImportBatch>(
  "LegacySalaryImportBatch",
  legacySalaryImportBatchSchema,
);

export const LegacySalaryRecord = model<TLegacySalaryRecord>(
  "LegacySalaryRecord",
  legacySalaryRecordSchema,
);

import { Schema, model } from "mongoose";
import {
  SalarySheetModel,
  TSalarySheet,
  TSalarySheetAttendanceSnapshot,
  TSalarySheetAuditLog,
  TSalarySheetCalculationSnapshot,
  TSalarySheetEmployeeSnapshot,
  TSalarySheetSnapshot,
  TSalarySheetStructureSnapshot,
} from "./salarySheet.interface";

const salarySheetEmployeeSnapshotSchema = new Schema<TSalarySheetEmployeeSnapshot>(
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
    dutyHourPerDay: { type: Number, default: 0 },
  },
  { _id: false },
);

const salarySheetAttendanceSnapshotSchema =
  new Schema<TSalarySheetAttendanceSnapshot>(
    {
      attendanceFinalizationId: { type: String, default: "" },
      payrollMonth: { type: String, default: "" },
      status: { type: String, default: "" },
      isLocked: { type: Boolean, default: false },
      periodStartDate: { type: String, default: "" },
      periodEndDate: { type: String, default: "" },
      totalCalendarDays: { type: Number, default: 0 },
      totalDutyDays: { type: Number, default: 0 },
      totalPayableDays: { type: Number, default: 0 },
      totalDeductionDays: { type: Number, default: 0 },
      totalAbsentDays: { type: Number, default: 0 },
      totalPaidLeaveDays: { type: Number, default: 0 },
      totalUnpaidLeaveDays: { type: Number, default: 0 },
      totalLeaveDays: { type: Number, default: 0 },
      generatedRuleVersion: { type: String, default: "" },
    },
    { _id: false },
  );

const salarySheetStructureSnapshotSchema =
  new Schema<TSalarySheetStructureSnapshot>(
    {
      salaryStructureId: { type: String, default: "" },
      basicSalary: { type: Number, default: 0 },
      houseRent: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      transportAllowance: { type: Number, default: 0 },
      otherAllowance: { type: Number, default: 0 },
      grossSalary: { type: Number, default: 0 },
      taxDeduction: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      loanDeduction: { type: Number, default: 0 },
      otherDeduction: { type: Number, default: 0 },
      fixedDeduction: { type: Number, default: 0 },
      effectiveFrom: { type: String, default: "" },
    },
    { _id: false },
  );

const salarySheetCalculationSnapshotSchema =
  new Schema<TSalarySheetCalculationSnapshot>(
    {
      perDaySalary: { type: Number, default: 0 },
      attendanceDeduction: { type: Number, default: 0 },
      totalDeduction: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
      payableSalary: { type: Number, default: 0 },
      calculationRuleVersion: { type: String, default: "" },
    },
    { _id: false },
  );

const salarySheetSnapshotSchema = new Schema<TSalarySheetSnapshot>(
  {
    employee: { type: salarySheetEmployeeSnapshotSchema, default: null },
    attendance: { type: salarySheetAttendanceSnapshotSchema, default: null },
    salaryStructure: { type: salarySheetStructureSnapshotSchema, default: null },
    calculation: { type: salarySheetCalculationSnapshotSchema, default: null },
  },
  { _id: false },
);

const salarySheetAuditLogSchema = new Schema<TSalarySheetAuditLog>(
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

const salarySheetSchema = new Schema<TSalarySheet, SalarySheetModel>(
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

    taxDeduction: { type: Number, default: 0, min: 0 },
    providentFund: { type: Number, default: 0, min: 0 },
    loanDeduction: { type: Number, default: 0, min: 0 },
    otherDeduction: { type: Number, default: 0, min: 0 },
    fixedDeduction: { type: Number, default: 0, min: 0 },

    perDaySalary: { type: Number, default: 0, min: 0 },
    attendanceDeduction: { type: Number, default: 0, min: 0 },
    totalDeduction: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0 },
    payableSalary: { type: Number, default: 0, min: 0 },

    totalCalendarDays: { type: Number, default: 0, min: 0 },
    totalDutyDays: { type: Number, default: 0, min: 0 },
    totalPayableDays: { type: Number, default: 0, min: 0 },
    totalDeductionDays: { type: Number, default: 0, min: 0 },
    totalAbsentDays: { type: Number, default: 0, min: 0 },
    totalPaidLeaveDays: { type: Number, default: 0, min: 0 },
    totalUnpaidLeaveDays: { type: Number, default: 0, min: 0 },
    totalLeaveDays: { type: Number, default: 0, min: 0 },

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

    snapshot: { type: salarySheetSnapshotSchema, default: null },
    auditLogs: { type: [salarySheetAuditLogSchema], default: [] },
    remarks: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

salarySheetSchema.index(
  { employee: 1, payrollMonth: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
salarySheetSchema.index({ company: 1, payrollMonth: 1, status: 1 });
salarySheetSchema.index({ company: 1, payrollMonth: 1, isLocked: 1 });
salarySheetSchema.index({ majorDepartment: 1, department: 1, branch: 1 });

const SalarySheet = model<TSalarySheet, SalarySheetModel>(
  "SalarySheet",
  salarySheetSchema,
);

export default SalarySheet;

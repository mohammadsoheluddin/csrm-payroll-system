import { Schema, model } from "mongoose";
import {
  SalaryPaymentDistributionModel,
  TSalaryPaymentDistribution,
  TSalaryPaymentDistributionAuditLog,
  TSalaryPaymentDistributionEmployeeSnapshot,
  TSalaryPaymentDistributionPaymentInfoSnapshot,
  TSalaryPaymentDistributionSalaryStatementSnapshot,
  TSalaryPaymentDistributionSnapshot,
} from "./salaryPaymentDistribution.interface";

const salaryPaymentDistributionEmployeeSnapshotSchema =
  new Schema<TSalaryPaymentDistributionEmployeeSnapshot>(
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

const salaryPaymentDistributionSalaryStatementSnapshotSchema =
  new Schema<TSalaryPaymentDistributionSalaryStatementSnapshot>(
    {
      salaryStatementId: { type: String, default: "" },
      payrollMonth: { type: String, default: "" },
      status: { type: String, default: "" },
      isLocked: { type: Boolean, default: false },
      salarySheetId: { type: String, default: "" },
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

const salaryPaymentDistributionPaymentInfoSnapshotSchema =
  new Schema<TSalaryPaymentDistributionPaymentInfoSnapshot>(
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

const salaryPaymentDistributionSnapshotSchema =
  new Schema<TSalaryPaymentDistributionSnapshot>(
    {
      employee: {
        type: salaryPaymentDistributionEmployeeSnapshotSchema,
        default: null,
      },
      salaryStatement: {
        type: salaryPaymentDistributionSalaryStatementSnapshotSchema,
        default: null,
      },
      paymentInfo: {
        type: salaryPaymentDistributionPaymentInfoSnapshotSchema,
        default: null,
      },
    },
    { _id: false },
  );

const salaryPaymentDistributionAuditLogSchema =
  new Schema<TSalaryPaymentDistributionAuditLog>(
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

const salaryPaymentDistributionSchema = new Schema<
  TSalaryPaymentDistribution,
  SalaryPaymentDistributionModel
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

    payrollMonth: { type: String, required: true, trim: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    periodStartDate: { type: String, required: true, trim: true },
    periodEndDate: { type: String, required: true, trim: true },

    salaryStatement: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStatement",
      required: true,
    },
    salarySheet: { type: Schema.Types.ObjectId, ref: "SalarySheet", required: true },
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
    isLocked: { type: Boolean, default: false },

    generatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    generatedAt: { type: Date, default: null },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null },

    snapshot: { type: salaryPaymentDistributionSnapshotSchema, default: null },
    auditLogs: { type: [salaryPaymentDistributionAuditLogSchema], default: [] },
    remarks: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

salaryPaymentDistributionSchema.index(
  { employee: 1, payrollMonth: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

salaryPaymentDistributionSchema.index({
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

salaryPaymentDistributionSchema.index({
  salaryStatement: 1,
  payrollMonth: 1,
  isDeleted: 1,
});

const SalaryPaymentDistribution = model<
  TSalaryPaymentDistribution,
  SalaryPaymentDistributionModel
>("SalaryPaymentDistribution", salaryPaymentDistributionSchema);

export default SalaryPaymentDistribution;

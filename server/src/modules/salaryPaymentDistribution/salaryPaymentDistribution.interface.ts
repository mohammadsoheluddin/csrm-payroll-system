import type { TSoftDeleteFields } from "../../common/softDelete";
import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";

export type TSalaryPaymentDistributionStatus =
  | "draft"
  | "processed"
  | "approved"
  | "locked";

export type TSalaryPaymentDistributionPaymentMode =
  | "bank"
  | "cash"
  | "mobile_banking";

export type TSalaryPaymentDistributionAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TSalaryPaymentDistributionEmployeeSnapshot {
  employeeDbId: string;
  employeeId: string;
  employeeName: string;
  officeId?: string;
  cardNo?: string;
  company?: {
    id: string;
    name: string;
  } | null;
  majorDepartment?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  designation?: {
    id: string;
    name: string;
  } | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  serviceType?: string;
  payType?: string;
  employmentStatus?: string;
  joiningDate?: string;
}

export interface TSalaryPaymentDistributionSalaryStatementSnapshot {
  salaryStatementId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
  salarySheetId?: string;
  attendanceFinalizationId?: string;
  salaryStructureId?: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  grossSalary: number;
  fixedDeduction: number;
  attendanceDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalAbsentDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
}

export interface TSalaryPaymentDistributionPaymentInfoSnapshot {
  paymentInfoId?: string;
  paymentMode: TSalaryPaymentDistributionPaymentMode;
  isPrimary?: boolean;
  status?: string;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  source: "employee_payment_info" | "fallback_cash";
  warning?: string;
}

export interface TSalaryPaymentDistributionSnapshot {
  employee?: TSalaryPaymentDistributionEmployeeSnapshot | null;
  salaryStatement?: TSalaryPaymentDistributionSalaryStatementSnapshot | null;
  paymentInfo?: TSalaryPaymentDistributionPaymentInfoSnapshot | null;
}

export interface TSalaryPaymentDistributionAuditLog {
  action: TSalaryPaymentDistributionAuditAction;
  fromStatus?: TSalaryPaymentDistributionStatus | null;
  toStatus?: TSalaryPaymentDistributionStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TSalaryPaymentDistribution extends TSoftDeleteFields {
  employee: Types.ObjectId;
  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  department: Types.ObjectId;
  designation: Types.ObjectId;
  branch: Types.ObjectId;

  payrollMonth: string;
  month: number;
  year: number;
  periodStartDate: string;
  periodEndDate: string;

  salaryStatement: Types.ObjectId;
  salarySheet: Types.ObjectId;
  attendanceFinalization: Types.ObjectId;
  salaryStructure: Types.ObjectId;

  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  grossSalary: number;
  fixedDeduction: number;
  attendanceDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalAbsentDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;

  paymentMode: TSalaryPaymentDistributionPaymentMode;
  paymentInfo?: Types.ObjectId | null;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  paymentInfoSource: "employee_payment_info" | "fallback_cash";
  paymentInfoWarning?: string;

  bankAmount: number;
  cashAmount: number;
  mobileBankingAmount: number;

  status: TSalaryPaymentDistributionStatus;
  isLocked: boolean;

  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date | null;
  processedBy?: Types.ObjectId | null;
  processedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;
  immutableSeal?: TPayrollImmutableSeal | null;

  snapshot?: TSalaryPaymentDistributionSnapshot | null;
  auditLogs: TSalaryPaymentDistributionAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateSalaryPaymentDistributionPayload {
  month: number;
  year: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  overwrite?: boolean;
  /**
   * Default true. When false, employees without active payment info are skipped.
   */
  allowCashFallback?: boolean;
  remarks?: string;
}

export interface TSalaryPaymentDistributionQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TSalaryPaymentDistributionStatus;
  isLocked?: string;
  paymentMode?: TSalaryPaymentDistributionPaymentMode;
}

export interface TSalaryPaymentDistributionSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode?: TSalaryPaymentDistributionPaymentMode;
}



export interface TSalaryPaymentDistributionExportQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode: TSalaryPaymentDistributionPaymentMode;
}

export interface TSalaryPaymentDistributionExportRow {
  slNo: number;
  salaryPaymentDistributionId: string;
  employeeId: string;
  employeeName: string;
  officeId?: string;
  cardNo?: string;
  designation: string;
  department: string;
  majorDepartment: string;
  branch: string;
  paymentMode: TSalaryPaymentDistributionPaymentMode;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  paymentInfoSource: "employee_payment_info" | "fallback_cash";
  paymentInfoWarning?: string;
  grossSalary: number;
  attendanceDeduction: number;
  fixedDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;
  payableAmount: number;
}

export interface TSalaryPaymentDistributionExportSummary {
  payrollMonth: string;
  month: number;
  year: number;
  paymentMode: TSalaryPaymentDistributionPaymentMode;
  totalEmployees: number;
  totalAmount: number;
  totalGrossSalary: number;
  totalDeduction: number;
  totalNetSalary: number;
  fallbackCashCount: number;
  generatedAt: string;
}

export interface TSalaryPaymentDistributionExportPreview {
  payrollMonth: string;
  filters: {
    company: string;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    employee: string | null;
    paymentMode: TSalaryPaymentDistributionPaymentMode;
  };
  summary: TSalaryPaymentDistributionExportSummary;
  readiness: {
    canExport: boolean;
    blockers: string[];
  };
  rows: TSalaryPaymentDistributionExportRow[];
}

export interface TSalaryPaymentDistributionExportFileResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TSalaryPaymentDistributionExportPreview;
}

export interface TSalaryPaymentDistributionActionPayload {
  note?: string;
}

export type TSalaryPaymentDistributionBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TSalaryPaymentDistributionBulkActionPayload {
  payrollMonth?: string;
  month?: number;
  year?: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode?: TSalaryPaymentDistributionPaymentMode;
  note?: string;
  /**
   * For bulk lock, strict=true prevents partial Bank/Cash/Mobile sheet readiness.
   * Default behavior is strict, so every selected record must already be approved.
   */
  strict?: boolean;
}

export interface SalaryPaymentDistributionModel
  extends Model<TSalaryPaymentDistribution> {}

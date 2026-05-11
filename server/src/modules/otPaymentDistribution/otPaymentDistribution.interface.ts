import type { TSoftDeleteFields } from "../../common/softDelete";
import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";

export type TOtPaymentDistributionStatus =
  | "draft"
  | "processed"
  | "approved"
  | "locked";

export type TOtPaymentDistributionPaymentMode =
  | "bank"
  | "cash"
  | "mobile_banking";

export type TOtPaymentDistributionAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TOtPaymentDistributionEmployeeSnapshot {
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

export interface TOtPaymentDistributionOtStatementSnapshot {
  otStatementId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
  timeBillId?: string;
  attendanceFinalizationId?: string;
  salaryStructureId?: string;
  grossSalary: number;
  dutyHourPerDay: number;
  otHours: number;
  otRate: number;
  otAmount: number;
  tiffinDays: number;
  tiffinRate: number;
  tiffinAmount: number;
  totalPayableAmount: number;
}

export interface TOtPaymentDistributionPaymentInfoSnapshot {
  paymentInfoId?: string;
  paymentMode: TOtPaymentDistributionPaymentMode;
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

export interface TOtPaymentDistributionSnapshot {
  employee?: TOtPaymentDistributionEmployeeSnapshot | null;
  otStatement?: TOtPaymentDistributionOtStatementSnapshot | null;
  paymentInfo?: TOtPaymentDistributionPaymentInfoSnapshot | null;
}

export interface TOtPaymentDistributionAuditLog {
  action: TOtPaymentDistributionAuditAction;
  fromStatus?: TOtPaymentDistributionStatus | null;
  toStatus?: TOtPaymentDistributionStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TOtPaymentDistribution extends TSoftDeleteFields {
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

  otStatement: Types.ObjectId;
  timeBill: Types.ObjectId;
  attendanceFinalization: Types.ObjectId;
  salaryStructure: Types.ObjectId;

  grossSalary: number;
  dutyHourPerDay: number;
  otHours: number;
  otRate: number;
  otAmount: number;
  tiffinDays: number;
  tiffinRate: number;
  tiffinAmount: number;
  totalPayableAmount: number;

  paymentMode: TOtPaymentDistributionPaymentMode;
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

  status: TOtPaymentDistributionStatus;
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

  snapshot?: TOtPaymentDistributionSnapshot | null;
  auditLogs: TOtPaymentDistributionAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateOtPaymentDistributionPayload {
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

export interface TOtPaymentDistributionQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TOtPaymentDistributionStatus;
  isLocked?: string;
  paymentMode?: TOtPaymentDistributionPaymentMode;
}

export interface TOtPaymentDistributionSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode?: TOtPaymentDistributionPaymentMode;
}


export interface TOtPaymentDistributionExportQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode: TOtPaymentDistributionPaymentMode;
}

export interface TOtPaymentDistributionExportRow {
  slNo: number;
  otPaymentDistributionId: string;
  employeeId: string;
  employeeName: string;
  officeId?: string;
  cardNo?: string;
  designation: string;
  department: string;
  majorDepartment: string;
  branch: string;
  paymentMode: TOtPaymentDistributionPaymentMode;
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
  otHours: number;
  otAmount: number;
  tiffinDays: number;
  tiffinAmount: number;
  payableAmount: number;
}

export interface TOtPaymentDistributionExportSummary {
  payrollMonth: string;
  month: number;
  year: number;
  paymentMode: TOtPaymentDistributionPaymentMode;
  totalEmployees: number;
  totalAmount: number;
  totalOtAmount: number;
  totalTiffinAmount: number;
  fallbackCashCount: number;
  generatedAt: string;
}

export interface TOtPaymentDistributionExportPreview {
  payrollMonth: string;
  filters: {
    company: string;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    employee: string | null;
    paymentMode: TOtPaymentDistributionPaymentMode;
  };
  summary: TOtPaymentDistributionExportSummary;
  readiness: {
    canExport: boolean;
    blockers: string[];
  };
  rows: TOtPaymentDistributionExportRow[];
}

export interface TOtPaymentDistributionExportFileResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TOtPaymentDistributionExportPreview;
}

export interface TOtPaymentDistributionActionPayload {
  note?: string;
}

export type TOtPaymentDistributionBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TOtPaymentDistributionBulkActionPayload {
  payrollMonth?: string;
  month?: number;
  year?: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode?: TOtPaymentDistributionPaymentMode;
  note?: string;
  /**
   * For bulk lock, strict=true prevents partial OT Bank/Cash/Mobile readiness.
   * Default behavior is strict, so every selected OT payment distribution must already be approved.
   */
  strict?: boolean;
}

export interface OtPaymentDistributionModel
  extends Model<TOtPaymentDistribution> {}

import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";

export type TOtStatementStatus = "draft" | "processed" | "approved" | "locked";

export type TOtStatementAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TOtStatementEmployeeSnapshot {
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
  dutyHourPerDay?: number;
}

export interface TOtStatementTimeBillSnapshot {
  timeBillId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
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
  totalDutyDays: number;
  totalPayableDays: number;
  totalHolidayDutyDays: number;
}

export interface TOtStatementAuditLog {
  action: TOtStatementAuditAction;
  fromStatus?: TOtStatementStatus | null;
  toStatus?: TOtStatementStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TOtStatementSnapshot {
  employee?: TOtStatementEmployeeSnapshot | null;
  timeBill?: TOtStatementTimeBillSnapshot | null;
}

export interface TOtStatement {
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

  totalDutyDays: number;
  totalPayableDays: number;
  totalHolidayDutyDays: number;

  status: TOtStatementStatus;
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

  snapshot?: TOtStatementSnapshot | null;
  auditLogs: TOtStatementAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateOtStatementPayload {
  month: number;
  year: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  overwrite?: boolean;
  remarks?: string;
}

export interface TOtStatementQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TOtStatementStatus;
  isLocked?: string;
}

export interface TOtStatementSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TOtStatementExportQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TOtStatementExportRow {
  slNo: number;
  otStatementId: string;
  employeeId: string;
  employeeName: string;
  officeId?: string;
  cardNo?: string;
  designation: string;
  department: string;
  majorDepartment: string;
  branch: string;
  grossSalary: number;
  dutyHourPerDay: number;
  otHours: number;
  otRate: number;
  otAmount: number;
  tiffinDays: number;
  tiffinRate: number;
  tiffinAmount: number;
  totalDutyDays: number;
  totalPayableDays: number;
  totalHolidayDutyDays: number;
  totalPayableAmount: number;
}

export interface TOtStatementExportSummary {
  payrollMonth: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossSalary: number;
  totalOtHours: number;
  totalOtAmount: number;
  totalTiffinDays: number;
  totalTiffinAmount: number;
  totalPayableAmount: number;
  generatedAt: string;
}

export interface TOtStatementExportPreview {
  payrollMonth: string;
  filters: {
    company: string;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    employee: string | null;
  };
  summary: TOtStatementExportSummary;
  readiness: {
    canExport: boolean;
    blockers: string[];
  };
  rows: TOtStatementExportRow[];
}

export interface TOtStatementExportFileResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TOtStatementExportPreview;
}

export interface TOtStatementActionPayload {
  note?: string;
}

export type TOtStatementBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TOtStatementBulkActionPayload {
  payrollMonth?: string;
  month?: number;
  year?: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  note?: string;
  /**
   * For bulk lock, strict=true prevents partial OT Payment readiness.
   * Default behavior is strict, so every selected OT Statement must already be approved.
   */
  strict?: boolean;
}

export interface OtStatementModel extends Model<TOtStatement> {}

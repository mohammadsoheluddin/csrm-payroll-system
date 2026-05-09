import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";

export type TSalarySheetStatus = "draft" | "processed" | "approved" | "locked";

export type TSalarySheetAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TSalarySheetEmployeeSnapshot {
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

export interface TSalarySheetAttendanceSnapshot {
  attendanceFinalizationId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
  periodStartDate: string;
  periodEndDate: string;
  totalCalendarDays: number;
  totalDutyDays: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalAbsentDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalLeaveDays: number;
  generatedRuleVersion?: string;
}

export interface TSalarySheetStructureSnapshot {
  salaryStructureId: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  grossSalary: number;
  taxDeduction: number;
  providentFund: number;
  loanDeduction: number;
  otherDeduction: number;
  fixedDeduction: number;
  effectiveFrom: string;
}

export interface TSalarySheetCalculationSnapshot {
  perDaySalary: number;
  attendanceDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;
  calculationRuleVersion: string;
}

export interface TSalarySheetSnapshot {
  employee?: TSalarySheetEmployeeSnapshot | null;
  attendance?: TSalarySheetAttendanceSnapshot | null;
  salaryStructure?: TSalarySheetStructureSnapshot | null;
  calculation?: TSalarySheetCalculationSnapshot | null;
}

export interface TSalarySheetAuditLog {
  action: TSalarySheetAuditAction;
  fromStatus?: TSalarySheetStatus | null;
  toStatus?: TSalarySheetStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TSalarySheet {
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

  attendanceFinalization: Types.ObjectId;
  salaryStructure: Types.ObjectId;

  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  grossSalary: number;

  taxDeduction: number;
  providentFund: number;
  loanDeduction: number;
  otherDeduction: number;
  fixedDeduction: number;

  perDaySalary: number;
  attendanceDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;

  totalCalendarDays: number;
  totalDutyDays: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalAbsentDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalLeaveDays: number;

  status: TSalarySheetStatus;
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

  snapshot?: TSalarySheetSnapshot | null;
  auditLogs: TSalarySheetAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateSalarySheetPayload {
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

export interface TSalarySheetQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TSalarySheetStatus;
  isLocked?: string;
}

export interface TSalarySheetSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TSalarySheetActionPayload {
  note?: string;
}

export type TSalarySheetBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TSalarySheetBulkActionPayload {
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
   * For bulk lock, strict=true prevents partial Salary Statement readiness.
   * Default behavior is strict, so every selected Salary Sheet must already be approved.
   */
  strict?: boolean;
}

export interface SalarySheetModel extends Model<TSalarySheet> {}

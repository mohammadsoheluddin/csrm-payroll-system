import { Model, Types } from "mongoose";

export type TSalaryStatementStatus = "draft" | "processed" | "approved" | "locked";

export type TSalaryStatementAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TSalaryStatementEmployeeSnapshot {
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

export interface TSalaryStatementSalarySheetSnapshot {
  salarySheetId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
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

export interface TSalaryStatementSnapshot {
  employee?: TSalaryStatementEmployeeSnapshot | null;
  salarySheet?: TSalaryStatementSalarySheetSnapshot | null;
}

export interface TSalaryStatementAuditLog {
  action: TSalaryStatementAuditAction;
  fromStatus?: TSalaryStatementStatus | null;
  toStatus?: TSalaryStatementStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TSalaryStatement {
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

  status: TSalaryStatementStatus;
  isLocked: boolean;

  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date | null;
  processedBy?: Types.ObjectId | null;
  processedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;

  snapshot?: TSalaryStatementSnapshot | null;
  auditLogs: TSalaryStatementAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateSalaryStatementPayload {
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

export interface TSalaryStatementQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TSalaryStatementStatus;
  isLocked?: string;
}

export interface TSalaryStatementSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TSalaryStatementActionPayload {
  note?: string;
}

export type TSalaryStatementBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TSalaryStatementBulkActionPayload {
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
   * For bulk lock, strict=true prevents partial Salary Payment Distribution readiness.
   * Default behavior is strict, so every selected Salary Statement must already be approved.
   */
  strict?: boolean;
}

export interface SalaryStatementModel extends Model<TSalaryStatement> {}

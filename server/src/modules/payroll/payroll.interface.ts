import { Model, Types } from "mongoose";

export type TPayrollStatus = "draft" | "processed" | "approved" | "paid";

export type TPayrollAuditAction =
  | "generated"
  | "updated"
  | "processed"
  | "approved"
  | "paid"
  | "locked"
  | "unlocked";

export interface TPayrollAuditLog {
  action: TPayrollAuditAction;
  fromStatus?: TPayrollStatus | null;
  toStatus?: TPayrollStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TPayroll {
  employee: Types.ObjectId;
  payrollMonth: string;
  salaryStructure: Types.ObjectId;

  grossSalary: number;
  fixedDeduction: number;
  attendanceDeduction: number;
  netSalary: number;
  payableSalary: number;

  status: TPayrollStatus;
  remarks?: string;

  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;

  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;
  isLocked: boolean;

  auditLogs: TPayrollAuditLog[];

  isDeleted: boolean;
}

export interface PayrollModel extends Model<TPayroll> {}

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

export type TPayrollEmployeeSnapshot = {
  employeeDbId?: string;

  employeeId?: string;

  employeeName?: string;

  company?: {
    id?: string;
    name?: string;
  } | null;

  branch?: {
    id?: string;
    name?: string;
  } | null;

  department?: {
    id?: string;
    name?: string;
  } | null;

  designation?: {
    id?: string;
    name?: string;
  } | null;

  employmentType?: string | null;

  employmentStatus?: string | null;

  joiningDate?: Date | null;
};

export type TPayrollSalarySnapshot = {
  grossSalary?: number;

  fixedDeduction?: number;

  attendanceDeduction?: number;

  netSalary?: number;

  payableSalary?: number;

  /*
      OT SNAPSHOT
    */

  otHours?: number;

  otRate?: number;

  otAmount?: number;

  finalPayableSalary?: number;

  salaryStructureId?: string | null;
};

export type TPayrollPaymentSnapshot = {
  paymentMode?: "bank" | "cash" | "mobile_banking" | null;

  bankName?: string | null;

  bankBranchName?: string | null;

  bankBranchCode?: string | null;

  accountName?: string | null;

  accountNo?: string | null;

  routingNo?: string | null;

  mobileBankingType?: string | null;

  mobileBankingNo?: string | null;
};

export type TPayrollSnapshot = {
  employee?: TPayrollEmployeeSnapshot | null;

  salary?: TPayrollSalarySnapshot | null;

  payment?: TPayrollPaymentSnapshot | null;
};

export interface TPayroll {
  employee: Types.ObjectId;

  payrollMonth: string;

  salaryStructure: Types.ObjectId;

  grossSalary: number;

  fixedDeduction: number;

  attendanceDeduction: number;

  netSalary: number;

  payableSalary: number;

  /*
    OT ENGINE
  */

  otHours?: number;

  otRate?: number;

  otAmount?: number;

  finalPayableSalary?: number;

  status: TPayrollStatus;

  remarks?: string;

  approvedBy?: Types.ObjectId | null;

  approvedAt?: Date | null;

  lockedBy?: Types.ObjectId | null;

  lockedAt?: Date | null;

  isLocked: boolean;

  auditLogs: TPayrollAuditLog[];

  snapshot?: TPayrollSnapshot | null;

  isDeleted: boolean;
}

export interface PayrollModel extends Model<TPayroll> {}

import { Model, Types } from "mongoose";

export type TTimeBillStatus = "draft" | "processed" | "approved" | "locked";

export type TTimeBillAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TTimeBillEmployeeSnapshot {
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

export interface TTimeBillAttendanceSnapshot {
  attendanceFinalizationId: string;
  payrollMonth: string;
  status: string;
  isLocked: boolean;
  periodStartDate: string;
  periodEndDate: string;
  totalDutyDays: number;
  totalPayableDays: number;
  totalOtHours: number;
  totalTiffinDays: number;
  totalHolidayDutyDays: number;
  generatedRuleVersion?: string;
}

export interface TTimeBillSalarySnapshot {
  salaryStructureId: string;
  grossSalary: number;
  dutyHourPerDay: number;
  otRate: number;
  tiffinRate: number;
}

export interface TTimeBillAuditLog {
  action: TTimeBillAuditAction;
  fromStatus?: TTimeBillStatus | null;
  toStatus?: TTimeBillStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TTimeBillSnapshot {
  employee?: TTimeBillEmployeeSnapshot | null;
  attendance?: TTimeBillAttendanceSnapshot | null;
  salary?: TTimeBillSalarySnapshot | null;
}

export interface TTimeBill {
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

  status: TTimeBillStatus;
  isLocked: boolean;

  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date | null;
  processedBy?: Types.ObjectId | null;
  processedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;

  snapshot?: TTimeBillSnapshot | null;
  auditLogs: TTimeBillAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateTimeBillPayload {
  month: number;
  year: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  tiffinRate?: number;
  overwrite?: boolean;
  remarks?: string;
}

export interface TTimeBillQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TTimeBillStatus;
  isLocked?: string;
}

export interface TTimeBillSummaryQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TTimeBillActionPayload {
  note?: string;
}

export interface TimeBillModel extends Model<TTimeBill> {}

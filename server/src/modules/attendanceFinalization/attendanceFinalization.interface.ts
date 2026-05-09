import { Types } from "mongoose";

export type TAttendanceFinalizationStatus =
  | "draft"
  | "finalized"
  | "approved"
  | "locked";

export type TAttendanceFinalizationAuditAction =
  | "generated"
  | "regenerated"
  | "finalized"
  | "approved"
  | "locked"
  | "unlocked";

export interface TAttendanceFinalizationEmployeeSnapshot {
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

export interface TAttendanceFinalizationSourceSummary {
  rawAttendanceCount: number;
  approvedLeaveCount: number;
  holidayCount: number;
  missingAttendanceDays: number;
  missingApprovedLeaveDays: number;
  generatedRuleVersion: string;
}

export interface TAttendanceFinalizationAuditLog {
  action: TAttendanceFinalizationAuditAction;
  fromStatus?: TAttendanceFinalizationStatus | null;
  toStatus?: TAttendanceFinalizationStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TAttendanceFinalization {
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

  totalCalendarDays: number;
  totalPresentDays: number;
  totalLateDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalHolidayDays: number;
  totalWeekendDays: number;
  totalHalfDays: number;
  totalDutyDays: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalOtHours: number;
  totalTiffinDays: number;
  totalHolidayDutyDays: number;

  status: TAttendanceFinalizationStatus;
  isLocked: boolean;

  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date | null;
  finalizedBy?: Types.ObjectId | null;
  finalizedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;

  employeeSnapshot?: TAttendanceFinalizationEmployeeSnapshot | null;
  sourceSummary?: TAttendanceFinalizationSourceSummary | null;
  auditLogs: TAttendanceFinalizationAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateAttendanceFinalizationPayload {
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

export interface TAttendanceFinalizationQuery {
  payrollMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  status?: TAttendanceFinalizationStatus;
  isLocked?: string;
}

export interface TAttendanceFinalizationActionPayload {
  note?: string;
}

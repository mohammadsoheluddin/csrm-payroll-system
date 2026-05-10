import { Types } from "mongoose";
import type { TLeaveType } from "../leave/leave.constant";

export type TLeaveBalanceStatus = "generated" | "locked";

export type TLeaveBalanceActionType = "lock" | "unlock";

export interface TLeaveBalanceEmployeeSnapshot {
  employeeId: string;
  officeId?: string;
  cardNo?: string;
  name: string;
  joiningDate: string;
  employmentStatus: string;
  serviceType: string;
  payType: string;
}

export interface TLeaveBalanceSourceSummary {
  approvedLeaveIds: string[];
  pendingLeaveIds: string[];
  rejectedLeaveIds: string[];
  cancelledLeaveIds: string[];
  replacementEarnedAttendanceIds: string[];
  replacementEarnedHolidayDates: string[];
}

export interface TLeaveBalanceActionHistory {
  action: TLeaveBalanceActionType | "generate";
  actionAt: Date;
  actionBy?: Types.ObjectId | null;
  note?: string;
}

export interface TLeaveBalance {
  employee: Types.ObjectId;
  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  department: Types.ObjectId;
  designation: Types.ObjectId;
  branch: Types.ObjectId;

  employeeSnapshot: TLeaveBalanceEmployeeSnapshot;

  year: number;
  yearStartDate: string;
  yearEndDate: string;

  leaveType: TLeaveType;
  leaveLabel: string;
  isLimited: boolean;
  isPaidLeave: boolean;

  openingBalance: number;
  yearlyEntitlement: number;
  earnedDays: number;
  adjustedDays: number;

  approvedConsumedDays: number;
  pendingDays: number;
  rejectedDays: number;
  cancelledDays: number;

  totalCreditDays: number;
  remainingDays: number;
  availableDays: number;
  overConsumedDays: number;

  sourceSummary: TLeaveBalanceSourceSummary;

  status: TLeaveBalanceStatus;
  isLocked: boolean;
  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date;
  unlockedBy?: Types.ObjectId | null;
  unlockedAt?: Date;
  actionHistory: TLeaveBalanceActionHistory[];

  remarks?: string;
  isDeleted?: boolean;
}

export interface TGenerateLeaveBalancePayload {
  year: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  overwrite?: boolean;
  generatedBy?: string;
  remarks?: string;
}

export interface TLeaveBalanceQuery {
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  leaveType?: TLeaveType;
  status?: TLeaveBalanceStatus;
  isLocked?: string;
}

export interface TLeaveBalanceSummaryQuery {
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}

export interface TLeaveBalanceActionPayload {
  note?: string;
  actionBy?: string;
}

export interface TLeaveBalanceBulkActionPayload extends TLeaveBalanceSummaryQuery {
  note?: string;
  actionBy?: string;
  strict?: boolean;
}

import { Types } from "mongoose";
import type { TLeaveType } from "../leave/leave.constant";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TLeaveBalanceStatus = "generated" | "locked";

export type TLeaveBalanceActionType =
  | "generate"
  | "lock"
  | "unlock"
  | "set_opening_balance"
  | "adjustment_credit"
  | "adjustment_debit"
  | "soft_delete"
  | "restore";

export type TLeaveBalanceCarryForwardPolicy = "no_carry_forward";

export type TLeaveBalanceAdjustmentType = "credit" | "debit";

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
  previousYearLeaveBalanceId?: string;
}

export interface TLeaveBalanceActionHistory {
  action: TLeaveBalanceActionType;
  actionAt: Date;
  actionBy?: Types.ObjectId | null;
  note?: string;
  reason?: string;
  effectiveDate?: string;
  days?: number;
  openingBalanceBefore?: number;
  openingBalanceAfter?: number;
  adjustedDaysBefore?: number;
  adjustedDaysAfter?: number;
}

export interface TLeaveBalance  extends TSoftDeleteFields {
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

  carryForwardPolicy: TLeaveBalanceCarryForwardPolicy;
  carryForwardFromPreviousYear: number;
  expiredPreviousYearRemainingDays: number;

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

export interface TLeaveBalanceOpeningBalancePayload extends TLeaveBalanceActionPayload {
  openingBalance: number;
  reason: string;
  effectiveDate?: string;
}

export interface TLeaveBalanceAdjustmentPayload extends TLeaveBalanceActionPayload {
  adjustmentType: TLeaveBalanceAdjustmentType;
  days: number;
  reason: string;
  effectiveDate?: string;
}

export interface TLeaveBalanceBulkActionPayload extends TLeaveBalanceSummaryQuery {
  note?: string;
  actionBy?: string;
  strict?: boolean;
}

export type TLeaveBalanceLedgerTransactionType =
  | "opening_balance"
  | "yearly_entitlement"
  | "earned_replacement"
  | "expired_previous_year_balance"
  | "adjustment_credit"
  | "adjustment_debit"
  | "leave_approved"
  | "leave_pending"
  | "leave_rejected"
  | "leave_cancelled";

export interface TLeaveBalanceExportRow {
  slNo: number;
  leaveBalanceId: string;
  employeeId: string;
  officeId?: string;
  cardNo?: string;
  employeeName: string;
  designation: string;
  department: string;
  branch: string;
  leaveType: TLeaveType;
  leaveLabel: string;
  openingBalance: number;
  yearlyEntitlement: number;
  earnedDays: number;
  adjustedDays: number;
  expiredPreviousYearRemainingDays: number;
  totalCreditDays: number;
  approvedConsumedDays: number;
  pendingDays: number;
  remainingDays: number;
  availableDays: number;
  overConsumedDays: number;
  status: TLeaveBalanceStatus;
  isLocked: boolean;
}

export interface TLeaveBalanceExportPreview {
  year: number | null;
  filters: TLeaveBalanceQuery;
  summary: {
    year: number | null;
    totalRecords: number;
    totalEmployees: number;
    openingBalanceDays: number;
    yearlyEntitlementDays: number;
    earnedDays: number;
    adjustedDays: number;
    expiredPreviousYearRemainingDays: number;
    totalCreditDays: number;
    approvedConsumedDays: number;
    pendingDays: number;
    remainingDays: number;
    availableDays: number;
    overConsumedDays: number;
    lockedRecords: number;
  };
  rows: TLeaveBalanceExportRow[];
}

export interface TLeaveBalanceExportFileResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TLeaveBalanceExportPreview | TLeaveBalanceLedgerPreview;
}

export interface TLeaveBalanceLedgerQuery {
  year?: string;
  company?: string;
  employee: string;
  leaveType?: TLeaveType;
}

export interface TLeaveBalanceLedgerEmployeeInfo {
  employeeId: string;
  officeId?: string;
  cardNo?: string;
  name: string;
  designation?: string;
  department?: string;
  branch?: string;
}

export interface TLeaveBalanceLedgerEntry {
  slNo: number;
  entryDate: string;
  leaveType: TLeaveType;
  leaveLabel: string;
  transactionType: TLeaveBalanceLedgerTransactionType;
  status?: string;
  reference?: string;
  creditDays: number;
  debitDays: number;
  pendingDays: number;
  balanceAfter: number | null;
  reason?: string;
  note?: string;
}

export interface TLeaveBalanceLedgerPreview {
  employee: TLeaveBalanceLedgerEmployeeInfo;
  filters: TLeaveBalanceLedgerQuery;
  summary: {
    year: number | null;
    leaveType?: TLeaveType;
    totalEntries: number;
    totalCreditDays: number;
    totalDebitDays: number;
    totalPendingDays: number;
    byLeaveType: Partial<
      Record<
        TLeaveType,
        {
          totalCreditDays: number;
          totalDebitDays: number;
          totalPendingDays: number;
          balanceAfter: number | null;
        }
      >
    >;
  };
  entries: TLeaveBalanceLedgerEntry[];
}

import { Types } from "mongoose";
import type { TLeaveStatus, TLeaveType } from "./leave.constant";

export type { TLeaveStatus, TLeaveType } from "./leave.constant";

export interface TLeave {
  employee: Types.ObjectId;
  leaveType: TLeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status?: TLeaveStatus;
  approvedBy?: Types.ObjectId;
  approvalNote?: string;

  /**
   * Management controlled leave:
   * paid / unpaid / others
   */
  isManagementApproved?: boolean;
  managementApprovalNote?: string;

  /**
   * Replacement leave:
   * used when an employee worked on an official holiday / weekly holiday.
   */
  replacementForDate?: string;

  isDeleted?: boolean;
}

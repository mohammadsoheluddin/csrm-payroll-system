import { Types } from "mongoose";
import type { TLeaveStatus, TLeaveType } from "./leave.constant";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type { TLeaveStatus, TLeaveType } from "./leave.constant";

export interface TLeave  extends TSoftDeleteFields {
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
   * Management concern means management has given concern/instruction,
   * but final system approval still happens through HR/Admin/authorized approval flow.
   */
  managementConcern?: boolean;
  managementConcernNote?: string;
  managementConcernBy?: Types.ObjectId;

  /**
   * Replacement leave:
   * Used when an employee worked on an official holiday and later takes replacement leave.
   */
  replacementForDate?: string;

  isDeleted?: boolean;
}

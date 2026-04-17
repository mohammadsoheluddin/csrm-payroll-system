import { Types } from "mongoose";

export type TLeaveType =
  | "casual"
  | "sick"
  | "earned"
  | "unpaid"
  | "maternity"
  | "paternity"
  | "official"
  | "others";

export type TLeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

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
  isDeleted?: boolean;
}

export const LEAVE_TYPES = [
  "casual",
  "sick",
  "earned",
  "paid",
  "unpaid",
  "maternity",
  "paternity",
  "official",
  "replacement",
  "others",
] as const;

export const LEAVE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export const LEAVE_APPROVAL_STATUSES = [
  "approved",
  "rejected",
  "cancelled",
] as const;

export type TLeaveType = (typeof LEAVE_TYPES)[number];
export type TLeaveStatus = (typeof LEAVE_STATUSES)[number];

export const ACTIVE_LEAVE_STATUSES: TLeaveStatus[] = ["pending", "approved"];

export const LIMITED_LEAVE_POLICIES = {
  casual: {
    annualLimit: 8,
    label: "Casual Leave",
  },
  sick: {
    annualLimit: 10,
    label: "Sick Leave",
  },
} as const;

export const MANAGEMENT_CONTROLLED_LEAVE_TYPES = [
  "paid",
  "unpaid",
  "others",
] as const;

export const REPLACEMENT_LEAVE_TYPE = "replacement";

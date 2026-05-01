import { Schema, model } from "mongoose";
import { LEAVE_STATUSES, LEAVE_TYPES } from "./leave.constant";
import type { TLeave } from "./leave.interface";

const leaveSchema = new Schema<TLeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
      trim: true,
    },
    endDate: {
      type: String,
      required: true,
      trim: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: LEAVE_STATUSES,
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvalNote: {
      type: String,
      trim: true,
    },
    isManagementApproved: {
      type: Boolean,
      default: false,
    },
    managementApprovalNote: {
      type: String,
      trim: true,
    },
    replacementForDate: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

leaveSchema.index({
  employee: 1,
  leaveType: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
  isDeleted: 1,
});

leaveSchema.index({
  employee: 1,
  leaveType: 1,
  replacementForDate: 1,
  status: 1,
  isDeleted: 1,
});

const Leave = model<TLeave>("Leave", leaveSchema);

export default Leave;

import { Schema, model } from "mongoose";
import { LEAVE_TYPES } from "../leave/leave.constant";
import type { TLeaveBalance } from "./leaveBalance.interface";

const leaveBalanceEmployeeSnapshotSchema = new Schema(
  {
    employeeId: { type: String, required: true, trim: true },
    officeId: { type: String, trim: true },
    cardNo: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    joiningDate: { type: String, required: true, trim: true },
    employmentStatus: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    payType: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const leaveBalanceSourceSummarySchema = new Schema(
  {
    approvedLeaveIds: { type: [String], default: [] },
    pendingLeaveIds: { type: [String], default: [] },
    rejectedLeaveIds: { type: [String], default: [] },
    cancelledLeaveIds: { type: [String], default: [] },
    replacementEarnedAttendanceIds: { type: [String], default: [] },
    replacementEarnedHolidayDates: { type: [String], default: [] },
  },
  { _id: false },
);

const leaveBalanceActionHistorySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["generate", "lock", "unlock"],
      required: true,
    },
    actionAt: { type: Date, required: true },
    actionBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, trim: true },
  },
  { _id: false },
);

const leaveBalanceSchema = new Schema<TLeaveBalance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    majorDepartment: {
      type: Schema.Types.ObjectId,
      ref: "MajorDepartment",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    designation: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    employeeSnapshot: {
      type: leaveBalanceEmployeeSnapshotSchema,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    yearStartDate: {
      type: String,
      required: true,
      trim: true,
    },
    yearEndDate: {
      type: String,
      required: true,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: true,
    },
    leaveLabel: {
      type: String,
      required: true,
      trim: true,
    },
    isLimited: {
      type: Boolean,
      required: true,
    },
    isPaidLeave: {
      type: Boolean,
      required: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    yearlyEntitlement: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustedDays: {
      type: Number,
      default: 0,
    },
    approvedConsumedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    rejectedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCreditDays: {
      type: Number,
      default: 0,
    },
    remainingDays: {
      type: Number,
      default: 0,
    },
    availableDays: {
      type: Number,
      default: 0,
    },
    overConsumedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    sourceSummary: {
      type: leaveBalanceSourceSummarySchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["generated", "locked"],
      default: "generated",
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
    },
    unlockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    unlockedAt: {
      type: Date,
    },
    actionHistory: {
      type: [leaveBalanceActionHistorySchema],
      default: [],
    },
    remarks: {
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

leaveBalanceSchema.index(
  { employee: 1, year: 1, leaveType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

leaveBalanceSchema.index({ company: 1, year: 1, leaveType: 1, isLocked: 1 });
leaveBalanceSchema.index({ majorDepartment: 1, department: 1, branch: 1 });
leaveBalanceSchema.index({ status: 1, isDeleted: 1 });

const LeaveBalance = model<TLeaveBalance>("LeaveBalance", leaveBalanceSchema);

export default LeaveBalance;

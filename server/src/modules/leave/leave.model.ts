import { Schema, model } from "mongoose";
import { TLeave } from "./leave.interface";

const leaveSchema = new Schema<TLeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "casual",
        "sick",
        "earned",
        "unpaid",
        "maternity",
        "paternity",
        "official",
        "others",
      ],
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
      enum: ["pending", "approved", "rejected", "cancelled"],
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });

const Leave = model<TLeave>("Leave", leaveSchema);

export default Leave;

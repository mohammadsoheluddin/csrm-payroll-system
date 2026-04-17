import { Schema, model } from "mongoose";
import { TAttendance } from "./attendance.interface";

const attendanceSchema = new Schema<TAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      trim: true,
    },
    checkInTime: {
      type: String,
      trim: true,
    },
    checkOutTime: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "late",
        "leave",
        "half-day",
        "weekend",
        "holiday",
      ],
      default: "present",
    },
    source: {
      type: String,
      enum: ["manual", "device", "import"],
      default: "manual",
    },
    remarks: {
      type: String,
      trim: true,
    },
    deviceId: {
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

attendanceSchema.index({ employee: 1, attendanceDate: 1 });

const Attendance = model<TAttendance>("Attendance", attendanceSchema);

export default Attendance;

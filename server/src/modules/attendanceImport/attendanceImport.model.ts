import { Schema, model } from "mongoose";
import type { TAttendanceImportBatch } from "./attendanceImport.interface";

const rejectedRowSchema = new Schema(
  {
    rowNo: Number,
    employeeIdentifier: {
      type: String,
      trim: true,
    },
    attendanceDate: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  },
);

const processedAttendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
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
      required: true,
    },
    action: {
      type: String,
      enum: ["insert", "update", "skip"],
      required: true,
    },
    existingAttendance: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
    },
    attendance: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
    },
    deviceId: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const attendanceImportBatchSchema = new Schema<TAttendanceImportBatch>(
  {
    batchNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    source: {
      type: String,
      enum: ["device", "excel", "manual_bulk", "api"],
      required: true,
    },
    matchBy: {
      type: String,
      enum: ["employeeId", "officeId", "cardNo"],
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    majorDepartment: {
      type: Schema.Types.ObjectId,
      ref: "MajorDepartment",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
    deviceId: {
      type: String,
      trim: true,
    },
    sourceFileName: {
      type: String,
      trim: true,
    },
    overwrite: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["committed", "failed"],
      default: "committed",
    },
    totalRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    validRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    invalidRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    groupedAttendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    insertedAttendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedAttendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    skippedAttendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rejectedRows: {
      type: [rejectedRowSchema],
      default: [],
    },
    processedAttendances: {
      type: [processedAttendanceSchema],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
    remarks: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
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

attendanceImportBatchSchema.index({ source: 1, createdAt: -1 });
attendanceImportBatchSchema.index({ company: 1, createdAt: -1 });
attendanceImportBatchSchema.index({ department: 1, createdAt: -1 });
attendanceImportBatchSchema.index({ branch: 1, createdAt: -1 });
attendanceImportBatchSchema.index({ deviceId: 1, createdAt: -1 });
attendanceImportBatchSchema.index({ isDeleted: 1, createdAt: -1 });

const AttendanceImportBatch = model<TAttendanceImportBatch>(
  "AttendanceImportBatch",
  attendanceImportBatchSchema,
);

export default AttendanceImportBatch;

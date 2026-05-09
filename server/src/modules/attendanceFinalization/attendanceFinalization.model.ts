import { Schema, model } from "mongoose";
import {
  TAttendanceFinalization,
  TAttendanceFinalizationAuditLog,
  TAttendanceFinalizationEmployeeSnapshot,
  TAttendanceFinalizationSourceSummary,
} from "./attendanceFinalization.interface";

const attendanceFinalizationEmployeeSnapshotSchema =
  new Schema<TAttendanceFinalizationEmployeeSnapshot>(
    {
      employeeDbId: {
        type: String,
        default: "",
      },
      employeeId: {
        type: String,
        default: "",
      },
      employeeName: {
        type: String,
        default: "",
      },
      officeId: {
        type: String,
        default: "",
      },
      cardNo: {
        type: String,
        default: "",
      },
      company: {
        id: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
        },
      },
      majorDepartment: {
        id: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
        },
      },
      department: {
        id: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
        },
      },
      designation: {
        id: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
        },
      },
      branch: {
        id: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
        },
      },
      serviceType: {
        type: String,
        default: "",
      },
      payType: {
        type: String,
        default: "",
      },
      employmentStatus: {
        type: String,
        default: "",
      },
      joiningDate: {
        type: String,
        default: "",
      },
      dutyHourPerDay: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    },
  );

const attendanceFinalizationSourceSummarySchema =
  new Schema<TAttendanceFinalizationSourceSummary>(
    {
      rawAttendanceCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      approvedLeaveCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      holidayCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      missingAttendanceDays: {
        type: Number,
        default: 0,
        min: 0,
      },
      missingApprovedLeaveDays: {
        type: Number,
        default: 0,
        min: 0,
      },
      generatedRuleVersion: {
        type: String,
        default: "attendance-finalization-v1",
      },
    },
    {
      _id: false,
    },
  );

const attendanceFinalizationAuditLogSchema =
  new Schema<TAttendanceFinalizationAuditLog>(
    {
      action: {
        type: String,
        enum: [
          "generated",
          "regenerated",
          "finalized",
          "approved",
          "locked",
          "unlocked",
        ],
        required: true,
      },
      fromStatus: {
        type: String,
        enum: ["draft", "finalized", "approved", "locked"],
        default: null,
      },
      toStatus: {
        type: String,
        enum: ["draft", "finalized", "approved", "locked"],
        default: null,
      },
      actionBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      actionAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
      note: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      _id: false,
    },
  );

const attendanceFinalizationSchema = new Schema<TAttendanceFinalization>(
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

    payrollMonth: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    periodStartDate: {
      type: String,
      required: true,
      trim: true,
    },
    periodEndDate: {
      type: String,
      required: true,
      trim: true,
    },

    totalCalendarDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPresentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLateDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAbsentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUnpaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHolidayDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWeekendDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHalfDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDutyDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPayableDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeductionDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOtHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTiffinDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHolidayDutyDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "finalized", "approved", "locked"],
      default: "draft",
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
      default: null,
    },
    finalizedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },

    employeeSnapshot: {
      type: attendanceFinalizationEmployeeSnapshotSchema,
      default: null,
    },
    sourceSummary: {
      type: attendanceFinalizationSourceSummarySchema,
      default: null,
    },
    auditLogs: {
      type: [attendanceFinalizationAuditLogSchema],
      default: [],
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
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

attendanceFinalizationSchema.index(
  {
    employee: 1,
    payrollMonth: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

attendanceFinalizationSchema.index({
  payrollMonth: 1,
  company: 1,
  majorDepartment: 1,
  department: 1,
  branch: 1,
  status: 1,
  isDeleted: 1,
});

attendanceFinalizationSchema.index({
  employee: 1,
  status: 1,
  isLocked: 1,
  isDeleted: 1,
});

const AttendanceFinalization = model<TAttendanceFinalization>(
  "AttendanceFinalization",
  attendanceFinalizationSchema,
);

export default AttendanceFinalization;

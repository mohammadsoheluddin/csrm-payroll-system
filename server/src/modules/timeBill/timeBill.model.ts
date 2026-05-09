import { Schema, model } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import {
  TimeBillModel,
  TTimeBill,
  TTimeBillAuditLog,
  TTimeBillAttendanceSnapshot,
  TTimeBillEmployeeSnapshot,
  TTimeBillSalarySnapshot,
  TTimeBillSnapshot,
} from "./timeBill.interface";

const timeBillEmployeeSnapshotSchema = new Schema<TTimeBillEmployeeSnapshot>(
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

const timeBillAttendanceSnapshotSchema = new Schema<TTimeBillAttendanceSnapshot>(
  {
    attendanceFinalizationId: {
      type: String,
      default: "",
    },
    payrollMonth: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    periodStartDate: {
      type: String,
      default: "",
    },
    periodEndDate: {
      type: String,
      default: "",
    },
    totalDutyDays: {
      type: Number,
      default: 0,
    },
    totalPayableDays: {
      type: Number,
      default: 0,
    },
    totalOtHours: {
      type: Number,
      default: 0,
    },
    totalTiffinDays: {
      type: Number,
      default: 0,
    },
    totalHolidayDutyDays: {
      type: Number,
      default: 0,
    },
    generatedRuleVersion: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const timeBillSalarySnapshotSchema = new Schema<TTimeBillSalarySnapshot>(
  {
    salaryStructureId: {
      type: String,
      default: "",
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    dutyHourPerDay: {
      type: Number,
      default: 0,
    },
    otRate: {
      type: Number,
      default: 0,
    },
    tiffinRate: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const timeBillSnapshotSchema = new Schema<TTimeBillSnapshot>(
  {
    employee: {
      type: timeBillEmployeeSnapshotSchema,
      default: null,
    },
    attendance: {
      type: timeBillAttendanceSnapshotSchema,
      default: null,
    },
    salary: {
      type: timeBillSalarySnapshotSchema,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const timeBillAuditLogSchema = new Schema<TTimeBillAuditLog>(
  {
    action: {
      type: String,
      enum: [
        "generated",
        "regenerated",
        "processed",
        "approved",
        "locked",
        "unlocked",
      ],
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ["draft", "processed", "approved", "locked"],
      default: null,
    },
    toStatus: {
      type: String,
      enum: ["draft", "processed", "approved", "locked"],
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

const payrollImmutableSealSchema = new Schema<TPayrollImmutableSeal>(
  {
    sealVersion: { type: String, required: true, trim: true },
    sourceModule: { type: String, required: true, trim: true },
    sourceId: { type: String, required: true, trim: true },
    checksum: { type: String, required: true, trim: true },
    sealedAt: { type: Date, required: true },
    sealedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const timeBillSchema = new Schema<TTimeBill, TimeBillModel>(
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

    attendanceFinalization: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceFinalization",
      required: true,
    },
    salaryStructure: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    dutyHourPerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    otHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    otRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    otAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tiffinDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    tiffinRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    tiffinAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPayableAmount: {
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
    totalHolidayDutyDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "processed", "approved", "locked"],
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
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
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

    immutableSeal: { type: payrollImmutableSealSchema, default: null },
    snapshot: {
      type: timeBillSnapshotSchema,
      default: null,
    },
    auditLogs: {
      type: [timeBillAuditLogSchema],
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

timeBillSchema.index(
  {
    employee: 1,
    payrollMonth: 1,
  },
  {
    unique: true,
  },
);

timeBillSchema.index({
  payrollMonth: 1,
  company: 1,
  majorDepartment: 1,
  department: 1,
  branch: 1,
  status: 1,
  isLocked: 1,
  isDeleted: 1,
});

timeBillSchema.index({
  attendanceFinalization: 1,
  payrollMonth: 1,
  isDeleted: 1,
});

const TimeBill = model<TTimeBill, TimeBillModel>("TimeBill", timeBillSchema);

export default TimeBill;

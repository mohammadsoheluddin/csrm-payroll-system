import { Schema, model } from "mongoose";
import {
  OtStatementModel,
  TOtStatement,
  TOtStatementAuditLog,
  TOtStatementEmployeeSnapshot,
  TOtStatementSnapshot,
  TOtStatementTimeBillSnapshot,
} from "./otStatement.interface";

const otStatementEmployeeSnapshotSchema =
  new Schema<TOtStatementEmployeeSnapshot>(
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

const otStatementTimeBillSnapshotSchema =
  new Schema<TOtStatementTimeBillSnapshot>(
    {
      timeBillId: {
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
      attendanceFinalizationId: {
        type: String,
        default: "",
      },
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
      otHours: {
        type: Number,
        default: 0,
      },
      otRate: {
        type: Number,
        default: 0,
      },
      otAmount: {
        type: Number,
        default: 0,
      },
      tiffinDays: {
        type: Number,
        default: 0,
      },
      tiffinRate: {
        type: Number,
        default: 0,
      },
      tiffinAmount: {
        type: Number,
        default: 0,
      },
      totalPayableAmount: {
        type: Number,
        default: 0,
      },
      totalDutyDays: {
        type: Number,
        default: 0,
      },
      totalPayableDays: {
        type: Number,
        default: 0,
      },
      totalHolidayDutyDays: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    },
  );

const otStatementSnapshotSchema = new Schema<TOtStatementSnapshot>(
  {
    employee: {
      type: otStatementEmployeeSnapshotSchema,
      default: null,
    },
    timeBill: {
      type: otStatementTimeBillSnapshotSchema,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const otStatementAuditLogSchema = new Schema<TOtStatementAuditLog>(
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

const otStatementSchema = new Schema<TOtStatement, OtStatementModel>(
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

    timeBill: {
      type: Schema.Types.ObjectId,
      ref: "TimeBill",
      required: true,
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

    snapshot: {
      type: otStatementSnapshotSchema,
      default: null,
    },
    auditLogs: {
      type: [otStatementAuditLogSchema],
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

otStatementSchema.index(
  {
    employee: 1,
    payrollMonth: 1,
  },
  {
    unique: true,
  },
);

otStatementSchema.index({
  payrollMonth: 1,
  company: 1,
  majorDepartment: 1,
  department: 1,
  branch: 1,
  status: 1,
  isLocked: 1,
  isDeleted: 1,
});

otStatementSchema.index({
  timeBill: 1,
  payrollMonth: 1,
  isDeleted: 1,
});

const OtStatement = model<TOtStatement, OtStatementModel>(
  "OtStatement",
  otStatementSchema,
);

export default OtStatement;

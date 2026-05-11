import { Schema, model } from "mongoose";

import { PayrollModel, TPayroll, TPayrollAuditLog } from "./payroll.interface";

import { softDeleteSchemaFields } from "../../common/softDelete";
const payrollAuditLogSchema = new Schema<TPayrollAuditLog>(
  {
    action: {
      type: String,

      enum: [
        "generated",
        "updated",
        "processed",
        "approved",
        "paid",
        "locked",
        "unlocked",
      ],

      required: true,
    },

    fromStatus: {
      type: String,

      enum: ["draft", "processed", "approved", "paid"],

      default: null,
    },

    toStatus: {
      type: String,

      enum: ["draft", "processed", "approved", "paid"],

      default: null,
    },

    actionBy: {
      type: Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },

    actionAt: {
      type: Date,

      required: true,

      default: Date.now,
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

const payrollSnapshotSchema = new Schema(
  {
    employee: {
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

      employmentType: {
        type: String,

        default: "",
      },

      employmentStatus: {
        type: String,

        default: "",
      },

      joiningDate: {
        type: Date,

        default: null,
      },
    },

    salary: {
      grossSalary: {
        type: Number,

        default: 0,
      },

      perDaySalary: {
        type: Number,

        default: 0,
      },

      fixedDeduction: {
        type: Number,

        default: 0,
      },

      attendanceDeduction: {
        type: Number,

        default: 0,
      },

      netSalary: {
        type: Number,

        default: 0,
      },

      payableSalary: {
        type: Number,

        default: 0,
      },

      /*
          OT SNAPSHOT
        */

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

      finalPayableSalary: {
        type: Number,

        default: 0,
      },

      salaryStructureId: {
        type: String,

        default: "",
      },
    },

    attendanceFinalization: {
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

      totalCalendarDays: {
        type: Number,

        default: 0,
      },

      totalPayableDays: {
        type: Number,

        default: 0,
      },

      totalDeductionDays: {
        type: Number,

        default: 0,
      },

      totalAbsentDays: {
        type: Number,

        default: 0,
      },

      totalPaidLeaveDays: {
        type: Number,

        default: 0,
      },

      totalUnpaidLeaveDays: {
        type: Number,

        default: 0,
      },

      totalDutyDays: {
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

      generatedRuleVersion: {
        type: String,

        default: "",
      },
    },

    payment: {
      paymentMode: {
        type: String,

        default: "",
      },

      bankName: {
        type: String,

        default: "",
      },

      bankBranchName: {
        type: String,

        default: "",
      },

      bankBranchCode: {
        type: String,

        default: "",
      },

      accountName: {
        type: String,

        default: "",
      },

      accountNo: {
        type: String,

        default: "",
      },

      routingNo: {
        type: String,

        default: "",
      },

      mobileBankingType: {
        type: String,

        default: "",
      },

      mobileBankingNo: {
        type: String,

        default: "",
      },
    },
  },
  {
    _id: false,
  },
);

const payrollSchema = new Schema<TPayroll, PayrollModel>(
  {
    employee: {
      type: Schema.Types.ObjectId,

      ref: "Employee",

      required: true,
    },

    payrollMonth: {
      type: String,

      required: true,

      trim: true,
    },

    salaryStructure: {
      type: Schema.Types.ObjectId,

      ref: "SalaryStructure",

      required: true,
    },

    attendanceFinalization: {
      type: Schema.Types.ObjectId,

      ref: "AttendanceFinalization",

      default: null,
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

    totalAbsentDays: {
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

    grossSalary: {
      type: Number,

      required: true,

      min: 0,
    },

    fixedDeduction: {
      type: Number,

      required: true,

      min: 0,

      default: 0,
    },

    attendanceDeduction: {
      type: Number,

      required: true,

      min: 0,

      default: 0,
    },

    netSalary: {
      type: Number,

      required: true,

      min: 0,
    },

    payableSalary: {
      type: Number,

      required: true,

      min: 0,
    },

    /*
        OT ENGINE
      */

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

    finalPayableSalary: {
      type: Number,

      default: 0,

      min: 0,
    },

    status: {
      type: String,

      enum: ["draft", "processed", "approved", "paid"],

      default: "draft",
    },

    remarks: {
      type: String,

      trim: true,

      default: "",
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

    isLocked: {
      type: Boolean,

      default: false,
    },

    auditLogs: {
      type: [payrollAuditLogSchema],

      default: [],
    },

    snapshot: {
      type: payrollSnapshotSchema,

      default: null,
    },

    ...softDeleteSchemaFields,
  },
  {
    timestamps: true,
  },
);

payrollSchema.index(
  {
    employee: 1,
    payrollMonth: 1,
  },
  {
    unique: true,
  },
);

payrollSchema.index({
  attendanceFinalization: 1,
  payrollMonth: 1,
  isDeleted: 1,
});

export const Payroll = model<TPayroll, PayrollModel>("Payroll", payrollSchema);

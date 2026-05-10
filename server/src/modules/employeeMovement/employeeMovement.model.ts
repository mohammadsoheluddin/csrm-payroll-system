import { Schema, model } from "mongoose";

import {
  EmployeeMovementModel,
  TEmployeeMovement,
  TEmployeeMovementAuditLog,
  TEmployeeMovementPayrollImpact,
} from "./employeeMovement.interface";

const movementAuditLogSchema = new Schema<TEmployeeMovementAuditLog>(
  {
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "submitted",
        "approved",
        "rejected",
        "applied",
        "payroll_impact_checked",
      ],
      required: true,
    },

    fromStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "applied"],
      default: null,
    },

    toStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "applied"],
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

const idNameSnapshotSchema = new Schema(
  {
    id: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const movementSalaryInfoSchema = new Schema(
  {
    grossSalary: {
      type: Number,
      default: 0,
    },

    basicSalary: {
      type: Number,
      default: 0,
    },

    houseRent: {
      type: Number,
      default: 0,
    },

    medicalAllowance: {
      type: Number,
      default: 0,
    },

    transportAllowance: {
      type: Number,
      default: 0,
    },

    otherAllowance: {
      type: Number,
      default: 0,
    },

    taxDeduction: {
      type: Number,
      default: 0,
    },

    providentFund: {
      type: Number,
      default: 0,
    },

    loanDeduction: {
      type: Number,
      default: 0,
    },

    otherDeduction: {
      type: Number,
      default: 0,
    },

    totalDeduction: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const movementServiceInfoSchema = new Schema(
  {
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

    dutyHourPerDay: {
      type: Number,
      default: 0,
    },

    leaveDay: {
      type: Number,
      default: 0,
    },

    confirmationDate: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const employeeMovementSnapshotSchema = new Schema(
  {
    employeeId: {
      type: String,
      default: "",
    },

    employeeName: {
      type: String,
      default: "",
    },

    company: {
      type: idNameSnapshotSchema,
      default: null,
    },

    fromMajorDepartment: {
      type: idNameSnapshotSchema,
      default: null,
    },

    toMajorDepartment: {
      type: idNameSnapshotSchema,
      default: null,
    },

    fromDepartment: {
      type: idNameSnapshotSchema,
      default: null,
    },

    toDepartment: {
      type: idNameSnapshotSchema,
      default: null,
    },

    fromDesignation: {
      type: idNameSnapshotSchema,
      default: null,
    },

    toDesignation: {
      type: idNameSnapshotSchema,
      default: null,
    },

    fromBranch: {
      type: idNameSnapshotSchema,
      default: null,
    },

    toBranch: {
      type: idNameSnapshotSchema,
      default: null,
    },

    fromServiceInfo: {
      type: movementServiceInfoSchema,
      default: null,
    },

    toServiceInfo: {
      type: movementServiceInfoSchema,
      default: null,
    },

    fromSalary: {
      type: movementSalaryInfoSchema,
      default: null,
    },

    toSalary: {
      type: movementSalaryInfoSchema,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const employeeMovementPayrollImpactRecordSchema = new Schema(
  {
    module: {
      type: String,
      enum: [
        "attendance_finalization",
        "salary_sheet",
        "time_bill",
        "bonus_sheet",
      ],
      required: true,
    },

    recordId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "unknown",
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    isBlocking: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const employeeMovementPayrollImpactSchema =
  new Schema<TEmployeeMovementPayrollImpact>(
    {
      effectivePayrollMonth: {
        type: String,
        default: "",
      },

      effectiveDate: {
        type: Date,
        default: null,
      },

      affectedModules: {
        type: [String],
        enum: [
          "attendance_finalization",
          "salary_sheet",
          "time_bill",
          "bonus_sheet",
        ],
        default: [],
      },

      records: {
        type: [employeeMovementPayrollImpactRecordSchema],
        default: [],
      },

      hasBlockingLockedRecords: {
        type: Boolean,
        default: false,
      },

      blockers: {
        type: [String],
        default: [],
      },

      warnings: {
        type: [String],
        default: [],
      },

      nextRequiredAction: {
        type: String,
        default: "",
      },

      checkedAt: {
        type: Date,
        default: null,
      },
    },
    {
      _id: false,
    },
  );

const employeeMovementSchema = new Schema<
  TEmployeeMovement,
  EmployeeMovementModel
>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    movementType: {
      type: String,
      enum: [
        "increment",
        "promotion",
        "transfer",
        "salary_revision",
        "designation_change",
        "department_change",
        "branch_transfer",
        "major_department_change",
        "employment_status_change",
        "service_type_change",
        "pay_type_change",
        "duty_hour_change",
        "confirmation",
      ],
      required: true,
    },

    effectiveDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    referenceNo: {
      type: String,
      trim: true,
      default: "",
    },

    snapshot: {
      type: employeeMovementSnapshotSchema,
      default: null,
    },

    payrollImpact: {
      type: employeeMovementPayrollImpactSchema,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "applied"],
      default: "draft",
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

    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    appliedAt: {
      type: Date,
      default: null,
    },

    auditLogs: {
      type: [movementAuditLogSchema],
      default: [],
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

employeeMovementSchema.index({
  employee: 1,
  movementType: 1,
  effectiveDate: 1,
});

employeeMovementSchema.index({
  employee: 1,
  "payrollImpact.effectivePayrollMonth": 1,
  status: 1,
  isDeleted: 1,
});

export const EmployeeMovement = model<TEmployeeMovement, EmployeeMovementModel>(
  "EmployeeMovement",
  employeeMovementSchema,
);

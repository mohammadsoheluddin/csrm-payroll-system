import { Schema, model } from "mongoose";

import {
  EmployeeMovementModel,
  TEmployeeMovement,
  TEmployeeMovementAuditLog,
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
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    fromDepartment: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    toDepartment: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    fromDesignation: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    toDesignation: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    fromBranch: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    toBranch: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    fromSalary: {
      grossSalary: {
        type: Number,
        default: 0,
      },

      basicSalary: {
        type: Number,
        default: 0,
      },

      netSalary: {
        type: Number,
        default: 0,
      },
    },

    toSalary: {
      grossSalary: {
        type: Number,
        default: 0,
      },

      basicSalary: {
        type: Number,
        default: 0,
      },

      netSalary: {
        type: Number,
        default: 0,
      },
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

export const EmployeeMovement = model<TEmployeeMovement, EmployeeMovementModel>(
  "EmployeeMovement",
  employeeMovementSchema,
);

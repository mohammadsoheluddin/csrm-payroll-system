import { Schema, model } from "mongoose";
import { TEmployee } from "./employee.interface";

const employeeNameSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const employeeSchema = new Schema<TEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      immutable: true,
    },
    officeId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    cardNo: {
      type: String,
      trim: true,
      uppercase: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: employeeNameSchema,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    dateOfBirth: {
      type: String,
      trim: true,
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

    joiningDate: {
      type: String,
      required: true,
      trim: true,
    },
    confirmationDate: {
      type: String,
      trim: true,
    },

    serviceType: {
      type: String,
      enum: [
        "permanent",
        "probation",
        "contractual",
        "temporary",
        "daily_wage",
        "intern",
      ],
      default: "permanent",
    },
    payType: {
      type: String,
      enum: ["monthly", "daily", "hourly"],
      default: "monthly",
    },
    dutyHourPerDay: {
      type: Number,
      default: 8,
      min: 0,
      max: 24,
    },
    leaveDay: {
      type: Number,
      default: 0,
      min: 0,
    },

    employmentStatus: {
      type: String,
      enum: [
        "active",
        "probation",
        "confirmed",
        "resigned",
        "terminated",
        "retired",
        "suspended",
      ],
      default: "active",
    },

    basicSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

/**
 * Official employeeId is permanent.
 * It should never be reused, even after resignation/soft delete.
 */
employeeSchema.index(
  {
    employeeId: 1,
  },
  {
    unique: true,
  },
);

/**
 * Email is also kept globally unique to avoid login/profile/payment confusion.
 */
employeeSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  },
);

/**
 * officeId/cardNo are active-employee unique.
 * Later if device/card reassignment is needed, we can add history module.
 */
employeeSchema.index(
  {
    officeId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      officeId: {
        $exists: true,
        $type: "string",
      },
    },
  },
);

employeeSchema.index(
  {
    cardNo: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      cardNo: {
        $exists: true,
        $type: "string",
      },
    },
  },
);

employeeSchema.index({
  company: 1,
  majorDepartment: 1,
  department: 1,
  designation: 1,
  status: 1,
  isDeleted: 1,
});

employeeSchema.index({
  branch: 1,
  employmentStatus: 1,
  serviceType: 1,
  payType: 1,
  isDeleted: 1,
});

const Employee = model<TEmployee>("Employee", employeeSchema);

export default Employee;

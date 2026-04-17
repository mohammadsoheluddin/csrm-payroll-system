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
      unique: true,
      trim: true,
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
      unique: true,
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
    joiningDate: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
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

const Employee = model<TEmployee>("Employee", employeeSchema);

export default Employee;

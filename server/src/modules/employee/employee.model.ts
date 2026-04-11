import { Schema, model, Types } from "mongoose";
import { TEmployee } from "./employee.interface";

const employeeNameSchema = new Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,
  },
  { _id: false },
);

const employeeSchema = new Schema<TEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },

    name: { type: employeeNameSchema, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true },

    gender: { type: String, enum: ["male", "female", "other"] },

    joiningDate: { type: String },

    designation: { type: String },

    department: {
      type: Types.ObjectId,
      ref: "Department",
      required: true,
    },

    branch: {
      type: Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    basicSalary: Number,

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Employee = model<TEmployee>("Employee", employeeSchema);

export default Employee;

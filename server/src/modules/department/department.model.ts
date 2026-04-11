import { Schema, model } from "mongoose";
import { TDepartment } from "./department.interface";

const departmentSchema = new Schema<TDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

const Department = model<TDepartment>("Department", departmentSchema);

export default Department;

import { Schema, model } from "mongoose";
import { softDeleteSchemaFields } from "../../common/softDelete";
import type { TDepartment } from "./department.interface";

const departmentSchema = new Schema<TDepartment>(
  {
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    ...softDeleteSchemaFields,
  },
  {
    timestamps: true,
  },
);

departmentSchema.index(
  {
    company: 1,
    majorDepartment: 1,
    code: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

departmentSchema.index(
  {
    company: 1,
    majorDepartment: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

departmentSchema.index({
  company: 1,
  majorDepartment: 1,
  status: 1,
  isDeleted: 1,
});

const Department = model<TDepartment>("Department", departmentSchema);

export default Department;

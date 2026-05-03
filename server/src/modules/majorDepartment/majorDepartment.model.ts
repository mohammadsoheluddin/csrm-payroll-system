import { Schema, model } from "mongoose";
import type { TMajorDepartment } from "./majorDepartment.interface";

const majorDepartmentSchema = new Schema<TMajorDepartment>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

majorDepartmentSchema.index(
  {
    company: 1,
    code: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

majorDepartmentSchema.index(
  {
    company: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

majorDepartmentSchema.index({
  company: 1,
  status: 1,
  isDeleted: 1,
});

const MajorDepartment = model<TMajorDepartment>(
  "MajorDepartment",
  majorDepartmentSchema,
);

export default MajorDepartment;

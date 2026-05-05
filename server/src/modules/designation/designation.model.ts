import { Schema, model } from "mongoose";
import type { TDesignation } from "./designation.interface";

const designationSchema = new Schema<TDesignation>(
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
    category: {
      type: String,
      enum: [
        "management",
        "officer",
        "staff",
        "worker",
        "technical",
        "security",
        "driver",
        "sales",
        "other",
      ],
      default: "other",
    },
    gradeLevel: {
      type: Number,
      min: 0,
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

designationSchema.index(
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

designationSchema.index(
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

designationSchema.index({
  company: 1,
  category: 1,
  status: 1,
  isDeleted: 1,
});

const Designation = model<TDesignation>("Designation", designationSchema);

export default Designation;

import { Schema, model } from "mongoose";
import type { TCompany } from "./company.interface";

const companySchema = new Schema<TCompany>(
  {
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
    legalName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["company", "concern", "sister_concern", "unit", "project"],
      default: "company",
    },
    parentCompany: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    tin: {
      type: String,
      trim: true,
    },
    bin: {
      type: String,
      trim: true,
    },
    registrationNo: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
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

companySchema.index(
  {
    code: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

companySchema.index(
  {
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

companySchema.index({
  type: 1,
  status: 1,
  isDeleted: 1,
});

companySchema.index({
  parentCompany: 1,
  isDeleted: 1,
});

const Company = model<TCompany>("Company", companySchema);

export default Company;

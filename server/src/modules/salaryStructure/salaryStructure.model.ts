import { Schema, model } from "mongoose";
import { TSalaryStructure } from "./salaryStructure.interface";

const salaryStructureSchema = new Schema<TSalaryStructure>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    houseRent: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicalAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    providentFund: {
      type: Number,
      default: 0,
      min: 0,
    },
    loanDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    effectiveFrom: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

salaryStructureSchema.index({ employee: 1, isActive: 1 });
salaryStructureSchema.index({ effectiveFrom: 1 });

const SalaryStructure = model<TSalaryStructure>(
  "SalaryStructure",
  salaryStructureSchema,
);

export default SalaryStructure;

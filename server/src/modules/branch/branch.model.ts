import { Schema, model } from "mongoose";
import { softDeleteSchemaFields } from "../../common/softDelete";
import { TBranch } from "./branch.interface";

const branchSchema = new Schema<TBranch>(
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
    address: {
      type: String,
      required: true,
      trim: true,
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

branchSchema.index(
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

branchSchema.index(
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

branchSchema.index({
  status: 1,
  isDeleted: 1,
});

const Branch = model<TBranch>("Branch", branchSchema);

export default Branch;

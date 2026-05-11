import { Schema, model } from "mongoose";
import { softDeleteSchemaFields } from "../../common/softDelete";
import type { TEmployeeBulkImportBatch } from "./employeeBulkImport.interface";

const rejectedRowSchema = new Schema(
  {
    rowNo: Number,
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  },
);

const rawRowSchema = new Schema(
  {
    rowNo: Number,
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
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
    firstName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    majorDepartment: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: String,
      trim: true,
    },
    confirmationDate: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
    },
    payType: {
      type: String,
    },
    dutyHourPerDay: Number,
    leaveDay: Number,
    employmentStatus: {
      type: String,
    },
    basicSalary: Number,
    status: {
      type: String,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  },
);

const validEmployeeRowSchema = new Schema(
  {
    rowNo: Number,
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    action: {
      type: String,
      enum: ["create", "reject", "skip"],
      default: "create",
    },
    rawRow: rawRowSchema,
  },
  {
    _id: false,
  },
);

const createdEmployeeSchema = new Schema(
  {
    rowNo: Number,
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
  },
  {
    _id: false,
  },
);


const rollbackItemSchema = new Schema(
  {
    rowNo: Number,
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      enum: ["soft_delete_created_employee", "skip_already_deleted", "blocked"],
      required: true,
    },
    canRevert: {
      type: Boolean,
      required: true,
    },
    blockers: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const rollbackSummarySchema = new Schema(
  {
    totalCreatedEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    revertableEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    alreadyDeletedEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    revertedEmployeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockers: {
      type: [String],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
    items: {
      type: [rollbackItemSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const employeeBulkImportBatchSchema = new Schema<TEmployeeBulkImportBatch>(
  {
    batchNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    source: {
      type: String,
      enum: ["excel", "csv", "manual_bulk", "api"],
      required: true,
    },
    sourceFileName: {
      type: String,
      trim: true,
    },
    strictMode: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: [
        "previewed",
        "committed",
        "partial_committed",
        "failed",
        "reverted",
        "partial_reverted",
      ],
      default: "committed",
    },
    totalRows: {
      type: Number,
      required: true,
      min: 0,
    },
    validRows: {
      type: Number,
      required: true,
      min: 0,
    },
    invalidRows: {
      type: Number,
      required: true,
      min: 0,
    },
    duplicateRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    existingEmployeeBlockers: {
      type: Number,
      default: 0,
      min: 0,
    },
    referenceBlockers: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdEmployeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    skippedEmployeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rejectedRows: {
      type: [rejectedRowSchema],
      default: [],
    },
    validEmployeeRows: {
      type: [validEmployeeRowSchema],
      default: [],
    },
    createdEmployees: {
      type: [createdEmployeeSchema],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
    rollbackSummary: {
      type: rollbackSummarySchema,
      default: null,
    },
    revertedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    revertedAt: {
      type: Date,
    },
    revertNote: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    ...softDeleteSchemaFields,
  },
  {
    timestamps: true,
  },
);

employeeBulkImportBatchSchema.index({
  source: 1,
  status: 1,
  isDeleted: 1,
});

employeeBulkImportBatchSchema.index({
  processedAt: -1,
  isDeleted: 1,
});

employeeBulkImportBatchSchema.index({
  deletedAt: -1,
  isDeleted: 1,
});

const EmployeeBulkImportBatch = model<TEmployeeBulkImportBatch>(
  "EmployeeBulkImportBatch",
  employeeBulkImportBatchSchema,
);

export default EmployeeBulkImportBatch;

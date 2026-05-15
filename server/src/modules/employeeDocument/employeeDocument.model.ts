import { Schema, model } from "mongoose";
import { softDeleteSchemaFields } from "../../common/softDelete";
import type { TEmployeeDocument } from "./employeeDocument.interface";

export const EMPLOYEE_DOCUMENT_CATEGORIES = [
  "nid",
  "birth_certificate",
  "passport",
  "photo",
  "cv",
  "educational_certificate",
  "experience_certificate",
  "appointment_letter",
  "joining_letter",
  "confirmation_letter",
  "increment_letter",
  "promotion_letter",
  "transfer_letter",
  "warning_letter",
  "show_cause_letter",
  "termination_letter",
  "resignation_letter",
  "clearance",
  "salary_certificate",
  "training_certificate",
  "medical_certificate",
  "bank_document",
  "nominee_document",
  "other",
] as const;

export const EMPLOYEE_DOCUMENT_STATUSES = [
  "pending",
  "verified",
  "rejected",
  "expired",
  "archived",
] as const;

export const EMPLOYEE_DOCUMENT_CONFIDENTIALITIES = [
  "internal",
  "confidential",
  "highly_confidential",
] as const;

export const EMPLOYEE_DOCUMENT_STORAGE_PROVIDERS = [
  "local",
  "url",
  "external",
  "pending",
] as const;

const employeeDocumentSchema = new Schema<TEmployeeDocument>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: EMPLOYEE_DOCUMENT_CATEGORIES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentNo: {
      type: String,
      trim: true,
      uppercase: true,
    },
    issuingAuthority: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: String,
      trim: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    fileExtension: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mimeType: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: EMPLOYEE_DOCUMENT_STORAGE_PROVIDERS,
      default: "pending",
      required: true,
    },
    storagePath: {
      type: String,
      trim: true,
    },
    checksum: {
      type: String,
      trim: true,
    },

    confidentiality: {
      type: String,
      enum: EMPLOYEE_DOCUMENT_CONFIDENTIALITIES,
      default: "confidential",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: EMPLOYEE_DOCUMENT_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verificationRemarks: {
      type: String,
      trim: true,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },

    ...softDeleteSchemaFields,
  },
  {
    timestamps: true,
  },
);

employeeDocumentSchema.index({
  employee: 1,
  category: 1,
  status: 1,
  isDeleted: 1,
});

employeeDocumentSchema.index({
  company: 1,
  category: 1,
  status: 1,
  isDeleted: 1,
});

employeeDocumentSchema.index({
  documentNo: 1,
  category: 1,
  isDeleted: 1,
});

employeeDocumentSchema.index({
  title: "text",
  documentNo: "text",
  fileName: "text",
  originalFileName: "text",
  remarks: "text",
});

employeeDocumentSchema.index({
  isDeleted: 1,
  deletedAt: -1,
});

const EmployeeDocument = model<TEmployeeDocument>(
  "EmployeeDocument",
  employeeDocumentSchema,
);

export default EmployeeDocument;

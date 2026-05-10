import { model, Schema } from "mongoose";
import {
  TReportCenterCategory,
  TReportCenterFlow,
  TReportCenterFormat,
  TReportCenterSavedConfig,
} from "./reportCenter.interface";

const REPORT_CENTER_CATEGORIES: TReportCenterCategory[] = [
  "employee",
  "attendance",
  "leave",
  "salary",
  "time_bill_ot",
  "bonus",
  "payment",
  "audit_control",
];

const REPORT_CENTER_FLOWS: TReportCenterFlow[] = [
  "hr",
  "attendance",
  "leave",
  "salary",
  "ot",
  "bonus",
  "payment",
  "control",
];

const REPORT_CENTER_FORMATS: TReportCenterFormat[] = [
  "preview",
  "csv",
  "excel",
  "pdf",
];

const SavedFilterSchema = new Schema(
  {
    payrollMonth: { type: String, trim: true },
    bonusMonth: { type: String, trim: true },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number, min: 2000, max: 2100 },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    majorDepartment: { type: Schema.Types.ObjectId, ref: "MajorDepartment" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
    employee: { type: Schema.Types.ObjectId, ref: "Employee" },
    paymentMode: {
      type: String,
      enum: ["bank", "cash", "mobile_banking"],
    },
    attendanceImportBatchId: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceImportBatch",
    },
    employeeBulkImportBatchId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeBulkImportBatch",
    },
  },
  { _id: false },
);

const ReportCenterSavedConfigSchema = new Schema<TReportCenterSavedConfig>(
  {
    configName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reportId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    reportTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: REPORT_CENTER_CATEGORIES,
      required: true,
      index: true,
    },
    flow: {
      type: String,
      enum: REPORT_CENTER_FLOWS,
      required: true,
      index: true,
    },
    defaultFormat: {
      type: String,
      enum: REPORT_CENTER_FORMATS,
      required: true,
      default: "preview",
    },
    selectedFormats: {
      type: [String],
      enum: REPORT_CENTER_FORMATS,
      default: ["preview"],
    },
    filters: {
      type: SavedFilterSchema,
      default: {},
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ReportCenterSavedConfigSchema.index({ reportId: 1, isDeleted: 1 });
ReportCenterSavedConfigSchema.index({ category: 1, flow: 1, isDeleted: 1 });
ReportCenterSavedConfigSchema.index({ configName: 1, isDeleted: 1 });

const ReportCenterSavedConfig = model<TReportCenterSavedConfig>(
  "ReportCenterSavedConfig",
  ReportCenterSavedConfigSchema,
);

export default ReportCenterSavedConfig;

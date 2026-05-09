import { Types } from "mongoose";
import type { TAttendanceStatus } from "../attendance/attendance.interface";

export type TAttendanceImportSource = "device" | "excel" | "manual_bulk" | "api";

export type TAttendanceImportMatchBy = "employeeId" | "officeId" | "cardNo";

export type TAttendanceImportBatchStatus = "committed" | "failed";

export type TAttendanceImportAttendanceAction = "insert" | "update" | "skip";

export interface TAttendanceImportRawRow {
  rowNo?: number;
  employeeIdentifier: string;
  attendanceDate: string;
  punchTime?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: TAttendanceStatus;
  deviceId?: string;
  remarks?: string;
  rawPayload?: Record<string, unknown>;
}

export interface TAttendanceImportRejectedRow {
  rowNo?: number;
  employeeIdentifier?: string;
  attendanceDate?: string;
  reason: string;
  rawPayload?: Record<string, unknown>;
}

export interface TAttendanceImportProcessedAttendance {
  employee: Types.ObjectId;
  employeeIdentifier: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: TAttendanceStatus;
  action: TAttendanceImportAttendanceAction;
  existingAttendance?: Types.ObjectId;
  attendance?: Types.ObjectId;
  deviceId?: string;
  remarks?: string;
}

export interface TAttendanceImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  groupedAttendanceCount: number;
  insertedAttendanceCount: number;
  updatedAttendanceCount: number;
  skippedAttendanceCount: number;
  rejectedRows: TAttendanceImportRejectedRow[];
  processedAttendances: TAttendanceImportProcessedAttendance[];
  warnings: string[];
  lockedMonthBlockers?: Array<{
    employee: string;
    employeeId?: string;
    employeeName?: string;
    payrollMonth: string;
    attendanceFinalization: string;
  }>;
}

export interface TAttendanceImportPayload {
  source: TAttendanceImportSource;
  matchBy: TAttendanceImportMatchBy;
  rows: TAttendanceImportRawRow[];
  overwrite?: boolean;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  deviceId?: string;
  sourceFileName?: string;
  remarks?: string;
}

export interface TAttendanceImportBatch {
  batchNo: string;
  source: TAttendanceImportSource;
  matchBy: TAttendanceImportMatchBy;
  company?: Types.ObjectId;
  majorDepartment?: Types.ObjectId;
  department?: Types.ObjectId;
  branch?: Types.ObjectId;
  deviceId?: string;
  sourceFileName?: string;
  overwrite?: boolean;
  status: TAttendanceImportBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  groupedAttendanceCount: number;
  insertedAttendanceCount: number;
  updatedAttendanceCount: number;
  skippedAttendanceCount: number;
  rejectedRows: TAttendanceImportRejectedRow[];
  processedAttendances: TAttendanceImportProcessedAttendance[];
  warnings: string[];
  remarks?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  isDeleted?: boolean;
}


export type TAttendanceImportTemplateSource = "device" | "excel" | "manual_bulk" | "api";

export interface TAttendanceImportTemplateColumn {
  header: string;
  key: keyof TAttendanceImportRawRow;
  required: boolean;
  format?: string;
  description: string;
  width: number;
}

export interface TAttendanceImportTemplateQuery {
  source?: TAttendanceImportTemplateSource;
  matchBy?: TAttendanceImportMatchBy;
  includeSample?: string;
}

export interface TAttendanceImportTemplatePreview {
  template: {
    source: TAttendanceImportTemplateSource;
    matchBy: TAttendanceImportMatchBy;
    recommendedEndpoint: string;
    maxRowsPerRequest: number;
    notes: string[];
  };
  columns: TAttendanceImportTemplateColumn[];
  sampleRows: TAttendanceImportRawRow[];
}

export interface TAttendanceImportRejectionReportPreview {
  batch: {
    id: string;
    batchNo: string;
    source: TAttendanceImportSource;
    matchBy: TAttendanceImportMatchBy;
    sourceFileName?: string;
    deviceId?: string;
    processedAt?: Date;
  };
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    rejectedRows: number;
    insertedAttendanceCount: number;
    updatedAttendanceCount: number;
    skippedAttendanceCount: number;
  };
  rejectedRows: TAttendanceImportRejectedRow[];
}

export interface TAttendanceImportExportFileResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TAttendanceImportTemplatePreview | TAttendanceImportRejectionReportPreview;
}

export interface TAttendanceImportQuery {
  source?: string;
  matchBy?: string;
  status?: string;
  company?: string;
  department?: string;
  branch?: string;
  deviceId?: string;
  batchNo?: string;
  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
}

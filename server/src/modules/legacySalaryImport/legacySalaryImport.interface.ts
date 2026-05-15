import type { Types } from "mongoose";

export type TLegacySalarySource =
  | "old_payroll_software"
  | "current_payroll_software"
  | "manual_excel"
  | "other";

export type TLegacySalarySheetType =
  | "salary"
  | "wages"
  | "salary_and_wages"
  | "ot"
  | "bonus"
  | "mixed";

export type TLegacySalaryMatchBy = "employeeId" | "officeId" | "cardNo" | "name";

export type TLegacySalaryBatchStatus = "committed" | "archived" | "deleted";

export type TLegacySalaryBatchRecordStatus =
  | "matched"
  | "unmatched"
  | "duplicate_identifier"
  | "invalid";

export type TLegacySalaryPaymentMode = "bank" | "cash" | "mobile" | "mixed" | "unknown";

export type TLegacySalaryRawPayload = Record<string, unknown>;

export interface TLegacySalaryImportRowInput {
  rowNo?: number;
  employeeIdentifier?: string;
  employeeId?: string;
  officeId?: string;
  cardNo?: string;
  employeeName?: string;
  companyName?: string;
  majorDepartmentName?: string;
  departmentName?: string;
  designationName?: string;
  branchName?: string;
  payType?: string;
  paymentMode?: TLegacySalaryPaymentMode | string;
  grossAmount?: number;
  basicAmount?: number;
  houseRentAmount?: number;
  medicalAmount?: number;
  conveyanceAmount?: number;
  tiffinAmount?: number;
  overtimeHour?: number;
  overtimeRate?: number;
  overtimeAmount?: number;
  bonusAmount?: number;
  otherAllowanceAmount?: number;
  bankAmount?: number;
  cashAmount?: number;
  mobileBankAmount?: number;
  suspenseAmount?: number;
  aitAmount?: number;
  loanAmount?: number;
  advanceAmount?: number;
  pfAmount?: number;
  stampAmount?: number;
  foodAmount?: number;
  absentDeductionAmount?: number;
  leaveDeductionAmount?: number;
  otherDeductionAmount?: number;
  totalDeductionAmount?: number;
  netAmount?: number;
  payableAmount?: number;
  remarks?: string;
  rawPayload?: TLegacySalaryRawPayload;
}

export interface TLegacySalaryImportPayload {
  source: TLegacySalarySource;
  sheetType: TLegacySalarySheetType;
  payrollMonth: string;
  company?: string;
  sourceFileName?: string;
  sourceSheetName?: string;
  matchBy?: TLegacySalaryMatchBy;
  remarks?: string;
  rows: TLegacySalaryImportRowInput[];
}

export interface TLegacySalaryParseExcelPayload {
  fileName: string;
  fileBase64: string;
  sheetName?: string;
  headerRow?: number;
  dataStartRow?: number;
  maxRows?: number;
}

export interface TLegacySalaryParsedExcelRow {
  rowNo: number;
  rawPayload: TLegacySalaryRawPayload;
  mappedPayload: Partial<TLegacySalaryImportRowInput>;
  unmappedHeaders: string[];
}

export interface TLegacySalaryParsedExcelResult {
  fileName: string;
  sheetName: string;
  headerRow: number;
  dataStartRow: number;
  totalRows: number;
  rows: TLegacySalaryParsedExcelRow[];
  headers: string[];
  mappedHeaders: string[];
  unmappedHeaders: string[];
  notes: string[];
}

export interface TLegacySalaryImportValidRow {
  rowNo: number;
  status: TLegacySalaryBatchRecordStatus;
  employee?: Types.ObjectId | null;
  employeeId?: string;
  officeId?: string;
  cardNo?: string;
  employeeIdentifier?: string;
  employeeName: string;
  companyName?: string;
  majorDepartmentName?: string;
  departmentName?: string;
  designationName?: string;
  branchName?: string;
  payType?: string;
  paymentMode: TLegacySalaryPaymentMode;
  grossAmount: number;
  basicAmount: number;
  houseRentAmount: number;
  medicalAmount: number;
  conveyanceAmount: number;
  tiffinAmount: number;
  overtimeHour: number;
  overtimeRate: number;
  overtimeAmount: number;
  bonusAmount: number;
  otherAllowanceAmount: number;
  bankAmount: number;
  cashAmount: number;
  mobileBankAmount: number;
  suspenseAmount: number;
  aitAmount: number;
  loanAmount: number;
  advanceAmount: number;
  pfAmount: number;
  stampAmount: number;
  foodAmount: number;
  absentDeductionAmount: number;
  leaveDeductionAmount: number;
  otherDeductionAmount: number;
  totalDeductionAmount: number;
  netAmount: number;
  payableAmount: number;
  remarks?: string;
  rawPayload: TLegacySalaryRawPayload;
}

export interface TLegacySalaryImportRejectedRow {
  rowNo: number;
  employeeIdentifier?: string;
  employeeName?: string;
  reason: string;
  rawPayload?: TLegacySalaryRawPayload;
}

export interface TLegacySalaryAmountTotals {
  employeeCount: number;
  grossAmount: number;
  basicAmount: number;
  overtimeAmount: number;
  tiffinAmount: number;
  bonusAmount: number;
  otherAllowanceAmount: number;
  bankAmount: number;
  cashAmount: number;
  mobileBankAmount: number;
  suspenseAmount: number;
  aitAmount: number;
  loanAmount: number;
  advanceAmount: number;
  pfAmount: number;
  stampAmount: number;
  foodAmount: number;
  absentDeductionAmount: number;
  leaveDeductionAmount: number;
  otherDeductionAmount: number;
  totalDeductionAmount: number;
  netAmount: number;
  payableAmount: number;
}

export interface TLegacySalaryPreviewResult {
  payrollMonth: string;
  source: TLegacySalarySource;
  sheetType: TLegacySalarySheetType;
  matchBy: TLegacySalaryMatchBy;
  sourceFileName?: string;
  sourceSheetName?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  matchedRows: number;
  unmatchedRows: number;
  duplicateIdentifierRows: number;
  totals: TLegacySalaryAmountTotals;
  rows: TLegacySalaryImportValidRow[];
  rejectedRows: TLegacySalaryImportRejectedRow[];
}

export interface TLegacySalaryImportBatch {
  batchNo: string;
  source: TLegacySalarySource;
  sheetType: TLegacySalarySheetType;
  payrollMonth: string;
  month: number;
  year: number;
  company?: Types.ObjectId | null;
  sourceFileName?: string;
  sourceSheetName?: string;
  matchBy: TLegacySalaryMatchBy;
  status: TLegacySalaryBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  matchedRows: number;
  unmatchedRows: number;
  duplicateIdentifierRows: number;
  totals: TLegacySalaryAmountTotals;
  rejectedRows: TLegacySalaryImportRejectedRow[];
  remarks?: string;
  committedBy?: Types.ObjectId | string | null;
  committedAt?: Date | null;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | string | null;
  deleteReason?: string | null;
  restoredAt?: Date | null;
  restoredBy?: Types.ObjectId | string | null;
  restoreReason?: string | null;
  updatedBy?: Types.ObjectId | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TLegacySalaryRecord {
  batch: Types.ObjectId;
  payrollMonth: string;
  month: number;
  year: number;
  company?: Types.ObjectId | null;
  source: TLegacySalarySource;
  sheetType: TLegacySalarySheetType;
  rowNo: number;
  status: TLegacySalaryBatchRecordStatus;
  employee?: Types.ObjectId | null;
  employeeId?: string;
  officeId?: string;
  cardNo?: string;
  employeeIdentifier?: string;
  employeeName: string;
  companyName?: string;
  majorDepartmentName?: string;
  departmentName?: string;
  designationName?: string;
  branchName?: string;
  payType?: string;
  paymentMode: TLegacySalaryPaymentMode;
  grossAmount: number;
  basicAmount: number;
  houseRentAmount: number;
  medicalAmount: number;
  conveyanceAmount: number;
  tiffinAmount: number;
  overtimeHour: number;
  overtimeRate: number;
  overtimeAmount: number;
  bonusAmount: number;
  otherAllowanceAmount: number;
  bankAmount: number;
  cashAmount: number;
  mobileBankAmount: number;
  suspenseAmount: number;
  aitAmount: number;
  loanAmount: number;
  advanceAmount: number;
  pfAmount: number;
  stampAmount: number;
  foodAmount: number;
  absentDeductionAmount: number;
  leaveDeductionAmount: number;
  otherDeductionAmount: number;
  totalDeductionAmount: number;
  netAmount: number;
  payableAmount: number;
  remarks?: string;
  rawPayload?: TLegacySalaryRawPayload;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | string | null;
  deleteReason?: string | null;
  restoredAt?: Date | null;
  restoredBy?: Types.ObjectId | string | null;
  restoreReason?: string | null;
  updatedBy?: Types.ObjectId | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TLegacySalaryBatchQuery {
  payrollMonth?: string;
  month?: number;
  year?: number;
  company?: string;
  source?: TLegacySalarySource;
  sheetType?: TLegacySalarySheetType;
  status?: TLegacySalaryBatchStatus;
  batchNo?: string;
  fromMonth?: string;
  toMonth?: string;
  page?: number;
  limit?: number;
}

export interface TLegacySalaryRecordQuery {
  batch?: string;
  payrollMonth?: string;
  month?: number;
  year?: number;
  company?: string;
  employee?: string;
  employeeId?: string;
  officeId?: string;
  cardNo?: string;
  employeeName?: string;
  departmentName?: string;
  status?: TLegacySalaryBatchRecordStatus;
  page?: number;
  limit?: number;
}

export interface TLegacySalarySummaryQuery {
  payrollMonth?: string;
  month?: number;
  year?: number;
  company?: string;
  groupBy?: "department" | "majorDepartment" | "company" | "sheetType" | "status";
}

export interface TLegacySalarySummaryRow extends TLegacySalaryAmountTotals {
  groupKey: string;
  groupName: string;
}

export interface TLegacySalarySummaryResult {
  filters: TLegacySalarySummaryQuery;
  rows: TLegacySalarySummaryRow[];
  grandTotal: TLegacySalaryAmountTotals;
  totals?: TLegacySalaryAmountTotals;
}

export interface TLegacySalaryExportFileResult {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}

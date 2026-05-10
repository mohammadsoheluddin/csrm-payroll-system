import { Types } from "mongoose";
import type {
  TEmployeeStatus,
  TEmploymentStatus,
  TGender,
  TPayType,
  TServiceType,
} from "../employee/employee.interface";

export type TEmployeeBulkImportSource = "excel" | "csv" | "manual_bulk" | "api";

export type TEmployeeBulkImportBatchStatus =
  | "previewed"
  | "committed"
  | "partial_committed"
  | "failed";

export type TEmployeeBulkImportRowAction = "create" | "reject" | "skip";

export interface TEmployeeBulkImportRawRow {
  rowNo?: number;

  employeeId: string;
  officeId?: string;
  cardNo?: string;

  firstName: string;
  middleName?: string;
  lastName: string;

  email: string;
  phone: string;
  gender: TGender;
  dateOfBirth?: string;

  company: string;
  majorDepartment: string;
  department: string;
  designation: string;
  branch: string;

  joiningDate: string;
  confirmationDate?: string;

  serviceType?: TServiceType;
  payType?: TPayType;
  dutyHourPerDay?: number;
  leaveDay?: number;
  employmentStatus?: TEmploymentStatus;
  basicSalary?: number;
  status?: TEmployeeStatus;

  rawPayload?: Record<string, unknown>;
}

export interface TEmployeeBulkImportRejectedRow {
  rowNo?: number;
  employeeId?: string;
  email?: string;
  officeId?: string;
  cardNo?: string;
  reason: string;
  rawPayload?: Record<string, unknown>;
}

export interface TEmployeeBulkImportValidRow {
  rowNo?: number;
  employeeId: string;
  employeeName: string;
  email: string;
  officeId?: string;
  cardNo?: string;
  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  department: Types.ObjectId;
  designation: Types.ObjectId;
  branch: Types.ObjectId;
  action: TEmployeeBulkImportRowAction;
  rawRow: TEmployeeBulkImportRawRow;
}

export interface TEmployeeBulkImportCreatedEmployee {
  rowNo?: number;
  employee: Types.ObjectId;
  employeeId: string;
  employeeName: string;
  email: string;
  officeId?: string;
  cardNo?: string;
}

export interface TEmployeeBulkImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  existingEmployeeBlockers: number;
  referenceBlockers: number;
  createdEmployeeCount: number;
  skippedEmployeeCount: number;
  rejectedRows: TEmployeeBulkImportRejectedRow[];
  validEmployeeRows: TEmployeeBulkImportValidRow[];
  createdEmployees: TEmployeeBulkImportCreatedEmployee[];
  warnings: string[];
}

export interface TEmployeeBulkImportPayload {
  source: TEmployeeBulkImportSource;
  rows: TEmployeeBulkImportRawRow[];
  sourceFileName?: string;
  strictMode?: boolean;
  remarks?: string;
}

export interface TEmployeeBulkImportBatch {
  batchNo: string;
  source: TEmployeeBulkImportSource;
  sourceFileName?: string;
  strictMode?: boolean;
  status: TEmployeeBulkImportBatchStatus;

  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  existingEmployeeBlockers: number;
  referenceBlockers: number;
  createdEmployeeCount: number;
  skippedEmployeeCount: number;

  rejectedRows: TEmployeeBulkImportRejectedRow[];
  validEmployeeRows: TEmployeeBulkImportValidRow[];
  createdEmployees: TEmployeeBulkImportCreatedEmployee[];
  warnings: string[];

  remarks?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  isDeleted?: boolean;
}

export type TEmployeeBulkImportQueryFilters = {
  source?: TEmployeeBulkImportSource;
  status?: TEmployeeBulkImportBatchStatus;
  batchNo?: string;
  sourceFileName?: string;
  fromDate?: string;
  toDate?: string;
  page?: string | number;
  limit?: string | number;
};

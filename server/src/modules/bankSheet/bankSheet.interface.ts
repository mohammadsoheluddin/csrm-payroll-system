import { Types } from "mongoose";
import {
  BANK_SHEET_PAYMENT_MODES,
  BANK_SHEET_SOURCE_TYPES,
} from "./bankSheet.constants";

export type TBankSheetSourceType = (typeof BANK_SHEET_SOURCE_TYPES)[number];
export type TBankSheetPaymentMode = (typeof BANK_SHEET_PAYMENT_MODES)[number];

export type TGenerateBankSheetPreviewQuery = {
  sourceType?: TBankSheetSourceType;
  month: number;
  year: number;
  company: string;
  department?: string;
  branch?: string;
  bankName?: string;
  paymentMode?: TBankSheetPaymentMode;
};

export type TBankSheetEmployeeInfo = {
  employeeDbId: string;
  employeeId: string;
  employeeName: string;
  designation?: string;
  department?: string;
  branch?: string;
  company?: string;
};

export type TBankSheetRow = {
  slNo: number;
  payrollId: string;
  payrollMonth: string;
  payrollStatus: string;
  isPayrollLocked: boolean;
  employee: TBankSheetEmployeeInfo;
  paymentInfoId: string;
  paymentMode: TBankSheetPaymentMode;
  nameOfAccount: string;
  accountBankBranchCode: string;
  accountNo: string;
  processBankBranchNo: string;
  bankName: string;
  bankBranchName: string;
  branch: string;
  amountInTk: number;
};

export type TBankSheetExcludedRow = {
  payrollId: string;
  employee?: {
    employeeDbId?: string;
    employeeId?: string;
    employeeName?: string;
  } | null;
  payableSalary: number;
  reason: string;
};

export type TBankSheetSummary = {
  sourceType: TBankSheetSourceType;
  payrollMonth: string;
  month: number;
  year: number;
  paymentMode: TBankSheetPaymentMode;
  totalPayrollFound: number;
  totalIncluded: number;
  totalExcluded: number;
  totalAmount: number;
};

export type TBankSheetPreview = {
  filters: {
    company: string;
    department: string | null;
    branch: string | null;
    bankName: string | null;
  };
  summary: TBankSheetSummary;
  rows: TBankSheetRow[];
  excludedRows: TBankSheetExcludedRow[];
};

export type TPopulatedPayrollForBankSheet = {
  _id: Types.ObjectId;
  employee: any;
  payrollMonth: string;
  payableSalary: number;
  status: string;
  isLocked: boolean;
};

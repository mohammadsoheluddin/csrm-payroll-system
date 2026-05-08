import { Model, Types } from "mongoose";

export type TBankSheetHistory = {
  exportType: "preview" | "excel" | "pdf";
  sourceType: "salary";
  payrollMonth: string;

  month: number;
  year: number;

  company: Types.ObjectId;

  sourceAccount?: Types.ObjectId | null;

  generatedBy: Types.ObjectId;

  paymentMode: "bank" | "cash" | "mobile_banking";

  totalPayrollFound: number;
  totalIncluded: number;
  totalExcluded: number;
  totalAmount: number;

  filters: {
    department?: string | null;
    branch?: string | null;
    bankName?: string | null;
  };

  fileName?: string;

  remarks?: string;

  isDeleted: boolean;
};

export interface BankSheetHistoryModel extends Model<TBankSheetHistory> {}

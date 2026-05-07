import { Types } from "mongoose";

export type TEmployeeBankInfoStatus = "active" | "inactive";

export type TEmployeePaymentMode = "bank" | "cash" | "mobile_banking";

export type TMobileBankingProvider =
  | "bkash"
  | "nagad"
  | "rocket"
  | "upay"
  | "other";

export interface TEmployeeBankInfo {
  employee: Types.ObjectId;
  company: Types.ObjectId;

  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;

  paymentMode: TEmployeePaymentMode;

  mobileBankingProvider?: TMobileBankingProvider;
  mobileBankingNo?: string;

  cashPayReason?: string;

  effectiveFrom: string;
  effectiveTo?: string;

  isPrimary?: boolean;
  status?: TEmployeeBankInfoStatus;
  isDeleted?: boolean;
}

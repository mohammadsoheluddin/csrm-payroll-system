import { Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TEmployeeBankInfoStatus = "active" | "inactive";

export type TEmployeePaymentMode = "bank" | "cash" | "mobile_banking";

export type TMobileBankingProvider =
  | "bkash"
  | "nagad"
  | "rocket"
  | "upay"
  | "other";

export interface TEmployeeBankInfo extends TSoftDeleteFields {
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
}

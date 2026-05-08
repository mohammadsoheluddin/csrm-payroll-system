import { Model, Types } from "mongoose";

export type TCompanyBankAccountType =
  | "salary"
  | "ot"
  | "bonus"
  | "general"
  | "tada"
  | "allowance";

export type TCompanyBankAccountStatus = "active" | "inactive";

export interface TCompanyBankAccount {
  company: Types.ObjectId;

  accountName: string;

  bankName: string;

  branchName: string;

  branchCode: string;

  routingNo?: string;

  swiftCode?: string;

  accountNo: string;

  processBankBranchNo: string;

  accountType: TCompanyBankAccountType;

  currency?: string;

  remarks?: string;

  isPrimary: boolean;

  status: TCompanyBankAccountStatus;

  isDeleted: boolean;
}

export interface CompanyBankAccountModel extends Model<TCompanyBankAccount> {}

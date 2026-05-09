import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import type {
  TBonusCalculationBasis,
  TBonusType,
} from "../bonusSheet/bonusSheet.interface";
import type { TBonusStatementSnapshot } from "../bonusStatement/bonusStatement.interface";

export type TBonusPaymentDistributionStatus =
  | "draft"
  | "processed"
  | "approved"
  | "locked";

export type TBonusPaymentDistributionPaymentMode =
  | "bank"
  | "cash"
  | "mobile_banking";

export type TBonusPaymentDistributionAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TBonusPaymentDistributionPaymentInfoSnapshot {
  paymentInfoId?: string;
  paymentMode: TBonusPaymentDistributionPaymentMode;
  isPrimary?: boolean;
  status?: string;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  source: "employee_payment_info" | "fallback_cash";
  warning?: string;
}

export interface TBonusPaymentDistributionSnapshot {
  bonusStatement?: TBonusStatementSnapshot | null;
  paymentInfo?: TBonusPaymentDistributionPaymentInfoSnapshot | null;
}

export interface TBonusPaymentDistributionAuditLog {
  action: TBonusPaymentDistributionAuditAction;
  fromStatus?: TBonusPaymentDistributionStatus | null;
  toStatus?: TBonusPaymentDistributionStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TBonusPaymentDistribution {
  employee: Types.ObjectId;
  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  department: Types.ObjectId;
  designation: Types.ObjectId;
  branch: Types.ObjectId;

  bonusMonth: string;
  month: number;
  year: number;
  bonusName: string;
  bonusType: TBonusType;
  calculationBasis: TBonusCalculationBasis;

  bonusStatement: Types.ObjectId;
  bonusSheet: Types.ObjectId;
  salaryStructure: Types.ObjectId;

  basicSalary: number;
  grossSalary: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;

  paymentMode: TBonusPaymentDistributionPaymentMode;
  paymentInfo?: Types.ObjectId | null;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  paymentInfoSource: "employee_payment_info" | "fallback_cash";
  paymentInfoWarning?: string;

  bankAmount: number;
  cashAmount: number;
  mobileBankingAmount: number;

  status: TBonusPaymentDistributionStatus;
  isLocked: boolean;

  generatedBy?: Types.ObjectId | null;
  generatedAt?: Date | null;
  processedBy?: Types.ObjectId | null;
  processedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  lockedBy?: Types.ObjectId | null;
  lockedAt?: Date | null;
  immutableSeal?: TPayrollImmutableSeal | null;

  snapshot?: TBonusPaymentDistributionSnapshot | null;
  auditLogs: TBonusPaymentDistributionAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateBonusPaymentDistributionPayload {
  bonusMonth?: string;
  month?: number;
  year?: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: TBonusType;
  overwrite?: boolean;
  /**
   * Default true. When false, employees without active payment info are skipped.
   */
  allowCashFallback?: boolean;
  remarks?: string;
}

export interface TBonusPaymentDistributionQuery {
  bonusMonth?: string;
  month?: string;
  year?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: TBonusType;
  status?: TBonusPaymentDistributionStatus;
  isLocked?: string;
  paymentMode?: TBonusPaymentDistributionPaymentMode;
}

export interface TBonusPaymentDistributionSummaryQuery {
  bonusMonth?: string;
  month?: string;
  year?: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: TBonusType;
  paymentMode?: TBonusPaymentDistributionPaymentMode;
}

export interface TBonusPaymentDistributionActionPayload {
  note?: string;
}

export type TBonusPaymentDistributionBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TBonusPaymentDistributionBulkActionPayload {
  bonusMonth?: string;
  month?: number;
  year?: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: TBonusType;
  paymentMode?: TBonusPaymentDistributionPaymentMode;
  note?: string;
  /**
   * For bulk lock, strict=true prevents partial Bonus Bank/Cash/Mobile sheet readiness.
   * Default behavior is strict, so every selected record must already be approved.
   */
  strict?: boolean;
}

export interface BonusPaymentDistributionModel
  extends Model<TBonusPaymentDistribution> {}

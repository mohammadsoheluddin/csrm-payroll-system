import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";
import type {
  TBonusCalculationBasis,
  TBonusSheetSnapshot,
  TBonusType,
} from "../bonusSheet/bonusSheet.interface";

export type TBonusStatementStatus = "draft" | "processed" | "approved" | "locked";

export type TBonusStatementAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export interface TBonusStatementBonusSheetSnapshot {
  bonusSheetId: string;
  bonusMonth: string;
  bonusName: string;
  bonusType: TBonusType;
  calculationBasis: TBonusCalculationBasis;
  status: string;
  isLocked: boolean;
  salaryStructureId?: string;
  basicSalary: number;
  grossSalary: number;
  serviceDays: number;
  baseAmount: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;
}

export interface TBonusStatementSnapshot {
  bonusSheet?: TBonusStatementBonusSheetSnapshot | null;
  sourceSnapshot?: TBonusSheetSnapshot | null;
}

export interface TBonusStatementAuditLog {
  action: TBonusStatementAuditAction;
  fromStatus?: TBonusStatementStatus | null;
  toStatus?: TBonusStatementStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TBonusStatement {
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

  bonusSheet: Types.ObjectId;
  salaryStructure: Types.ObjectId;

  basicSalary: number;
  grossSalary: number;
  serviceDays: number;
  baseAmount: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;

  status: TBonusStatementStatus;
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

  snapshot?: TBonusStatementSnapshot | null;
  auditLogs: TBonusStatementAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateBonusStatementPayload {
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
  remarks?: string;
}

export interface TBonusStatementQuery {
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
  status?: TBonusStatementStatus;
  isLocked?: string;
}

export interface TBonusStatementSummaryQuery {
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
}

export interface TBonusStatementActionPayload {
  note?: string;
}

export type TBonusStatementBulkActionType =
  | "process"
  | "approve"
  | "lock"
  | "unlock";

export interface TBonusStatementBulkActionPayload {
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
  note?: string;
  /**
   * For bulk lock, strict=true prevents partial Bonus Payment Distribution readiness.
   * Default behavior is strict, so every selected Bonus Statement must already be approved.
   */
  strict?: boolean;
}

export interface BonusStatementModel extends Model<TBonusStatement> {}

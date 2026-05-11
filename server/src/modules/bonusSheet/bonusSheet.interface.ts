import type { TSoftDeleteFields } from "../../common/softDelete";
import { Model, Types } from "mongoose";
import type { TPayrollImmutableSeal } from "../../utils/payrollImmutableSeal";

export type TBonusSheetStatus = "draft" | "processed" | "approved" | "locked";

export type TBonusSheetAuditAction =
  | "generated"
  | "regenerated"
  | "processed"
  | "approved"
  | "locked"
  | "unlocked";

export type TBonusType =
  | "eid"
  | "puja"
  | "festival"
  | "attendance"
  | "production"
  | "special_incentive"
  | "other";

export type TBonusCalculationBasis =
  | "gross_salary"
  | "basic_salary"
  | "percentage_of_gross"
  | "percentage_of_basic"
  | "fixed_amount";

export interface TBonusSheetEmployeeSnapshot {
  employeeDbId: string;
  employeeId: string;
  employeeName: string;
  officeId?: string;
  cardNo?: string;
  company?: {
    id: string;
    name: string;
  } | null;
  majorDepartment?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  designation?: {
    id: string;
    name: string;
  } | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  serviceType?: string;
  payType?: string;
  employmentStatus?: string;
  joiningDate?: string;
}

export interface TBonusSheetSalarySnapshot {
  salaryStructureId: string;
  basicSalary: number;
  grossSalary: number;
  effectiveFrom: string;
}

export interface TBonusSheetRuleSnapshot {
  bonusName: string;
  bonusType: TBonusType;
  calculationBasis: TBonusCalculationBasis;
  bonusPercentage: number;
  fixedAmount: number;
  minimumServiceDays: number;
  includeProbation: boolean;
  ruleVersion: string;
}

export interface TBonusSheetCalculationSnapshot {
  serviceDays: number;
  baseAmount: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;
}

export interface TBonusSheetSnapshot {
  employee?: TBonusSheetEmployeeSnapshot | null;
  salaryStructure?: TBonusSheetSalarySnapshot | null;
  rule?: TBonusSheetRuleSnapshot | null;
  calculation?: TBonusSheetCalculationSnapshot | null;
}

export interface TBonusSheetAuditLog {
  action: TBonusSheetAuditAction;
  fromStatus?: TBonusSheetStatus | null;
  toStatus?: TBonusSheetStatus | null;
  actionBy?: Types.ObjectId | null;
  actionAt: Date;
  note?: string;
}

export interface TBonusSheet extends TSoftDeleteFields {
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
  bonusPercentage: number;
  fixedAmount: number;
  minimumServiceDays: number;
  includeProbation: boolean;

  salaryStructure: Types.ObjectId;
  basicSalary: number;
  grossSalary: number;
  serviceDays: number;
  baseAmount: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;

  status: TBonusSheetStatus;
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

  snapshot?: TBonusSheetSnapshot | null;
  auditLogs: TBonusSheetAuditLog[];
  remarks?: string;
  isDeleted: boolean;
}

export interface TGenerateBonusSheetPayload {
  month: number;
  year: number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName: string;
  bonusType: TBonusType;
  calculationBasis: TBonusCalculationBasis;
  bonusPercentage?: number;
  fixedAmount?: number;
  minimumServiceDays?: number;
  includeProbation?: boolean;
  overwrite?: boolean;
  remarks?: string;
}

export interface TBonusSheetQuery {
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
  status?: TBonusSheetStatus;
  isLocked?: string;
}

export interface TBonusSheetSummaryQuery {
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

export interface TBonusSheetActionPayload {
  note?: string;
}

export type TBonusSheetBulkActionType = "process" | "approve" | "lock" | "unlock";

export interface TBonusSheetBulkActionPayload {
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
   * For bulk lock, strict=true prevents partial bonus payment readiness.
   * Default behavior is strict, so every selected Bonus Sheet must already be approved.
   */
  strict?: boolean;
}

export interface BonusSheetModel extends Model<TBonusSheet> {}

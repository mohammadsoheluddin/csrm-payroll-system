import { Model, Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TEmployeeMovementType =
  | "increment"
  | "promotion"
  | "transfer"
  | "salary_revision"
  | "designation_change"
  | "department_change"
  | "branch_transfer"
  | "major_department_change"
  | "employment_status_change"
  | "service_type_change"
  | "pay_type_change"
  | "duty_hour_change"
  | "confirmation";

export type TEmployeeMovementStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "applied";

export type TMovementPayrollImpactModule =
  | "attendance_finalization"
  | "salary_sheet"
  | "time_bill"
  | "bonus_sheet";

export type TMovementPayrollImpactRecordStatus =
  | "missing"
  | "draft"
  | "processed"
  | "approved"
  | "locked"
  | "finalized"
  | "generated"
  | "unknown";

export type TMovementSalaryInfo = {
  grossSalary?: number;
  basicSalary?: number;
  houseRent?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  otherAllowance?: number;
  taxDeduction?: number;
  providentFund?: number;
  loanDeduction?: number;
  otherDeduction?: number;
  totalDeduction?: number;
  netSalary?: number;
};

export type TMovementIdNameInfo = {
  id?: string;
  name?: string;
};

export type TMovementDepartmentInfo = TMovementIdNameInfo;
export type TMovementDesignationInfo = TMovementIdNameInfo;
export type TMovementBranchInfo = TMovementIdNameInfo;

export type TMovementServiceInfo = {
  serviceType?: string;
  payType?: string;
  employmentStatus?: string;
  dutyHourPerDay?: number;
  leaveDay?: number;
  confirmationDate?: string;
};

export type TEmployeeMovementSnapshot = {
  employeeId?: string;
  employeeName?: string;
  company?: TMovementIdNameInfo | null;
  fromMajorDepartment?: TMovementIdNameInfo | null;
  toMajorDepartment?: TMovementIdNameInfo | null;
  fromDepartment?: TMovementDepartmentInfo | null;
  toDepartment?: TMovementDepartmentInfo | null;
  fromDesignation?: TMovementDesignationInfo | null;
  toDesignation?: TMovementDesignationInfo | null;
  fromBranch?: TMovementBranchInfo | null;
  toBranch?: TMovementBranchInfo | null;
  fromServiceInfo?: TMovementServiceInfo | null;
  toServiceInfo?: TMovementServiceInfo | null;
  fromSalary?: TMovementSalaryInfo | null;
  toSalary?: TMovementSalaryInfo | null;
};

export type TEmployeeMovementPayrollImpactRecord = {
  module: TMovementPayrollImpactModule;
  recordId?: string;
  status: TMovementPayrollImpactRecordStatus;
  isLocked: boolean;
  isBlocking: boolean;
  message: string;
};

export type TEmployeeMovementPayrollImpact = {
  effectivePayrollMonth?: string;
  effectiveDate?: Date | string;
  affectedModules: TMovementPayrollImpactModule[];
  records: TEmployeeMovementPayrollImpactRecord[];
  hasBlockingLockedRecords: boolean;
  blockers: string[];
  warnings: string[];
  nextRequiredAction?: string;
  checkedAt?: Date;
};

export type TEmployeeMovementAuditLog = {
  action:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "applied"
    | "payroll_impact_checked"
    | "soft_deleted"
    | "restored";

  fromStatus?: TEmployeeMovementStatus | null;

  toStatus?: TEmployeeMovementStatus | null;

  actionBy?: Types.ObjectId | null;

  actionAt: Date;

  note?: string;
};

export interface TEmployeeMovement extends TSoftDeleteFields {
  employee: Types.ObjectId;

  movementType: TEmployeeMovementType;

  effectiveDate: Date;

  reason?: string;

  remarks?: string;

  referenceNo?: string;

  snapshot?: TEmployeeMovementSnapshot | null;

  payrollImpact?: TEmployeeMovementPayrollImpact | null;

  status: TEmployeeMovementStatus;

  approvedBy?: Types.ObjectId | null;

  approvedAt?: Date | null;

  appliedBy?: Types.ObjectId | null;

  appliedAt?: Date | null;

  auditLogs: TEmployeeMovementAuditLog[];

}

export interface EmployeeMovementModel extends Model<TEmployeeMovement> {}

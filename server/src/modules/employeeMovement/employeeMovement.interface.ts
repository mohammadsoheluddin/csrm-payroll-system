import { Model, Types } from "mongoose";

export type TEmployeeMovementType =
  | "increment"
  | "promotion"
  | "transfer"
  | "salary_revision"
  | "designation_change"
  | "department_change"
  | "branch_transfer";

export type TEmployeeMovementStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "applied";

export type TMovementSalaryInfo = {
  grossSalary?: number;

  basicSalary?: number;

  netSalary?: number;
};

export type TMovementDepartmentInfo = {
  id?: string;

  name?: string;
};

export type TMovementDesignationInfo = {
  id?: string;

  name?: string;
};

export type TMovementBranchInfo = {
  id?: string;

  name?: string;
};

export type TEmployeeMovementSnapshot = {
  employeeId?: string;

  employeeName?: string;

  company?: {
    id?: string;

    name?: string;
  } | null;

  fromDepartment?: TMovementDepartmentInfo | null;

  toDepartment?: TMovementDepartmentInfo | null;

  fromDesignation?: TMovementDesignationInfo | null;

  toDesignation?: TMovementDesignationInfo | null;

  fromBranch?: TMovementBranchInfo | null;

  toBranch?: TMovementBranchInfo | null;

  fromSalary?: TMovementSalaryInfo | null;

  toSalary?: TMovementSalaryInfo | null;
};

export type TEmployeeMovementAuditLog = {
  action:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "applied";

  fromStatus?: TEmployeeMovementStatus | null;

  toStatus?: TEmployeeMovementStatus | null;

  actionBy?: Types.ObjectId | null;

  actionAt: Date;

  note?: string;
};

export interface TEmployeeMovement {
  employee: Types.ObjectId;

  movementType: TEmployeeMovementType;

  effectiveDate: Date;

  reason?: string;

  remarks?: string;

  referenceNo?: string;

  snapshot?: TEmployeeMovementSnapshot | null;

  status: TEmployeeMovementStatus;

  approvedBy?: Types.ObjectId | null;

  approvedAt?: Date | null;

  appliedBy?: Types.ObjectId | null;

  appliedAt?: Date | null;

  auditLogs: TEmployeeMovementAuditLog[];

  isDeleted: boolean;
}

export interface EmployeeMovementModel extends Model<TEmployeeMovement> {}

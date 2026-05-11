import { Types } from "mongoose";
import { TSoftDeleteFields, TSoftDeleteObjectId } from "../../common/softDelete";

export type TGender = "male" | "female" | "other";

export type TEmployeeStatus = "active" | "inactive";

export type TEmploymentStatus =
  | "active"
  | "probation"
  | "confirmed"
  | "resigned"
  | "terminated"
  | "retired"
  | "suspended";

export type TServiceType =
  | "permanent"
  | "probation"
  | "contractual"
  | "temporary"
  | "daily_wage"
  | "intern";

export type TPayType = "monthly" | "daily" | "hourly";

export interface TEmployeeName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TEmployeeLifecyclePayload {
  employmentStatus: TEmploymentStatus;
  effectiveDate?: string;
  reason: string;
}

export interface TEmployee extends TSoftDeleteFields {
  /**
   * Official company employee ID.
   * Important: This ID is permanent and should never be reused or changed.
   */
  employeeId: string;

  officeId?: string;
  cardNo?: string;

  user?: Types.ObjectId;

  name: TEmployeeName;
  email: string;
  phone: string;
  gender: TGender;
  dateOfBirth?: string;

  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  department: Types.ObjectId;
  designation: Types.ObjectId;
  branch: Types.ObjectId;

  joiningDate: string;
  confirmationDate?: string;

  serviceType: TServiceType;
  payType: TPayType;
  dutyHourPerDay: number;
  leaveDay: number;

  employmentStatus: TEmploymentStatus;

  /**
   * Temporary support field.
   * Salary will later be handled properly through Salary Structure module.
   */
  basicSalary?: number;

  status?: TEmployeeStatus;

  /**
   * Lifecycle metadata.
   * These fields allow HR/Admin to understand when and why an employee lifecycle changed.
   */
  lifecycleChangedAt?: Date | null;
  lifecycleChangedBy?: TSoftDeleteObjectId;
  lifecycleChangeReason?: string | null;
  lifecycleEffectiveDate?: string | null;

  /**
   * Separation metadata for resigned/terminated/retired/suspended employees.
   */
  separatedAt?: string | null;
  separationReason?: string | null;

  /**
   * Restore safety metadata.
   * When an employee is soft-deleted accidentally, previous lifecycle/status can be restored.
   */
  statusBeforeDelete?: TEmployeeStatus | null;
  employmentStatusBeforeDelete?: TEmploymentStatus | null;
}

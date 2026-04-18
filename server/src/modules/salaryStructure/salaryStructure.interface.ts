import { Types } from "mongoose";

export interface TSalaryStructure {
  employee: Types.ObjectId;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  taxDeduction: number;
  providentFund: number;
  loanDeduction: number;
  otherDeduction: number;
  grossSalary?: number;
  totalDeduction?: number;
  netSalary?: number;
  effectiveFrom: string;
  remarks?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

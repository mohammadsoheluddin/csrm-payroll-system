import { Types } from "mongoose";

export type TPayslipQuery = {
  employeeId: string;
  month: number;
  year: number;
};

export type TPayrollStatus =
  | "draft"
  | "processed"
  | "approved"
  | "paid"
  | "generated";

export type TPayrollReportQuery = {
  month: number;
  year: number;
  branch?: string;
  department?: string;
  status?: TPayrollStatus;
};

export type TPayslipResponse = {
  employee: {
    _id: Types.ObjectId | string;
    employeeId?: string;
    fullName: string;
    designation?: string;
    department?: string;
    branch?: string;
  };
  payroll: {
    _id: Types.ObjectId | string;
    month: number;
    year: number;
    status: string;
    paymentDate?: Date | null;
  };
  earnings: {
    basicSalary: number;
    allowances: number;
    overtimeAmount: number;
    bonusAmount: number;
    grossSalary: number;
  };
  deductions: {
    taxAmount: number;
    totalDeductions: number;
  };
  summary: {
    netSalary: number;
  };
};

export type TDepartmentReportItem = {
  departmentId?: string;
  departmentName?: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
};

export type TBranchReportItem = {
  branchId?: string;
  branchName?: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
};

export type TPayrollRecordItem = {
  _id: Types.ObjectId | string;
  month: number;
  year: number;
  status: string;
  basicSalary: number;
  allowances: number;
  overtimeAmount: number;
  bonusAmount: number;
  grossSalary: number;
  deductions: number;
  taxAmount: number;
  netSalary: number;
  paymentDate?: Date | null;
  employee: {
    _id?: Types.ObjectId | string;
    employeeId?: string;
    fullName?: string;
    designation?: string;
  };
  department: {
    _id?: Types.ObjectId | string;
    name?: string;
  };
  branch: {
    _id?: Types.ObjectId | string;
    name?: string;
  };
};

export type TPayrollReportResponse = {
  filters: {
    month: number;
    year: number;
    branch?: string;
    department?: string;
    status?: string;
  };
  summary: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
  };
  departmentWise: TDepartmentReportItem[];
  branchWise: TBranchReportItem[];
  records: TPayrollRecordItem[];
};

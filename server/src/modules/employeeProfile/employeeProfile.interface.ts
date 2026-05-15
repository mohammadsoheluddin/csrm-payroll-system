export type TEmployeeProfileReference = {
  id: string;
  name: string;
  code?: string;
};

export type TEmployeeProfileTimelineEventType =
  | "joining"
  | "confirmation"
  | "lifecycle"
  | "movement"
  | "document"
  | "salary_structure"
  | "payroll"
  | "legacy_salary";

export type TEmployeeProfileTimelineEvent = {
  type: TEmployeeProfileTimelineEventType;
  title: string;
  date?: string | Date | null;
  status?: string;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
};

export type TEmployeeProfileDataGapSeverity = "info" | "warning" | "critical";

export type TEmployeeProfileDataGap = {
  key: string;
  label: string;
  severity: TEmployeeProfileDataGapSeverity;
  message: string;
};

export type TEmployeeProfileQuery = {
  year?: string;
  payrollMonth?: string;
  historyLimit?: string;
  movementLimit?: string;
  legacyLimit?: string;
};

export type TEmployeeProfileSummary = {
  employeeDbId: string;
  employeeId: string;
  officeId?: string;
  cardNo?: string;
  employeeName: string;
  status?: string;
  employmentStatus?: string;
  serviceType?: string;
  payType?: string;
  joiningDate?: string;
  confirmationDate?: string;
  separatedAt?: string | null;
  company: TEmployeeProfileReference | null;
  majorDepartment: TEmployeeProfileReference | null;
  department: TEmployeeProfileReference | null;
  designation: TEmployeeProfileReference | null;
  branch: TEmployeeProfileReference | null;
};

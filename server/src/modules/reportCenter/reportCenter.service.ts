import { Model, Types } from "mongoose";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import AttendanceImportBatch from "../attendanceImport/attendanceImport.model";
import BonusPaymentDistribution from "../bonusPaymentDistribution/bonusPaymentDistribution.model";
import BonusSheet from "../bonusSheet/bonusSheet.model";
import BonusStatement from "../bonusStatement/bonusStatement.model";
import Employee from "../employee/employee.model";
import EmployeeBulkImportBatch from "../employeeBulkImport/employeeBulkImport.model";
import { EmployeeMovement } from "../employeeMovement/employeeMovement.model";
import LeaveBalance from "../leaveBalance/leaveBalance.model";
import OtPaymentDistribution from "../otPaymentDistribution/otPaymentDistribution.model";
import OtStatement from "../otStatement/otStatement.model";
import SalaryPaymentDistribution from "../salaryPaymentDistribution/salaryPaymentDistribution.model";
import SalarySheet from "../salarySheet/salarySheet.model";
import SalaryStatement from "../salaryStatement/salaryStatement.model";
import TimeBill from "../timeBill/timeBill.model";
import { PERMISSIONS } from "../user/user.constant";
import ReportCenterSavedConfig from "./reportCenter.model";
import {
  TReportCenterCategory,
  TReportCenterDashboard,
  TReportCenterDefinition,
  TReportCenterFlow,
  TReportCenterQuery,
  TReportCenterExportRoute,
  TReportCenterFormat,
  TReportCenterPaymentMode,
  TReportCenterQuickLink,
  TReportCenterReportReadiness,
  TReportCenterSavedConfigCreatePayload,
  TReportCenterSavedConfigUpdatePayload,
  TReportCenterStageReadiness,
} from "./reportCenter.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

const REPORT_DEFINITIONS: TReportCenterDefinition[] = [
  {
    id: "month_end_status",
    title: "Month-End Process Status",
    category: "audit_control",
    flow: "control",
    sequence: 1,
    description: "Central month-end readiness status for attendance, salary, OT and payment flows.",
    modulePath: "/api/v1/month-end-process-control",
    routePath: "/api/v1/month-end-process-control/status",
    periodType: "monthly",
    supportedFormats: ["preview"],
    exportPaths: { preview: "/api/v1/month-end-process-control/status" },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ,
    readinessGate: "none",
    downstreamUse: "Month-end dashboard and control checklist.",
    isOperationalReport: true,
  },
  {
    id: "attendance_finalization_summary",
    title: "Attendance Finalization Summary",
    category: "attendance",
    flow: "attendance",
    sequence: 10,
    description: "Monthly locked attendance summary used by Salary Sheet and Time Bill.",
    modulePath: "/api/v1/attendance-finalizations",
    routePath: "/api/v1/attendance-finalizations/summary",
    periodType: "monthly",
    supportedFormats: ["preview"],
    exportPaths: { preview: "/api/v1/attendance-finalizations/summary" },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.ATTENDANCE_FINALIZATION_READ,
    readinessGate: "attendance_finalization_generated",
    downstreamUse: "Salary Sheet and Time Bill source readiness.",
    isOperationalReport: true,
  },
  {
    id: "attendance_import_rejections",
    title: "Attendance Import Rejection Report",
    category: "attendance",
    flow: "attendance",
    sequence: 20,
    description: "Rejected rows from device, Excel, manual bulk or API attendance import batches.",
    modulePath: "/api/v1/attendance-imports",
    routePath: "/api/v1/attendance-imports/:id/rejections/preview",
    periodType: "on_demand",
    supportedFormats: ["preview", "csv", "excel"],
    exportPaths: {
      preview: "/api/v1/attendance-imports/:id/rejections/preview",
      csv: "/api/v1/attendance-imports/:id/rejections/csv",
      excel: "/api/v1/attendance-imports/:id/rejections/excel",
    },
    requiredFilters: ["attendanceImportBatchId"],
    optionalFilters: [],
    requiredPermission: PERMISSIONS.ATTENDANCE_IMPORT_EXPORT,
    readinessGate: "attendance_import_batch_exists",
    downstreamUse: "Attendance import correction workflow.",
    isOperationalReport: true,
  },
  {
    id: "leave_balance_report",
    title: "Leave Balance Report",
    category: "leave",
    flow: "leave",
    sequence: 30,
    description: "Yearly leave balance, entitlement, consumed leave, adjustment and remaining balance report.",
    modulePath: "/api/v1/leave-balances",
    routePath: "/api/v1/leave-balances/export/preview",
    periodType: "yearly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/leave-balances/export/preview",
      csv: "/api/v1/leave-balances/export/csv",
      excel: "/api/v1/leave-balances/export/excel",
      pdf: "/api/v1/leave-balances/export/pdf",
    },
    requiredFilters: ["company", "year"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.LEAVE_BALANCE_EXPORT,
    readinessGate: "leave_balance_generated",
    downstreamUse: "HR yearly leave reporting and employee leave ledger.",
    isOperationalReport: true,
  },
  {
    id: "employee_leave_ledger",
    title: "Employee Leave Ledger",
    category: "leave",
    flow: "leave",
    sequence: 31,
    description: "Employee-wise leave movement ledger with opening, entitlement, adjustment and consumption.",
    modulePath: "/api/v1/leave-balances",
    routePath: "/api/v1/leave-balances/ledger/preview",
    periodType: "yearly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/leave-balances/ledger/preview",
      csv: "/api/v1/leave-balances/ledger/csv",
      excel: "/api/v1/leave-balances/ledger/excel",
      pdf: "/api/v1/leave-balances/ledger/pdf",
    },
    requiredFilters: ["company", "year", "employee"],
    optionalFilters: [],
    requiredPermission: PERMISSIONS.LEAVE_BALANCE_EXPORT,
    readinessGate: "leave_balance_generated",
    downstreamUse: "Employee leave audit and HR query response.",
    isOperationalReport: true,
  },
  {
    id: "salary_sheet_summary",
    title: "Salary Sheet Summary",
    category: "salary",
    flow: "salary",
    sequence: 40,
    description: "Monthly Salary Sheet readiness and amount summary generated from locked attendance finalization.",
    modulePath: "/api/v1/salary-sheets",
    routePath: "/api/v1/salary-sheets/summary",
    periodType: "monthly",
    supportedFormats: ["preview"],
    exportPaths: { preview: "/api/v1/salary-sheets/summary" },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.SALARY_SHEET_READ,
    readinessGate: "salary_sheet_generated",
    downstreamUse: "Salary Statement source readiness.",
    isOperationalReport: true,
  },
  {
    id: "salary_statement_summary",
    title: "Salary Statement Summary",
    category: "salary",
    flow: "salary",
    sequence: 41,
    description: "Monthly Salary Statement readiness and locked source for salary payment distribution.",
    modulePath: "/api/v1/salary-statements",
    routePath: "/api/v1/salary-statements/summary",
    periodType: "monthly",
    supportedFormats: ["preview"],
    exportPaths: { preview: "/api/v1/salary-statements/summary" },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.SALARY_STATEMENT_READ,
    readinessGate: "salary_statement_generated",
    downstreamUse: "Salary Payment Distribution source readiness.",
    isOperationalReport: true,
  },
  {
    id: "salary_summary_report",
    title: "Salary Summary Report",
    category: "salary",
    flow: "salary",
    sequence: 45,
    description: "Company and unit-wise salary, wages and OT summary with gross, net, bank/mobile, cash, AIT, loan and suspense totals.",
    modulePath: "/api/v1/salary-summary",
    routePath: "/api/v1/salary-summary/preview",
    periodType: "monthly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/salary-summary/preview",
      csv: "/api/v1/salary-summary/export/csv",
      excel: "/api/v1/salary-summary/export/excel",
      pdf: "/api/v1/salary-summary/export/pdf",
    },
    requiredFilters: ["payrollMonth"],
    optionalFilters: ["company", "majorDepartment", "department", "branch"],
    requiredPermission: PERMISSIONS.SALARY_SUMMARY_EXPORT,
    readinessGate: "salary_payment_distribution_locked",
    downstreamUse: "Management salary summary, finance reconciliation and month-end reporting.",
    isOperationalReport: true,
  },
  {
    id: "salary_bank_cash_mobile_sheet",
    title: "Salary Bank/Cash/Mobile Sheet",
    category: "payment",
    flow: "payment",
    sequence: 50,
    description: "Salary payment distribution export split by bank, cash and mobile banking mode.",
    modulePath: "/api/v1/salary-payment-distributions",
    routePath: "/api/v1/salary-payment-distributions/export/preview",
    periodType: "monthly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/salary-payment-distributions/export/preview",
      csv: "/api/v1/salary-payment-distributions/export/csv",
      excel: "/api/v1/salary-payment-distributions/export/excel",
      pdf: "/api/v1/salary-payment-distributions/export/pdf",
    },
    requiredFilters: ["company", "payrollMonth", "paymentMode"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_EXPORT,
    readinessGate: "salary_payment_distribution_locked",
    downstreamUse: "Bank/cash/mobile payment disbursement.",
    isOperationalReport: true,
  },
  {
    id: "time_bill_report",
    title: "Time Bill Report",
    category: "time_bill_ot",
    flow: "ot",
    sequence: 60,
    description: "Monthly Time Bill export generated from locked attendance finalization.",
    modulePath: "/api/v1/time-bills",
    routePath: "/api/v1/time-bills/export/preview",
    periodType: "monthly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/time-bills/export/preview",
      csv: "/api/v1/time-bills/export/csv",
      excel: "/api/v1/time-bills/export/excel",
      pdf: "/api/v1/time-bills/export/pdf",
    },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.TIME_BILL_EXPORT,
    readinessGate: "time_bill_locked",
    downstreamUse: "OT Statement source and Time Bill print/export.",
    isOperationalReport: true,
  },
  {
    id: "ot_statement_report",
    title: "OT Statement Report",
    category: "time_bill_ot",
    flow: "ot",
    sequence: 61,
    description: "Monthly OT Statement export generated from locked Time Bill.",
    modulePath: "/api/v1/ot-statements",
    routePath: "/api/v1/ot-statements/export/preview",
    periodType: "monthly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/ot-statements/export/preview",
      csv: "/api/v1/ot-statements/export/csv",
      excel: "/api/v1/ot-statements/export/excel",
      pdf: "/api/v1/ot-statements/export/pdf",
    },
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.OT_STATEMENT_EXPORT,
    readinessGate: "ot_statement_locked",
    downstreamUse: "OT Payment Distribution source and OT Statement export.",
    isOperationalReport: true,
  },
  {
    id: "ot_bank_cash_mobile_sheet",
    title: "OT Bank/Cash/Mobile Sheet",
    category: "payment",
    flow: "payment",
    sequence: 70,
    description: "OT payment distribution export split by bank, cash and mobile banking mode.",
    modulePath: "/api/v1/ot-payment-distributions",
    routePath: "/api/v1/ot-payment-distributions/export/preview",
    periodType: "monthly",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/ot-payment-distributions/export/preview",
      csv: "/api/v1/ot-payment-distributions/export/csv",
      excel: "/api/v1/ot-payment-distributions/export/excel",
      pdf: "/api/v1/ot-payment-distributions/export/pdf",
    },
    requiredFilters: ["company", "payrollMonth", "paymentMode"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.OT_PAYMENT_DISTRIBUTION_EXPORT,
    readinessGate: "ot_payment_distribution_locked",
    downstreamUse: "OT bank/cash/mobile disbursement.",
    isOperationalReport: true,
  },
  {
    id: "bonus_sheet_summary",
    title: "Bonus Sheet Summary",
    category: "bonus",
    flow: "bonus",
    sequence: 80,
    description: "Bonus Sheet summary generated from active employee and salary snapshot data.",
    modulePath: "/api/v1/bonus-sheets",
    routePath: "/api/v1/bonus-sheets/summary",
    periodType: "bonus_month",
    supportedFormats: ["preview"],
    exportPaths: { preview: "/api/v1/bonus-sheets/summary" },
    requiredFilters: ["company", "bonusMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.BONUS_SHEET_READ,
    readinessGate: "bonus_sheet_generated",
    downstreamUse: "Bonus Statement source readiness.",
    isOperationalReport: true,
  },
  {
    id: "bonus_bank_cash_mobile_sheet",
    title: "Bonus Bank/Cash/Mobile Sheet",
    category: "bonus",
    flow: "bonus",
    sequence: 90,
    description: "Bonus payment distribution export split by bank, cash and mobile banking mode.",
    modulePath: "/api/v1/bonus-payment-distributions",
    routePath: "/api/v1/bonus-payment-distributions/export/preview",
    periodType: "bonus_month",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    exportPaths: {
      preview: "/api/v1/bonus-payment-distributions/export/preview",
      csv: "/api/v1/bonus-payment-distributions/export/csv",
      excel: "/api/v1/bonus-payment-distributions/export/excel",
      pdf: "/api/v1/bonus-payment-distributions/export/pdf",
    },
    requiredFilters: ["company", "bonusMonth", "paymentMode"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    requiredPermission: PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_EXPORT,
    readinessGate: "bonus_payment_distribution_locked",
    downstreamUse: "Bonus bank/cash/mobile disbursement.",
    isOperationalReport: true,
  },
  {
    id: "employee_bulk_import_rejections",
    title: "Employee Bulk Import Rejection Report",
    category: "employee",
    flow: "hr",
    sequence: 100,
    description: "Rejected rows from employee bulk import preview/commit batches.",
    modulePath: "/api/v1/employee-bulk-imports",
    routePath: "/api/v1/employee-bulk-imports/:id/rejections/preview",
    periodType: "on_demand",
    supportedFormats: ["preview", "csv", "excel"],
    exportPaths: {
      preview: "/api/v1/employee-bulk-imports/:id/rejections/preview",
      csv: "/api/v1/employee-bulk-imports/:id/rejections/csv",
      excel: "/api/v1/employee-bulk-imports/:id/rejections/excel",
    },
    requiredFilters: ["employeeBulkImportBatchId"],
    optionalFilters: [],
    requiredPermission: PERMISSIONS.EMPLOYEE_BULK_IMPORT_EXPORT,
    readinessGate: "employee_bulk_import_batch_exists",
    downstreamUse: "Employee import correction workflow.",
    isOperationalReport: true,
  },
];

const CATEGORY_KEYS: TReportCenterCategory[] = [
  "employee",
  "attendance",
  "leave",
  "salary",
  "time_bill_ot",
  "bonus",
  "payment",
  "audit_control",
];

const FLOW_KEYS: TReportCenterFlow[] = [
  "hr",
  "attendance",
  "leave",
  "salary",
  "ot",
  "bonus",
  "payment",
  "control",
];

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const parsePayrollMonth = (payrollMonth: string) => {
  const [yearText, monthText] = payrollMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!month || !year || month < 1 || month > 12 || year < 2000 || year > 2100) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Payroll month must follow YYYY-MM format.",
    );
  }

  return {
    month,
    year,
  };
};

const validateMonthYear = (month: number, year: number) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Month must be an integer between 1 and 12.",
    );
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Year must be an integer between 2000 and 2100.",
    );
  }
};

const toObjectId = (value: string | undefined, fieldName: string) => {
  if (!value || !Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }

  return new Types.ObjectId(value);
};

const toOptionalObjectId = (value: string | undefined, fieldName: string) => {
  if (!value) {
    return undefined;
  }

  return toObjectId(value, fieldName);
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const getPeriodFromQuery = (query: TReportCenterQuery) => {
  if (query.payrollMonth) {
    const parsed = parsePayrollMonth(query.payrollMonth);

    return {
      payrollMonth: query.payrollMonth,
      bonusMonth: query.bonusMonth || query.payrollMonth,
      month: parsed.month,
      year: parsed.year,
    };
  }

  if (query.month && query.year) {
    const month = Number(query.month);
    const year = Number(query.year);
    validateMonthYear(month, year);

    return {
      payrollMonth: buildPayrollMonth(month, year),
      bonusMonth: query.bonusMonth || buildPayrollMonth(month, year),
      month,
      year,
    };
  }

  if (query.year) {
    const year = Number(query.year);
    validateMonthYear(1, year);

    return {
      payrollMonth: null,
      bonusMonth: query.bonusMonth || null,
      month: null,
      year,
    };
  }

  throw new AppError(
    HTTP_STATUS.BAD_REQUEST,
    "Either payrollMonth, year, or both month and year are required.",
  );
};

const buildOrgFilter = (query: TReportCenterQuery) => {
  const filter: Record<string, unknown> = {
    company: toObjectId(query.company, "Company id"),
  };

  const majorDepartment = toOptionalObjectId(
    query.majorDepartment,
    "Major department id",
  );
  const department = toOptionalObjectId(query.department, "Department id");
  const branch = toOptionalObjectId(query.branch, "Branch id");
  const employee = toOptionalObjectId(query.employee, "Employee id");

  if (majorDepartment) {
    filter.majorDepartment = majorDepartment;
  }

  if (department) {
    filter.department = department;
  }

  if (branch) {
    filter.branch = branch;
  }

  if (employee) {
    filter.employee = employee;
  }

  return filter;
};

const buildCatalogFilter = (query: TReportCenterQuery) => {
  return REPORT_DEFINITIONS.filter((report) => {
    if (query.category && report.category !== query.category) {
      return false;
    }

    if (query.flow && report.flow !== query.flow) {
      return false;
    }

    return true;
  }).sort((a, b) => a.sequence - b.sequence);
};

const buildEmptyCategoryCounts = () => {
  return CATEGORY_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<TReportCenterCategory, number>,
  );
};

const buildEmptyFlowCounts = () => {
  return FLOW_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<TReportCenterFlow, number>,
  );
};

const sumNumericFields = <TRecord extends Record<string, unknown>>(
  records: TRecord[],
  fields: string[],
) => {
  const totals: Record<string, number> = {};

  for (const field of fields) {
    totals[field] = 0;
  }

  for (const record of records) {
    for (const field of fields) {
      totals[field] += Number(record[field] || 0);
    }
  }

  for (const field of fields) {
    totals[field] = roundToTwoDecimals(totals[field]);
  }

  return totals;
};

type TStageConfig = {
  key: string;
  title: string;
  modulePath: string;
  model: Model<any>;
  filter: Record<string, unknown>;
  numericFields: string[];
  requireFullLock?: boolean;
};

const buildStageReadiness = async ({
  key,
  title,
  modulePath,
  model,
  filter,
  numericFields,
  requireFullLock = true,
}: TStageConfig): Promise<TReportCenterStageReadiness> => {
  const records = await model.find(filter).lean<Record<string, unknown>[]>();
  const totalRecords = records.length;
  let lockedRecords = 0;

  for (const record of records) {
    if (record.isLocked) {
      lockedRecords += 1;
    }
  }

  const unlockedRecords = Math.max(totalRecords - lockedRecords, 0);
  const isGenerated = totalRecords > 0;
  const isFullyLocked = isGenerated && lockedRecords === totalRecords;
  const blockers: string[] = [];

  if (!isGenerated) {
    blockers.push(`${title} has not been generated yet.`);
  } else if (requireFullLock && !isFullyLocked) {
    blockers.push(`${unlockedRecords} ${title} record(s) are not locked yet.`);
  }

  return {
    key,
    title,
    modulePath,
    totalRecords,
    lockedRecords,
    unlockedRecords,
    isGenerated,
    isFullyLocked,
    blockers,
    totals: sumNumericFields(records, numericFields),
  };
};

const stringifyFilterValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return String(value);
};

const findReportDefinitionById = (reportId: string) => {
  const report = REPORT_DEFINITIONS.find((item) => item.id === reportId);

  if (!report) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Report definition not found.");
  }

  return report;
};

const normalizeReportQuery = (query: TReportCenterQuery): TReportCenterQuery => {
  const normalized: TReportCenterQuery = { ...query };

  for (const key of [
    "company",
    "majorDepartment",
    "department",
    "branch",
    "employee",
    "attendanceImportBatchId",
    "employeeBulkImportBatchId",
  ] as const) {
    const value = stringifyFilterValue(normalized[key]);
    if (value) {
      normalized[key] = value;
    }
  }

  return normalized;
};

const replaceRouteParams = (path: string, query: TReportCenterQuery) => {
  if (path.includes("/attendance-imports/:id")) {
    const batchId = stringifyFilterValue(query.attendanceImportBatchId);
    return batchId ? path.replace(":id", batchId) : path;
  }

  if (path.includes("/employee-bulk-imports/:id")) {
    const batchId = stringifyFilterValue(query.employeeBulkImportBatchId);
    return batchId ? path.replace(":id", batchId) : path;
  }

  return path;
};

const addQueryParams = (
  path: string,
  query: TReportCenterQuery,
  period: ReturnType<typeof getPeriodFromQuery> | null,
) => {
  const params = new URLSearchParams();
  const routePath = replaceRouteParams(path, query);

  if (routePath.includes(":id")) {
    return routePath;
  }

  if (routePath.includes("bonus-payment") || routePath.includes("bonus-sheets")) {
    if (period?.bonusMonth || query.bonusMonth) {
      params.set("bonusMonth", String(period?.bonusMonth || query.bonusMonth));
    }
  } else if (period?.payrollMonth || query.payrollMonth) {
    params.set("payrollMonth", String(period?.payrollMonth || query.payrollMonth));
  }

  if (query.company) {
    params.set("company", String(query.company));
  }

  if (query.majorDepartment) {
    params.set("majorDepartment", String(query.majorDepartment));
  }

  if (query.department) {
    params.set("department", String(query.department));
  }

  if (query.branch) {
    params.set("branch", String(query.branch));
  }

  if (query.employee) {
    params.set("employee", String(query.employee));
  }

  if (routePath.includes("payment-distributions/export")) {
    params.set("paymentMode", query.paymentMode || "bank");
  }

  if (routePath.includes("leave-balances") && (period?.year || query.year)) {
    params.set("year", String(period?.year || query.year));
  }

  const queryText = params.toString();

  return queryText ? `${routePath}?${queryText}` : routePath;
};

const buildReportReadiness = (
  report: TReportCenterDefinition,
  stages: Record<string, TReportCenterStageReadiness>,
  query: TReportCenterQuery,
  period: ReturnType<typeof getPeriodFromQuery>,
): TReportCenterReportReadiness => {
  const gate = report.readinessGate || "none";
  const blockers: string[] = [];
  let isAvailable = true;

  if (gate.endsWith("_locked")) {
    const stageKey = gate.replace(/_locked$/, "");
    const stage = stages[stageKey];

    if (!stage || !stage.isFullyLocked) {
      isAvailable = false;
      blockers.push(stage?.blockers[0] || `${report.title} source is not locked yet.`);
    }
  } else if (gate.endsWith("_generated")) {
    const stageKey = gate.replace(/_generated$/, "");
    const stage = stages[stageKey];

    if (!stage || !stage.isGenerated) {
      isAvailable = false;
      blockers.push(stage?.blockers[0] || `${report.title} source is not generated yet.`);
    }
  } else if (gate.endsWith("_batch_exists")) {
    isAvailable = false;
    blockers.push("Select a specific import batch id to open this report.");
  }

  const exportPaths = Object.entries(report.exportPaths).reduce(
    (acc, [format, path]) => {
      acc[format as keyof typeof acc] = addQueryParams(path, query, period);
      return acc;
    },
    {} as TReportCenterDefinition["exportPaths"],
  );

  return {
    reportId: report.id,
    title: report.title,
    category: report.category,
    flow: report.flow,
    modulePath: report.modulePath,
    isAvailable,
    isBlocked: !isAvailable,
    blockers,
    supportedFormats: report.supportedFormats,
    exportPaths,
    requiredPermission: report.requiredPermission,
    readinessGate: report.readinessGate,
  };
};

const getReportCatalogFromDB = async (query: TReportCenterQuery) => {
  const reports = buildCatalogFilter(query);

  return {
    totalReports: reports.length,
    reports,
    generatedAt: new Date(),
  };
};

const getReportCenterDashboardFromDB = async (
  query: TReportCenterQuery,
): Promise<TReportCenterDashboard> => {
  const period = getPeriodFromQuery(query);
  const orgFilter = buildOrgFilter(query);
  const monthlyFilter = period.payrollMonth
    ? { ...orgFilter, payrollMonth: period.payrollMonth, isDeleted: false }
    : { ...orgFilter, isDeleted: false };
  const bonusFilter = period.bonusMonth
    ? { ...orgFilter, bonusMonth: period.bonusMonth, isDeleted: false }
    : { ...orgFilter, isDeleted: false };
  const yearlyFilter = period.year
    ? { ...orgFilter, year: period.year, isDeleted: false }
    : { ...orgFilter, isDeleted: false };

  const stages = {
    attendance_finalization: await buildStageReadiness({
      key: "attendance_finalization",
      title: "Attendance Finalization",
      modulePath: "/api/v1/attendance-finalizations",
      model: AttendanceFinalization,
      filter: monthlyFilter,
      numericFields: [
        "totalPayableDays",
        "totalDeductionDays",
        "totalAbsentDays",
        "totalPaidLeaveDays",
        "totalUnpaidLeaveDays",
        "totalOtHours",
        "totalTiffinDays",
      ],
    }),
    salary_sheet: await buildStageReadiness({
      key: "salary_sheet",
      title: "Salary Sheet",
      modulePath: "/api/v1/salary-sheets",
      model: SalarySheet,
      filter: monthlyFilter,
      numericFields: [
        "grossSalary",
        "attendanceDeduction",
        "fixedDeduction",
        "totalDeduction",
        "netSalary",
        "payableSalary",
      ],
    }),
    salary_statement: await buildStageReadiness({
      key: "salary_statement",
      title: "Salary Statement",
      modulePath: "/api/v1/salary-statements",
      model: SalaryStatement,
      filter: monthlyFilter,
      numericFields: [
        "grossSalary",
        "attendanceDeduction",
        "fixedDeduction",
        "totalDeduction",
        "netSalary",
        "payableSalary",
      ],
    }),
    salary_payment_distribution: await buildStageReadiness({
      key: "salary_payment_distribution",
      title: "Salary Payment Distribution",
      modulePath: "/api/v1/salary-payment-distributions",
      model: SalaryPaymentDistribution,
      filter: monthlyFilter,
      numericFields: ["payableSalary", "bankAmount", "cashAmount", "mobileBankingAmount"],
    }),
    time_bill: await buildStageReadiness({
      key: "time_bill",
      title: "Time Bill",
      modulePath: "/api/v1/time-bills",
      model: TimeBill,
      filter: monthlyFilter,
      numericFields: ["otHours", "otAmount", "tiffinAmount", "totalPayableAmount"],
    }),
    ot_statement: await buildStageReadiness({
      key: "ot_statement",
      title: "OT Statement",
      modulePath: "/api/v1/ot-statements",
      model: OtStatement,
      filter: monthlyFilter,
      numericFields: ["otHours", "otAmount", "tiffinAmount", "totalPayableAmount"],
    }),
    ot_payment_distribution: await buildStageReadiness({
      key: "ot_payment_distribution",
      title: "OT Payment Distribution",
      modulePath: "/api/v1/ot-payment-distributions",
      model: OtPaymentDistribution,
      filter: monthlyFilter,
      numericFields: ["totalPayableAmount", "bankAmount", "cashAmount", "mobileBankingAmount"],
    }),
    bonus_sheet: await buildStageReadiness({
      key: "bonus_sheet",
      title: "Bonus Sheet",
      modulePath: "/api/v1/bonus-sheets",
      model: BonusSheet,
      filter: bonusFilter,
      numericFields: ["grossSalary", "basicSalary", "bonusAmount", "payableBonusAmount"],
    }),
    bonus_statement: await buildStageReadiness({
      key: "bonus_statement",
      title: "Bonus Statement",
      modulePath: "/api/v1/bonus-statements",
      model: BonusStatement,
      filter: bonusFilter,
      numericFields: ["grossSalary", "basicSalary", "bonusAmount", "payableBonusAmount"],
    }),
    bonus_payment_distribution: await buildStageReadiness({
      key: "bonus_payment_distribution",
      title: "Bonus Payment Distribution",
      modulePath: "/api/v1/bonus-payment-distributions",
      model: BonusPaymentDistribution,
      filter: bonusFilter,
      numericFields: ["payableBonusAmount", "bankAmount", "cashAmount", "mobileBankingAmount"],
    }),
    leave_balance: await buildStageReadiness({
      key: "leave_balance",
      title: "Leave Balance",
      modulePath: "/api/v1/leave-balances",
      model: LeaveBalance,
      filter: yearlyFilter,
      numericFields: [
        "openingBalance",
        "yearlyEntitlement",
        "earnedDays",
        "approvedConsumedDays",
        "pendingDays",
        "remainingDays",
        "availableDays",
        "overConsumedDays",
      ],
      requireFullLock: false,
    }),
    attendance_import: await buildStageReadiness({
      key: "attendance_import",
      title: "Attendance Import Batch",
      modulePath: "/api/v1/attendance-imports",
      model: AttendanceImportBatch,
      filter: { ...orgFilter },
      numericFields: ["totalRows", "validRows", "invalidRows", "insertedCount", "updatedCount"],
      requireFullLock: false,
    }),
    employee_bulk_import: await buildStageReadiness({
      key: "employee_bulk_import",
      title: "Employee Bulk Import Batch",
      modulePath: "/api/v1/employee-bulk-imports",
      model: EmployeeBulkImportBatch,
      filter: { ...orgFilter },
      numericFields: ["totalRows", "validRows", "invalidRows", "createdCount"],
      requireFullLock: false,
    }),
    employee_movement: await buildStageReadiness({
      key: "employee_movement",
      title: "Employee Movement",
      modulePath: "/api/v1/employee-movements",
      model: EmployeeMovement,
      filter: { ...orgFilter, isDeleted: false },
      numericFields: [],
      requireFullLock: false,
    }),
  };

  const reports = buildCatalogFilter(query).map((report) =>
    buildReportReadiness(report, stages, query, period),
  );
  const categories = buildEmptyCategoryCounts();
  const flows = buildEmptyFlowCounts();

  for (const report of reports) {
    categories[report.category] += 1;
    flows[report.flow] += 1;
  }

  return {
    period,
    filters: {
      company: query.company || null,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
      category: query.category || null,
      flow: query.flow || null,
    },
    totalCatalogReports: REPORT_DEFINITIONS.length,
    totalVisibleReports: reports.length,
    totalAvailableReports: reports.filter((report) => report.isAvailable).length,
    totalBlockedReports: reports.filter((report) => report.isBlocked).length,
    categories,
    flows,
    stages,
    reports,
    generatedAt: new Date(),
  };
};

const getReportReadinessFromDB = async (query: TReportCenterQuery) => {
  const dashboard = await getReportCenterDashboardFromDB(query);

  return {
    period: dashboard.period,
    filters: dashboard.filters,
    stages: dashboard.stages,
    reports: dashboard.reports,
    generatedAt: dashboard.generatedAt,
  };
};

const getReportQuickLinksFromDB = async (
  query: TReportCenterQuery,
): Promise<{
  totalLinks: number;
  links: TReportCenterQuickLink[];
  generatedAt: Date;
}> => {
  const dashboard = await getReportCenterDashboardFromDB(query);
  const links = dashboard.reports.map((report) => ({
    reportId: report.reportId,
    title: report.title,
    category: report.category,
    flow: report.flow,
    previewUrl: report.exportPaths.preview || null,
    csvUrl: report.exportPaths.csv || null,
    excelUrl: report.exportPaths.excel || null,
    pdfUrl: report.exportPaths.pdf || null,
    isAvailable: report.isAvailable,
    blockers: report.blockers,
  }));

  return {
    totalLinks: links.length,
    links,
    generatedAt: new Date(),
  };
};


const getPeriodForReport = (
  report: TReportCenterDefinition,
  query: TReportCenterQuery,
) => {
  if (report.periodType === "on_demand") {
    return null;
  }

  return getPeriodFromQuery(query);
};

const hasRequiredFilter = (
  filterName: string,
  query: TReportCenterQuery,
  period: ReturnType<typeof getPeriodFromQuery> | null,
) => {
  if (filterName === "payrollMonth") {
    return Boolean(query.payrollMonth || period?.payrollMonth || (query.month && query.year));
  }

  if (filterName === "bonusMonth") {
    return Boolean(query.bonusMonth || period?.bonusMonth || query.payrollMonth);
  }

  if (filterName === "year") {
    return Boolean(query.year || period?.year);
  }

  return Boolean((query as Record<string, unknown>)[filterName]);
};

const validateRequiredFilters = (
  report: TReportCenterDefinition,
  query: TReportCenterQuery,
  period: ReturnType<typeof getPeriodFromQuery> | null,
) => {
  const missingFilters: string[] = [];

  for (const filterName of report.requiredFilters) {
    if (!hasRequiredFilter(filterName, query, period)) {
      missingFilters.push(filterName);
    }
  }

  return missingFilters;
};

const getReadinessForReport = async (
  report: TReportCenterDefinition,
  query: TReportCenterQuery,
) => {
  if (report.periodType === "on_demand") {
    return {
      isAvailable: true,
      blockers: [] as string[],
    };
  }

  const dashboard = await getReportCenterDashboardFromDB(query);
  const readiness = dashboard.reports.find((item) => item.reportId === report.id);

  return {
    isAvailable: readiness?.isAvailable ?? true,
    blockers: readiness?.blockers ?? [],
  };
};

const getReportExportRouteFromDB = async (
  query: TReportCenterQuery,
): Promise<TReportCenterExportRoute> => {
  if (!query.reportId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Report id is required.");
  }

  if (!query.format) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Export format is required.");
  }

  const report = findReportDefinitionById(query.reportId);
  const format = query.format as TReportCenterFormat;

  if (!report.supportedFormats.includes(format)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${format} export is not supported for ${report.title}.`,
    );
  }

  const exportPath = report.exportPaths[format];

  if (!exportPath) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${format} export route is not configured for ${report.title}.`,
    );
  }

  const normalizedQuery = normalizeReportQuery(query);
  const period = getPeriodForReport(report, normalizedQuery);
  const missingFilters = validateRequiredFilters(report, normalizedQuery, period);
  const blockers: string[] = [];

  if (missingFilters.length > 0) {
    blockers.push(
      `Missing required filter(s): ${missingFilters.join(", ")}.`,
    );
  }

  if (exportPath.includes(":id")) {
    const unresolvedPath = replaceRouteParams(exportPath, normalizedQuery);
    if (unresolvedPath.includes(":id")) {
      blockers.push("A valid import batch id is required for this report route.");
    }
  }

  if (blockers.length === 0) {
    const readiness = await getReadinessForReport(report, normalizedQuery);

    if (!readiness.isAvailable) {
      blockers.push(...readiness.blockers);
    }
  }

  const destinationUrl = addQueryParams(exportPath, normalizedQuery, period);

  return {
    reportId: report.id,
    title: report.title,
    category: report.category,
    flow: report.flow,
    format,
    destinationUrl,
    isAvailable: blockers.length === 0,
    isBlocked: blockers.length > 0,
    blockers,
    requiredPermission: report.requiredPermission,
    requiredFilters: report.requiredFilters,
    suppliedFilters: {
      payrollMonth: normalizedQuery.payrollMonth || period?.payrollMonth || null,
      bonusMonth: normalizedQuery.bonusMonth || period?.bonusMonth || null,
      year: normalizedQuery.year || period?.year || null,
      company: normalizedQuery.company || null,
      majorDepartment: normalizedQuery.majorDepartment || null,
      department: normalizedQuery.department || null,
      branch: normalizedQuery.branch || null,
      employee: normalizedQuery.employee || null,
      paymentMode: normalizedQuery.paymentMode || null,
      attendanceImportBatchId: normalizedQuery.attendanceImportBatchId || null,
      employeeBulkImportBatchId: normalizedQuery.employeeBulkImportBatchId || null,
    },
    generatedAt: new Date(),
  };
};

const validateSavedConfigFormats = (
  report: TReportCenterDefinition,
  defaultFormat: TReportCenterFormat,
  selectedFormats: TReportCenterFormat[],
) => {
  const unsupportedFormats = selectedFormats.filter(
    (format) => !report.supportedFormats.includes(format),
  );

  if (unsupportedFormats.length > 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Unsupported format(s) for ${report.title}: ${unsupportedFormats.join(", ")}.`,
    );
  }

  if (!report.supportedFormats.includes(defaultFormat)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${defaultFormat} is not supported as default format for ${report.title}.`,
    );
  }
};

const normalizeSavedFormats = (
  report: TReportCenterDefinition,
  defaultFormat?: TReportCenterFormat,
  selectedFormats?: TReportCenterFormat[],
) => {
  const resolvedDefaultFormat = defaultFormat || report.supportedFormats[0] || "preview";
  const selected = selectedFormats?.length ? selectedFormats : [resolvedDefaultFormat];
  const uniqueFormats = Array.from(new Set([...selected, resolvedDefaultFormat]));

  validateSavedConfigFormats(report, resolvedDefaultFormat, uniqueFormats);

  return {
    defaultFormat: resolvedDefaultFormat,
    selectedFormats: uniqueFormats,
  };
};

const castOptionalObjectId = (value: unknown, fieldName: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const stringValue = String(value);

  if (!Types.ObjectId.isValid(stringValue)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }

  return new Types.ObjectId(stringValue);
};

const normalizeSavedFilters = (
  filters: TReportCenterSavedConfigCreatePayload["filters"] = {},
) => {
  return {
    payrollMonth: filters.payrollMonth,
    bonusMonth: filters.bonusMonth,
    month: filters.month,
    year: filters.year,
    company: castOptionalObjectId(filters.company, "Company id"),
    majorDepartment: castOptionalObjectId(
      filters.majorDepartment,
      "Major department id",
    ),
    department: castOptionalObjectId(filters.department, "Department id"),
    branch: castOptionalObjectId(filters.branch, "Branch id"),
    employee: castOptionalObjectId(filters.employee, "Employee id"),
    paymentMode: filters.paymentMode,
    attendanceImportBatchId: castOptionalObjectId(
      filters.attendanceImportBatchId,
      "Attendance import batch id",
    ),
    employeeBulkImportBatchId: castOptionalObjectId(
      filters.employeeBulkImportBatchId,
      "Employee bulk import batch id",
    ),
  };
};

const objectIdToString = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  return String(value);
};

const buildQueryFromSavedConfig = (
  config: {
    reportId: string;
    defaultFormat: TReportCenterFormat;
    filters: Record<string, unknown>;
  },
  overrides: TReportCenterQuery,
): TReportCenterQuery => {
  const filters = config.filters || {};

  return {
    reportId: overrides.reportId || config.reportId,
    format: overrides.format || config.defaultFormat,
    payrollMonth: overrides.payrollMonth || objectIdToString(filters.payrollMonth),
    bonusMonth: overrides.bonusMonth || objectIdToString(filters.bonusMonth),
    month: overrides.month || (filters.month as string | number | undefined),
    year: overrides.year || (filters.year as string | number | undefined),
    company: overrides.company || objectIdToString(filters.company),
    majorDepartment:
      overrides.majorDepartment || objectIdToString(filters.majorDepartment),
    department: overrides.department || objectIdToString(filters.department),
    branch: overrides.branch || objectIdToString(filters.branch),
    employee: overrides.employee || objectIdToString(filters.employee),
    paymentMode:
      overrides.paymentMode || (filters.paymentMode as TReportCenterPaymentMode | undefined),
    attendanceImportBatchId:
      overrides.attendanceImportBatchId || objectIdToString(filters.attendanceImportBatchId),
    employeeBulkImportBatchId:
      overrides.employeeBulkImportBatchId || objectIdToString(filters.employeeBulkImportBatchId),
  };
};

const createSavedReportConfigIntoDB = async (
  payload: TReportCenterSavedConfigCreatePayload,
  userId?: string,
) => {
  const report = findReportDefinitionById(payload.reportId);
  const formats = normalizeSavedFormats(
    report,
    payload.defaultFormat,
    payload.selectedFormats,
  );
  const createdBy = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

  const result = await ReportCenterSavedConfig.create({
    configName: payload.configName,
    description: payload.description,
    reportId: report.id,
    reportTitle: report.title,
    category: report.category,
    flow: report.flow,
    defaultFormat: formats.defaultFormat,
    selectedFormats: formats.selectedFormats,
    filters: normalizeSavedFilters(payload.filters),
    isPinned: payload.isPinned || false,
    isShared: payload.isShared || false,
    isActive: payload.isActive ?? true,
    createdBy,
    updatedBy: createdBy,
  });

  return result;
};

const getSavedReportConfigsFromDB = async (query: TReportCenterQuery & { isPinned?: string; isActive?: string }) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.reportId) {
    filter.reportId = query.reportId;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.flow) {
    filter.flow = query.flow;
  }

  if (query.isPinned !== undefined) {
    filter.isPinned = query.isPinned === "true";
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  const configs = await ReportCenterSavedConfig.find(filter)
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  return {
    totalConfigs: configs.length,
    configs,
    generatedAt: new Date(),
  };
};

const getSingleSavedReportConfigFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Saved report config id is invalid.");
  }

  const config = await ReportCenterSavedConfig.findOne({
    _id: id,
    isDeleted: false,
  }).lean();

  if (!config) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Saved report config not found.");
  }

  return config;
};

const updateSavedReportConfigIntoDB = async (
  id: string,
  payload: TReportCenterSavedConfigUpdatePayload,
  userId?: string,
) => {
  const existing = await getSingleSavedReportConfigFromDB(id);
  const report = payload.reportId
    ? findReportDefinitionById(payload.reportId)
    : findReportDefinitionById(existing.reportId);
  const formats = normalizeSavedFormats(
    report,
    payload.defaultFormat || existing.defaultFormat,
    payload.selectedFormats || existing.selectedFormats,
  );
  const updatedBy = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

  const updated = await ReportCenterSavedConfig.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: {
        ...(payload.configName !== undefined && { configName: payload.configName }),
        ...(payload.description !== undefined && { description: payload.description }),
        reportId: report.id,
        reportTitle: report.title,
        category: report.category,
        flow: report.flow,
        defaultFormat: formats.defaultFormat,
        selectedFormats: formats.selectedFormats,
        ...(payload.filters !== undefined && {
          filters: normalizeSavedFilters(payload.filters),
        }),
        ...(payload.isPinned !== undefined && { isPinned: payload.isPinned }),
        ...(payload.isShared !== undefined && { isShared: payload.isShared }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
        updatedBy,
      },
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Saved report config not found.");
  }

  return updated;
};

const deleteSavedReportConfigFromDB = async (
  id: string,
  userId?: string,
) => {
  const updatedBy = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  const deleted = await ReportCenterSavedConfig.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        updatedBy,
      },
    },
    { new: true },
  );

  if (!deleted) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Saved report config not found.");
  }

  return deleted;
};

const getSavedReportConfigExportRouteFromDB = async (
  id: string,
  overrides: TReportCenterQuery,
) => {
  const config = await getSingleSavedReportConfigFromDB(id);
  const query = buildQueryFromSavedConfig(
    {
      reportId: config.reportId,
      defaultFormat: config.defaultFormat,
      filters: config.filters as Record<string, unknown>,
    },
    overrides,
  );

  return getReportExportRouteFromDB(query);
};

export const ReportCenterServices = {
  getReportCatalogFromDB,
  getReportCenterDashboardFromDB,
  getReportReadinessFromDB,
  getReportQuickLinksFromDB,
  getReportExportRouteFromDB,
  createSavedReportConfigIntoDB,
  getSavedReportConfigsFromDB,
  getSingleSavedReportConfigFromDB,
  updateSavedReportConfigIntoDB,
  deleteSavedReportConfigFromDB,
  getSavedReportConfigExportRouteFromDB,
};

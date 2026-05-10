import {
  DEFAULT_REPORT_PAGE_SETUP,
  DEFAULT_REPORT_SIGNATURES,
  REPORT_LAYOUT_COMPANY_NAME,
  REPORT_LAYOUT_DEPARTMENT_NAME,
  REPORT_LAYOUT_SYSTEM_NAME,
  REPORT_LAYOUT_VERSION,
  TReportColumnDefinition,
} from "../../utils/reportLayout";
import {
  TReportLayoutKey,
  TReportLayoutStandard,
  TReportLayoutStandardQuery,
  TReportLayoutStandardResponse,
} from "./reportLayoutStandard.interface";

const commonEmployeeColumns: TReportColumnDefinition[] = [
  { header: "SL", key: "slNo", width: 8, align: "center", type: "number" },
  { header: "Employee ID", key: "employeeId", width: 18, type: "text" },
  { header: "Employee Name", key: "employeeName", width: 28, type: "text" },
  { header: "Designation", key: "designation", width: 24, type: "text" },
  { header: "Department", key: "department", width: 24, type: "text" },
];

const paymentColumns: TReportColumnDefinition[] = [
  { header: "Payment Mode", key: "paymentMode", width: 18, type: "text" },
  { header: "Bank Name", key: "bankName", width: 24, type: "text" },
  { header: "Account No", key: "accountNo", width: 24, type: "text" },
  { header: "Mobile Banking No", key: "mobileBankingNo", width: 24, type: "text" },
  { header: "Payable Amount", key: "payableAmount", width: 16, align: "right", type: "amount", isTotal: true },
];

const makePageSetup = (orientation: "portrait" | "landscape" = "landscape") => ({
  orientation,
  paperSize: "A4" as const,
  excelPaperSize: DEFAULT_REPORT_PAGE_SETUP.excel.paperSize,
  fitToWidth: DEFAULT_REPORT_PAGE_SETUP.excel.fitToWidth,
  fitToHeight: DEFAULT_REPORT_PAGE_SETUP.excel.fitToHeight,
  margin: DEFAULT_REPORT_PAGE_SETUP.pdf.margin,
});

const buildStandard = (standard: TReportLayoutStandard) => standard;

const REPORT_LAYOUT_STANDARDS: TReportLayoutStandard[] = [
  buildStandard({
    reportKey: "attendance_summary",
    title: "Attendance Summary",
    category: "attendance",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Present", key: "presentDays", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "Absent", key: "absentDays", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "Leave", key: "leaveDays", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "Late", key: "lateDays", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "Deduction Days", key: "deductionDays", width: 16, align: "right", type: "decimal", isTotal: true },
    ],
    amountColumns: [],
    decimalColumns: ["presentDays", "absentDays", "leaveDays", "lateDays", "deductionDays"],
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Attendance reports must come from locked attendance finalization for payroll use."],
  }),
  buildStandard({
    reportKey: "leave_balance",
    title: "Leave Balance Report",
    category: "leave",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Leave Type", key: "leaveType", width: 16, type: "text" },
      { header: "Opening", key: "openingBalance", width: 12, align: "right", type: "decimal" },
      { header: "Entitlement", key: "yearlyEntitlement", width: 14, align: "right", type: "decimal" },
      { header: "Consumed", key: "approvedConsumedDays", width: 14, align: "right", type: "decimal" },
      { header: "Remaining", key: "remainingDays", width: 14, align: "right", type: "decimal" },
    ],
    amountColumns: [],
    decimalColumns: ["openingBalance", "yearlyEntitlement", "approvedConsumedDays", "remainingDays"],
    requiredFilters: ["company", "year"],
    optionalFilters: ["department", "employee", "leaveType"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Previous year remaining leave is shown as expired, not carried forward."],
  }),
  buildStandard({
    reportKey: "employee_leave_ledger",
    title: "Employee Leave Ledger",
    category: "leave",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("portrait"),
    columns: [
      { header: "Date", key: "date", width: 16, type: "date" },
      { header: "Leave Type", key: "leaveType", width: 16, type: "text" },
      { header: "Description", key: "description", width: 34, type: "text" },
      { header: "Credit", key: "credit", width: 12, align: "right", type: "decimal" },
      { header: "Debit", key: "debit", width: 12, align: "right", type: "decimal" },
      { header: "Balance", key: "balance", width: 12, align: "right", type: "decimal" },
    ],
    amountColumns: [],
    decimalColumns: ["credit", "debit", "balance"],
    requiredFilters: ["company", "year", "employee"],
    optionalFilters: ["leaveType"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Ledger should show opening, entitlement, adjustments, approved leave and running balance."],
  }),
  buildStandard({
    reportKey: "salary_sheet",
    title: "Salary Sheet",
    category: "salary",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Gross Salary", key: "grossSalary", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Attendance Deduction", key: "attendanceDeduction", width: 18, align: "right", type: "amount", isTotal: true },
      { header: "Total Deduction", key: "totalDeduction", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Net Salary", key: "netSalary", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Payable Salary", key: "payableSalary", width: 16, align: "right", type: "amount", isTotal: true },
    ],
    amountColumns: ["grossSalary", "attendanceDeduction", "totalDeduction", "netSalary", "payableSalary"],
    decimalColumns: [],
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Salary Sheet must be generated from locked attendance finalization."],
  }),
  buildStandard({
    reportKey: "salary_statement",
    title: "Salary Statement",
    category: "salary",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Gross Salary", key: "grossSalary", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Total Deduction", key: "totalDeduction", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Payable Salary", key: "payableSalary", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Status", key: "status", width: 14, type: "status" },
    ],
    amountColumns: ["grossSalary", "totalDeduction", "payableSalary"],
    decimalColumns: [],
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Salary Statement must consume locked Salary Sheet records only."],
  }),
  buildStandard({
    reportKey: "salary_bank_cash_mobile_sheet",
    title: "Salary Bank/Cash/Mobile Sheet",
    category: "salary",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [...commonEmployeeColumns, ...paymentColumns],
    amountColumns: ["payableAmount"],
    decimalColumns: [],
    requiredFilters: ["company", "payrollMonth", "paymentMode"],
    optionalFilters: ["majorDepartment", "department", "branch"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Payment exports must consume locked Salary Payment Distribution only."],
  }),
  buildStandard({
    reportKey: "time_bill",
    title: "Time Bill Summary",
    category: "ot",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Duty Hour", key: "dutyHourPerDay", width: 12, align: "right", type: "decimal" },
      { header: "OT Rate", key: "otRate", width: 14, align: "right", type: "amount" },
      { header: "OT Hour", key: "otHours", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "OT Amount", key: "otAmount", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Tiffin Amount", key: "tiffinAmount", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Total Amount", key: "totalPayableAmount", width: 16, align: "right", type: "amount", isTotal: true },
    ],
    amountColumns: ["otRate", "otAmount", "tiffinAmount", "totalPayableAmount"],
    decimalColumns: ["dutyHourPerDay", "otHours"],
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Time Bill must consume locked attendance finalization only."],
  }),
  buildStandard({
    reportKey: "ot_statement",
    title: "OT Statement",
    category: "ot",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "OT Hour", key: "otHours", width: 12, align: "right", type: "decimal", isTotal: true },
      { header: "OT Amount", key: "otAmount", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Tiffin Amount", key: "tiffinAmount", width: 16, align: "right", type: "amount", isTotal: true },
      { header: "Total Amount", key: "totalPayableAmount", width: 16, align: "right", type: "amount", isTotal: true },
    ],
    amountColumns: ["otAmount", "tiffinAmount", "totalPayableAmount"],
    decimalColumns: ["otHours"],
    requiredFilters: ["company", "payrollMonth"],
    optionalFilters: ["majorDepartment", "department", "branch", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["OT Statement must consume locked Time Bill records only."],
  }),
  buildStandard({
    reportKey: "ot_bank_cash_mobile_sheet",
    title: "OT Bank/Cash/Mobile Sheet",
    category: "ot",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [...commonEmployeeColumns, ...paymentColumns],
    amountColumns: ["payableAmount"],
    decimalColumns: [],
    requiredFilters: ["company", "payrollMonth", "paymentMode"],
    optionalFilters: ["majorDepartment", "department", "branch"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["OT payment exports must consume locked OT Payment Distribution only."],
  }),
  buildStandard({
    reportKey: "bonus_sheet",
    title: "Bonus Sheet",
    category: "bonus",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      ...commonEmployeeColumns,
      { header: "Bonus Name", key: "bonusName", width: 26, type: "text" },
      { header: "Bonus Type", key: "bonusType", width: 16, type: "text" },
      { header: "Gross Salary", key: "grossSalary", width: 16, align: "right", type: "amount" },
      { header: "Bonus Amount", key: "bonusAmount", width: 16, align: "right", type: "amount", isTotal: true },
    ],
    amountColumns: ["grossSalary", "bonusAmount"],
    decimalColumns: [],
    requiredFilters: ["company", "bonusMonth"],
    optionalFilters: ["bonusType", "department", "employee"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Bonus Sheet is separate from monthly Salary Sheet."],
  }),
  buildStandard({
    reportKey: "bonus_bank_cash_mobile_sheet",
    title: "Bonus Bank/Cash/Mobile Sheet",
    category: "bonus",
    supportedFormats: ["preview", "csv", "excel", "pdf"],
    pageSetup: makePageSetup("landscape"),
    columns: [...commonEmployeeColumns, ...paymentColumns],
    amountColumns: ["payableAmount"],
    decimalColumns: [],
    requiredFilters: ["company", "bonusMonth", "paymentMode"],
    optionalFilters: ["department", "branch"],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Bonus payment exports must consume locked Bonus Payment Distribution only."],
  }),
  buildStandard({
    reportKey: "import_rejection_report",
    title: "Import Rejection Report",
    category: "import",
    supportedFormats: ["preview", "csv", "excel"],
    pageSetup: makePageSetup("landscape"),
    columns: [
      { header: "Row No", key: "rowNo", width: 10, align: "center", type: "number" },
      { header: "Reference", key: "reference", width: 24, type: "text" },
      { header: "Status", key: "status", width: 16, type: "status" },
      { header: "Reason", key: "reason", width: 44, type: "text" },
      { header: "Raw Data", key: "rawData", width: 60, type: "text" },
    ],
    amountColumns: [],
    decimalColumns: [],
    requiredFilters: ["importBatchId"],
    optionalFilters: [],
    signatures: DEFAULT_REPORT_SIGNATURES,
    notes: ["Rejected rows must be fixed before strict-mode commit."],
  }),
];

const filterStandards = (query: TReportLayoutStandardQuery) =>
  REPORT_LAYOUT_STANDARDS.filter((standard) => {
    if (query.reportKey && standard.reportKey !== query.reportKey) {
      return false;
    }

    if (query.category && standard.category !== query.category) {
      return false;
    }

    if (query.format && !standard.supportedFormats.includes(query.format)) {
      return false;
    }

    return true;
  });

const getReportLayoutStandardsFromDB = (
  query: TReportLayoutStandardQuery,
): TReportLayoutStandardResponse => ({
  layoutVersion: REPORT_LAYOUT_VERSION,
  companyName: REPORT_LAYOUT_COMPANY_NAME,
  systemName: REPORT_LAYOUT_SYSTEM_NAME,
  departmentName: REPORT_LAYOUT_DEPARTMENT_NAME,
  standards: filterStandards(query),
});

const getSingleReportLayoutStandardFromDB = (reportKey: TReportLayoutKey) => {
  const standard = REPORT_LAYOUT_STANDARDS.find(
    (layoutStandard) => layoutStandard.reportKey === reportKey,
  );

  return {
    layoutVersion: REPORT_LAYOUT_VERSION,
    companyName: REPORT_LAYOUT_COMPANY_NAME,
    systemName: REPORT_LAYOUT_SYSTEM_NAME,
    departmentName: REPORT_LAYOUT_DEPARTMENT_NAME,
    standard,
  };
};

const getReportExportFormatStandardsFromDB = () => ({
  layoutVersion: REPORT_LAYOUT_VERSION,
  mimeTypes: {
    csv: "text/csv; charset=utf-8",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
  },
  fileNaming: {
    pattern: "<Report-Title>-<Period>-<Payment-Mode-if-any>.<extension>",
    rule: "Use sanitized filename parts with hyphen separators.",
  },
  excel: {
    titleRows: [
      "Company name",
      "Department/system name",
      "Report title and period",
      "Summary line and generated timestamp",
    ],
    tableHeaderRow: 6,
    freezeHeaderRow: true,
    print: {
      paperSize: "A4",
      fitToWidth: 1,
      fitToHeight: 0,
    },
  },
  pdf: {
    header: ["Company name", "Department/system name", "Report title and period"],
    footer: ["Prepared By", "Checked By", "Approved By"],
    defaultOrientation: "landscape",
  },
});

export const ReportLayoutStandardServices = {
  getReportLayoutStandardsFromDB,
  getSingleReportLayoutStandardFromDB,
  getReportExportFormatStandardsFromDB,
};

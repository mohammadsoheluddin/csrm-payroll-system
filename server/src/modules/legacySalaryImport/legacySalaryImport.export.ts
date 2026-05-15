import {
  addStandardExcelRows,
  buildCsvBuffer,
  createStandardWorkbook,
  REPORT_MIME_TYPES,
  sanitizeReportFileNamePart,
  setupStandardExcelWorksheet,
  type TReportColumnDefinition,
} from "../../utils/reportLayout";
import { LegacySalaryRecord } from "./legacySalaryImport.model";
import type {
  TLegacySalaryExportFileResult,
  TLegacySalaryRecordQuery,
} from "./legacySalaryImport.interface";

const legacySalaryColumns: TReportColumnDefinition[] = [
  { header: "SL", key: "rowNo", width: 8, type: "number", align: "center" },
  { header: "Employee ID", key: "employeeId", width: 16 },
  { header: "Office ID", key: "officeId", width: 16 },
  { header: "Employee Name", key: "employeeName", width: 30 },
  { header: "Department", key: "departmentName", width: 24 },
  { header: "Designation", key: "designationName", width: 24 },
  { header: "Gross", key: "grossAmount", width: 14, type: "amount" },
  { header: "Basic", key: "basicAmount", width: 14, type: "amount" },
  { header: "OT", key: "overtimeAmount", width: 14, type: "amount" },
  { header: "Tiffin", key: "tiffinAmount", width: 14, type: "amount" },
  { header: "Bank", key: "bankAmount", width: 14, type: "amount" },
  { header: "Cash", key: "cashAmount", width: 14, type: "amount" },
  { header: "Mobile", key: "mobileBankAmount", width: 14, type: "amount" },
  { header: "AIT", key: "aitAmount", width: 14, type: "amount" },
  { header: "Loan", key: "loanAmount", width: 14, type: "amount" },
  { header: "Deduction", key: "totalDeductionAmount", width: 14, type: "amount" },
  { header: "Net", key: "netAmount", width: 14, type: "amount" },
  { header: "Payable", key: "payableAmount", width: 14, type: "amount" },
  { header: "Status", key: "status", width: 18 },
];

const buildRecordFilter = (query: TLegacySalaryRecordQuery = {}) => {
  const filter: Record<string, unknown> = {};

  if (query.batch) filter.batch = query.batch;
  if (query.payrollMonth) filter.payrollMonth = query.payrollMonth;
  if (query.month) filter.month = query.month;
  if (query.year) filter.year = query.year;
  if (query.company) filter.company = query.company;
  if (query.employeeId) filter.employeeId = { $regex: query.employeeId, $options: "i" };
  if (query.officeId) filter.officeId = { $regex: query.officeId, $options: "i" };
  if (query.employeeName) filter.employeeName = { $regex: query.employeeName, $options: "i" };
  if (query.departmentName) filter.departmentName = { $regex: query.departmentName, $options: "i" };
  if (query.status) filter.status = query.status;

  return filter;
};

const normalizeRecord = (record: Record<string, unknown>) => ({
  rowNo: record.rowNo,
  employeeId: record.employeeId || "",
  officeId: record.officeId || "",
  employeeName: record.employeeName || "",
  departmentName: record.departmentName || "",
  designationName: record.designationName || "",
  grossAmount: Number(record.grossAmount || 0),
  basicAmount: Number(record.basicAmount || 0),
  overtimeAmount: Number(record.overtimeAmount || 0),
  tiffinAmount: Number(record.tiffinAmount || 0),
  bankAmount: Number(record.bankAmount || 0),
  cashAmount: Number(record.cashAmount || 0),
  mobileBankAmount: Number(record.mobileBankAmount || 0),
  aitAmount: Number(record.aitAmount || 0),
  loanAmount: Number(record.loanAmount || 0),
  totalDeductionAmount: Number(record.totalDeductionAmount || 0),
  netAmount: Number(record.netAmount || 0),
  payableAmount: Number(record.payableAmount || 0),
  status: record.status || "",
});

const getFileBaseName = (query: TLegacySalaryRecordQuery = {}) =>
  sanitizeReportFileNamePart(
    `Legacy-Salary-Archive-${query.payrollMonth || `${query.year || "All"}-${query.month || "All"}`}`,
  );

const getExportRows = async (query: TLegacySalaryRecordQuery = {}) => {
  const records = await LegacySalaryRecord.find(buildRecordFilter(query))
    .sort({ year: -1, month: -1, rowNo: 1 })
    .limit(20000)
    .lean();

  return records.map((record) => normalizeRecord(record as unknown as Record<string, unknown>));
};

export const generateLegacySalaryArchiveCsv = async (
  query: TLegacySalaryRecordQuery = {},
): Promise<TLegacySalaryExportFileResult> => {
  const rows = await getExportRows(query);

  return {
    buffer: buildCsvBuffer(legacySalaryColumns, rows),
    fileName: `${getFileBaseName(query)}.csv`,
    contentType: REPORT_MIME_TYPES.csv,
  };
};

export const generateLegacySalaryArchiveExcel = async (
  query: TLegacySalaryRecordQuery = {},
): Promise<TLegacySalaryExportFileResult> => {
  const rows = await getExportRows(query);
  const workbook = createStandardWorkbook();
  const worksheet = workbook.addWorksheet("Legacy Salary Archive");

  setupStandardExcelWorksheet(worksheet, legacySalaryColumns, {
    title: "Legacy Salary Sheet Archive",
    periodLabel: query.payrollMonth || "All Periods",
    subtitle: "Imported external payroll/salary sheet data. Not native payroll calculation.",
    orientation: "landscape",
  });

  addStandardExcelRows(worksheet, legacySalaryColumns, rows);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileName: `${getFileBaseName(query)}.xlsx`,
    contentType: REPORT_MIME_TYPES.excel,
  };
};

export const LEGACY_SALARY_TEMPLATE_COLUMNS = [
  "employeeIdentifier",
  "employeeId",
  "officeId",
  "cardNo",
  "employeeName",
  "companyName",
  "majorDepartmentName",
  "departmentName",
  "designationName",
  "branchName",
  "payType",
  "paymentMode",
  "grossAmount",
  "basicAmount",
  "houseRentAmount",
  "medicalAmount",
  "conveyanceAmount",
  "tiffinAmount",
  "overtimeHour",
  "overtimeRate",
  "overtimeAmount",
  "bonusAmount",
  "bankAmount",
  "cashAmount",
  "mobileBankAmount",
  "aitAmount",
  "loanAmount",
  "advanceAmount",
  "pfAmount",
  "stampAmount",
  "foodAmount",
  "totalDeductionAmount",
  "netAmount",
  "payableAmount",
  "remarks",
] as const;

export const generateLegacySalaryImportTemplateCsv = (): TLegacySalaryExportFileResult => ({
  buffer: Buffer.from(`\uFEFF${LEGACY_SALARY_TEMPLATE_COLUMNS.join(",")}\n`, "utf8"),
  fileName: "Legacy-Salary-Import-Template.csv",
  contentType: REPORT_MIME_TYPES.csv,
});

export const generateLegacySalaryImportTemplateExcel = async (): Promise<TLegacySalaryExportFileResult> => {
  const workbook = createStandardWorkbook();
  const worksheet = workbook.addWorksheet("Import Template");

  worksheet.addRow([...LEGACY_SALARY_TEMPLATE_COLUMNS]);
  worksheet.addRow([
    "EMP-1001",
    "EMP-1001",
    "OFF-1001",
    "CARD-1001",
    "Md. Example Employee",
    "CSRM",
    "Office",
    "HR & Admin",
    "Executive",
    "Head Office",
    "monthly",
    "bank",
    50000,
    30000,
    10000,
    5000,
    5000,
    0,
    0,
    0,
    0,
    0,
    45000,
    5000,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    50000,
    50000,
    "Sample row",
  ]);

  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach((column) => {
    column.width = 22;
  });
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileName: "Legacy-Salary-Import-Template.xlsx",
    contentType: REPORT_MIME_TYPES.excel,
  };
};

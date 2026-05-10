import type {
  TReportColumnDefinition,
  TReportExportFormat,
  TReportPageOrientation,
  TReportSignatureLabel,
} from "../../utils/reportLayout";

export type TReportLayoutKey =
  | "attendance_summary"
  | "leave_balance"
  | "employee_leave_ledger"
  | "salary_sheet"
  | "salary_statement"
  | "salary_bank_cash_mobile_sheet"
  | "time_bill"
  | "ot_statement"
  | "ot_bank_cash_mobile_sheet"
  | "bonus_sheet"
  | "bonus_bank_cash_mobile_sheet"
  | "import_rejection_report";

export type TReportLayoutStandardQuery = {
  reportKey?: TReportLayoutKey;
  category?: "hr" | "accounts" | "attendance" | "leave" | "salary" | "ot" | "bonus" | "import";
  format?: TReportExportFormat;
};

export type TReportLayoutPageSetup = {
  orientation: TReportPageOrientation;
  paperSize: "A4";
  excelPaperSize: number;
  fitToWidth: number;
  fitToHeight: number;
  margin: number;
};

export type TReportLayoutStandard = {
  reportKey: TReportLayoutKey;
  title: string;
  category: TReportLayoutStandardQuery["category"];
  supportedFormats: TReportExportFormat[];
  pageSetup: TReportLayoutPageSetup;
  columns: TReportColumnDefinition[];
  amountColumns: string[];
  decimalColumns: string[];
  requiredFilters: string[];
  optionalFilters: string[];
  signatures: TReportSignatureLabel[];
  notes: string[];
};

export type TReportLayoutStandardResponse = {
  layoutVersion: string;
  companyName: string;
  systemName: string;
  departmentName: string;
  standards: TReportLayoutStandard[];
};

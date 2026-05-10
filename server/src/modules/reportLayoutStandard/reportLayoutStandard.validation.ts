import { z } from "zod";

const reportLayoutKeySchema = z.enum([
  "attendance_summary",
  "leave_balance",
  "employee_leave_ledger",
  "salary_sheet",
  "salary_statement",
  "salary_bank_cash_mobile_sheet",
  "time_bill",
  "ot_statement",
  "ot_bank_cash_mobile_sheet",
  "bonus_sheet",
  "bonus_bank_cash_mobile_sheet",
  "import_rejection_report",
]);

const reportCategorySchema = z.enum([
  "hr",
  "accounts",
  "attendance",
  "leave",
  "salary",
  "ot",
  "bonus",
  "import",
]);

const reportFormatSchema = z.enum(["preview", "csv", "excel", "pdf"]);

const listQueryValidationSchema = z.object({
  query: z.object({
    reportKey: reportLayoutKeySchema.optional(),
    category: reportCategorySchema.optional(),
    format: reportFormatSchema.optional(),
  }),
});

const singleParamValidationSchema = z.object({
  params: z.object({
    reportKey: reportLayoutKeySchema,
  }),
});

export const ReportLayoutStandardValidations = {
  listQueryValidationSchema,
  singleParamValidationSchema,
};

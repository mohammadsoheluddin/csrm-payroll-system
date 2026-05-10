import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`);

const optionalObjectIdSchema = (fieldName: string) =>
  objectIdSchema(fieldName).optional();

const payrollMonthSchema = z
  .string()
  .trim()
  .regex(
    /^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/,
    "Payroll month must follow YYYY-MM format.",
  );

const queryMonthSchema = z.coerce
  .number()
  .int("Month must be an integer.")
  .min(1, "Month must be at least 1.")
  .max(12, "Month cannot exceed 12.")
  .optional();

const queryYearSchema = z.coerce
  .number()
  .int("Year must be an integer.")
  .min(2000, "Year must be at least 2000.")
  .max(2100, "Year cannot exceed 2100.")
  .optional();

const categorySchema = z
  .enum([
    "employee",
    "attendance",
    "leave",
    "salary",
    "time_bill_ot",
    "bonus",
    "payment",
    "audit_control",
  ])
  .optional();

const flowSchema = z
  .enum([
    "hr",
    "attendance",
    "leave",
    "salary",
    "ot",
    "bonus",
    "payment",
    "control",
  ])
  .optional();

const reportFormatSchema = z.enum(["preview", "csv", "excel", "pdf"]);
const paymentModeSchema = z.enum(["bank", "cash", "mobile_banking"]);

const catalogQueryValidationSchema = z.object({
  query: z.object({
    category: categorySchema,
    flow: flowSchema,
  }),
});

const baseReportQuerySchema = {
  payrollMonth: payrollMonthSchema.optional(),
  bonusMonth: payrollMonthSchema.optional(),
  month: queryMonthSchema,
  year: queryYearSchema,
  company: objectIdSchema("Company"),
  majorDepartment: optionalObjectIdSchema("Major department"),
  department: optionalObjectIdSchema("Department"),
  branch: optionalObjectIdSchema("Branch"),
  employee: optionalObjectIdSchema("Employee"),
  category: categorySchema,
  flow: flowSchema,
  paymentMode: paymentModeSchema.optional(),
};

const reportCenterQueryValidationSchema = z.object({
  query: z
    .object(baseReportQuerySchema)
    .refine((data) => Boolean(data.payrollMonth || (data.month && data.year) || data.year), {
      message: "Either payrollMonth, year, or both month and year are required.",
      path: ["payrollMonth"],
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    }),
});

const exportRouteQueryValidationSchema = z.object({
  query: z
    .object({
      ...baseReportQuerySchema,
      company: optionalObjectIdSchema("Company"),
      reportId: z.string().trim().min(1, "Report id is required."),
      format: reportFormatSchema,
      attendanceImportBatchId: optionalObjectIdSchema("Attendance import batch"),
      employeeBulkImportBatchId: optionalObjectIdSchema("Employee bulk import batch"),
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    }),
});

const savedConfigFilterSchema = z
  .object({
    payrollMonth: payrollMonthSchema.optional(),
    bonusMonth: payrollMonthSchema.optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    company: optionalObjectIdSchema("Company"),
    majorDepartment: optionalObjectIdSchema("Major department"),
    department: optionalObjectIdSchema("Department"),
    branch: optionalObjectIdSchema("Branch"),
    employee: optionalObjectIdSchema("Employee"),
    paymentMode: paymentModeSchema.optional(),
    attendanceImportBatchId: optionalObjectIdSchema("Attendance import batch"),
    employeeBulkImportBatchId: optionalObjectIdSchema("Employee bulk import batch"),
  })
  .optional();

const createSavedConfigValidationSchema = z.object({
  body: z.object({
    configName: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    reportId: z.string().trim().min(1, "Report id is required."),
    defaultFormat: reportFormatSchema.optional(),
    selectedFormats: z.array(reportFormatSchema).min(1).optional(),
    filters: savedConfigFilterSchema,
    isPinned: z.boolean().optional(),
    isShared: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateSavedConfigValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("Saved report config id"),
  }),
  body: z.object({
    configName: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    reportId: z.string().trim().min(1).optional(),
    defaultFormat: reportFormatSchema.optional(),
    selectedFormats: z.array(reportFormatSchema).min(1).optional(),
    filters: savedConfigFilterSchema,
    isPinned: z.boolean().optional(),
    isShared: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

const savedConfigListQueryValidationSchema = z.object({
  query: z.object({
    reportId: z.string().trim().min(1).optional(),
    category: categorySchema,
    flow: flowSchema,
    isPinned: z.enum(["true", "false"]).optional(),
    isActive: z.enum(["true", "false"]).optional(),
  }),
});

const savedConfigIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("Saved report config id"),
  }),
});

const savedConfigExportRouteValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("Saved report config id"),
  }),
  query: z
    .object({
      format: reportFormatSchema.optional(),
      payrollMonth: payrollMonthSchema.optional(),
      bonusMonth: payrollMonthSchema.optional(),
      month: queryMonthSchema,
      year: queryYearSchema,
      company: optionalObjectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
      paymentMode: paymentModeSchema.optional(),
      attendanceImportBatchId: optionalObjectIdSchema("Attendance import batch"),
      employeeBulkImportBatchId: optionalObjectIdSchema("Employee bulk import batch"),
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    }),
});

export const ReportCenterValidations = {
  catalogQueryValidationSchema,
  reportCenterQueryValidationSchema,
  exportRouteQueryValidationSchema,
  createSavedConfigValidationSchema,
  updateSavedConfigValidationSchema,
  savedConfigListQueryValidationSchema,
  savedConfigIdParamValidationSchema,
  savedConfigExportRouteValidationSchema,
};

import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`);

const optionalObjectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`)
    .optional();

const payrollMonthSchema = z
  .string()
  .trim()
  .regex(
    /^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/,
    "Payroll month must follow YYYY-MM format.",
  );

const monthSchema = z
  .number()
  .int("Month must be an integer.")
  .min(1, "Month must be at least 1.")
  .max(12, "Month cannot exceed 12.");

const yearSchema = z
  .number()
  .int("Year must be an integer.")
  .min(2000, "Year must be at least 2000.")
  .max(2100, "Year cannot exceed 2100.");

const noteSchema = z.string().trim().max(500).optional();

const generateOtStatementValidationSchema = z.object({
  body: z.object({
    month: monthSchema,
    year: yearSchema,
    company: objectIdSchema("Company"),
    majorDepartment: optionalObjectIdSchema("Major department"),
    department: optionalObjectIdSchema("Department"),
    branch: optionalObjectIdSchema("Branch"),
    employee: optionalObjectIdSchema("Employee"),
    overwrite: z.boolean().optional(),
    remarks: z.string().trim().max(500).optional(),
  }),
});

const otStatementActionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("OT Statement id"),
  }),
  body: z
    .object({
      note: noteSchema,
    })
    .optional(),
});

const otStatementBulkActionValidationSchema = z.object({
  body: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: monthSchema.optional(),
      year: yearSchema.optional(),
      company: objectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
      note: noteSchema,
      strict: z.boolean().optional(),
    })
    .refine((data) => Boolean(data.payrollMonth || (data.month && data.year)), {
      message: "Either payrollMonth or both month and year are required.",
      path: ["payrollMonth"],
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    })
    .refine((data) => !(data.year && !data.month), {
      message: "Month is required when year is provided.",
      path: ["month"],
    }),
});

const otStatementExportQueryValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: z.string().trim().regex(/^(0?[1-9]|1[0-2])$/, "Month must be 1-12.").optional(),
      year: z.string().trim().regex(/^(19|20|21)\d{2}$/, "Year must be valid.").optional(),
      company: objectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
    })
    .refine(
      (data) => Boolean(data.payrollMonth || (data.month && data.year)),
      {
        message: "Either payrollMonth or both month and year are required.",
        path: ["payrollMonth"],
      },
    )
    .refine(
      (data) => !(data.month && !data.year),
      {
        message: "Year is required when month is provided.",
        path: ["year"],
      },
    )
    .refine(
      (data) => !(data.year && !data.month),
      {
        message: "Month is required when year is provided.",
        path: ["month"],
      },
    ),
});

export const OtStatementValidations = {
  generateOtStatementValidationSchema,
  otStatementActionValidationSchema,
  otStatementBulkActionValidationSchema,
  otStatementExportQueryValidationSchema,
};

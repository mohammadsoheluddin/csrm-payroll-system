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

const catalogQueryValidationSchema = z.object({
  query: z.object({
    category: categorySchema,
    flow: flowSchema,
  }),
});

const reportCenterQueryValidationSchema = z.object({
  query: z
    .object({
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
    })
    .refine((data) => Boolean(data.payrollMonth || (data.month && data.year) || data.year), {
      message: "Either payrollMonth, year, or both month and year are required.",
      path: ["payrollMonth"],
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    }),
});

export const ReportCenterValidations = {
  catalogQueryValidationSchema,
  reportCenterQueryValidationSchema,
};

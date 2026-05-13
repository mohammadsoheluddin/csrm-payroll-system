import { z } from "zod";

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
  )
  .optional();

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

const groupBySchema = z
  .enum(["company", "majorDepartment", "department", "branch"])
  .optional();

const includeUnlockedSchema = z
  .enum(["true", "false"])
  .optional();

const salarySummaryQueryValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema,
      month: queryMonthSchema,
      year: queryYearSchema,
      company: optionalObjectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      groupBy: groupBySchema,
      includeUnlocked: includeUnlockedSchema,
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

export const SalarySummaryValidations = {
  salarySummaryQueryValidationSchema,
};

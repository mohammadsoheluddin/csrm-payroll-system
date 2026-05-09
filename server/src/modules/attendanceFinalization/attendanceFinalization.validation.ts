import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const positiveNumberSchema = (fieldName: string) =>
  z
    .number({ error: `${fieldName} is required` })
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be positive`);

const positiveNumberStringSchema = (fieldName: string) =>
  z.string().trim().regex(/^\d+$/, `${fieldName} must be a valid number`);

const payrollMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Payroll month must follow YYYY-MM format");

const attendanceFinalizationStatusSchema = z.enum([
  "draft",
  "finalized",
  "approved",
  "locked",
]);

const noteSchema = z
  .string()
  .trim()
  .max(500, "Note cannot exceed 500 characters");

const generateAttendanceFinalizationValidationSchema = z.object({
  body: z
    .object({
      month: positiveNumberSchema("Month"),
      year: positiveNumberSchema("Year"),
      company: objectIdSchema("company id"),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      employee: objectIdSchema("employee id").optional(),
      overwrite: z.boolean().optional(),
      remarks: noteSchema.optional(),
    })
    .strict()
    .refine(
      (data) => {
        return data.month >= 1 && data.month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        return data.year >= 2000 && data.year <= 2100;
      },
      {
        message: "Year must be between 2000 and 2100",
        path: ["year"],
      },
    ),
});

const getAllAttendanceFinalizationValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: positiveNumberStringSchema("Month").optional(),
      year: positiveNumberStringSchema("Year").optional(),
      company: objectIdSchema("company id").optional(),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      employee: objectIdSchema("employee id").optional(),
      status: attendanceFinalizationStatusSchema.optional(),
      isLocked: z.enum(["true", "false"]).optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.month && !data.year) {
          return false;
        }

        return true;
      },
      {
        message: "Year is required when month is provided",
        path: ["year"],
      },
    )
    .refine(
      (data) => {
        if (data.year && !data.month) {
          return false;
        }

        return true;
      },
      {
        message: "Month is required when year is provided",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.month) {
          return true;
        }

        const month = Number(data.month);
        return month >= 1 && month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.year) {
          return true;
        }

        const year = Number(data.year);
        return year >= 2000 && year <= 2100;
      },
      {
        message: "Year must be between 2000 and 2100",
        path: ["year"],
      },
    )
    .optional(),
});

const attendanceFinalizationIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("attendance finalization id"),
  }),
});

const attendanceFinalizationOperationalSummaryValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: positiveNumberStringSchema("Month").optional(),
      year: positiveNumberStringSchema("Year").optional(),
      company: objectIdSchema("company id"),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      employee: objectIdSchema("employee id").optional(),
    })
    .strict()
    .refine(
      (data) => {
        return Boolean(data.payrollMonth || (data.month && data.year));
      },
      {
        message: "Either payrollMonth or both month and year are required",
        path: ["payrollMonth"],
      },
    )
    .refine(
      (data) => {
        if (data.month && !data.year) {
          return false;
        }

        return true;
      },
      {
        message: "Year is required when month is provided",
        path: ["year"],
      },
    )
    .refine(
      (data) => {
        if (data.year && !data.month) {
          return false;
        }

        return true;
      },
      {
        message: "Month is required when year is provided",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.month) {
          return true;
        }

        const month = Number(data.month);
        return month >= 1 && month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.year) {
          return true;
        }

        const year = Number(data.year);
        return year >= 2000 && year <= 2100;
      },
      {
        message: "Year must be between 2000 and 2100",
        path: ["year"],
      },
    ),
});


const attendanceFinalizationBulkActionValidationSchema = z.object({
  body: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: positiveNumberSchema("Month").optional(),
      year: positiveNumberSchema("Year").optional(),
      company: objectIdSchema("company id"),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      employee: objectIdSchema("employee id").optional(),
      note: noteSchema.optional(),
      strict: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) => {
        return Boolean(data.payrollMonth || (data.month && data.year));
      },
      {
        message: "Either payrollMonth or both month and year are required",
        path: ["payrollMonth"],
      },
    )
    .refine(
      (data) => {
        if (data.month && !data.year) {
          return false;
        }

        return true;
      },
      {
        message: "Year is required when month is provided",
        path: ["year"],
      },
    )
    .refine(
      (data) => {
        if (data.year && !data.month) {
          return false;
        }

        return true;
      },
      {
        message: "Month is required when year is provided",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.month) {
          return true;
        }

        return data.month >= 1 && data.month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        if (!data.year) {
          return true;
        }

        return data.year >= 2000 && data.year <= 2100;
      },
      {
        message: "Year must be between 2000 and 2100",
        path: ["year"],
      },
    ),
});

const attendanceFinalizationActionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("attendance finalization id"),
  }),
  body: z
    .object({
      note: noteSchema.optional(),
    })
    .strict()
    .optional(),
});

export const AttendanceFinalizationValidations = {
  generateAttendanceFinalizationValidationSchema,
  getAllAttendanceFinalizationValidationSchema,
  attendanceFinalizationOperationalSummaryValidationSchema,
  attendanceFinalizationIdParamValidationSchema,
  attendanceFinalizationBulkActionValidationSchema,
  attendanceFinalizationActionValidationSchema,
};

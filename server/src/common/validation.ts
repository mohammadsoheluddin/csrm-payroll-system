import { z } from "zod";

export const VALIDATION_LIMITS = {
  SHORT_TEXT: 100,
  MEDIUM_TEXT: 250,
  LONG_TEXT: 500,
  NOTE: 1000,
  PAGE_LIMIT_MAX: 200,
  YEAR_MIN: 2000,
  YEAR_MAX: 2100,
} as const;

export const mongoObjectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = (fieldName = "id") =>
  z
    .string({ error: `${fieldName} is required` })
    .trim()
    .regex(mongoObjectIdRegex, `${fieldName} must be a valid ObjectId`);

export const optionalObjectIdSchema = (fieldName = "id") =>
  objectIdSchema(fieldName).optional();

export const idParamValidationSchema = (paramName = "id") =>
  z.object({
    params: z.object({
      [paramName]: objectIdSchema(paramName),
    }),
  });

export const requiredTrimmedStringSchema = (
  fieldName: string,
  options?: {
    min?: number;
    max?: number;
  },
) =>
  z
    .string({ error: `${fieldName} is required` })
    .trim()
    .min(options?.min ?? 1, `${fieldName} is required`)
    .max(
      options?.max ?? VALIDATION_LIMITS.MEDIUM_TEXT,
      `${fieldName} cannot exceed ${
        options?.max ?? VALIDATION_LIMITS.MEDIUM_TEXT
      } characters`,
    );

export const optionalTrimmedStringSchema = (
  fieldName: string,
  options?: {
    max?: number;
    allowEmpty?: boolean;
  },
) => {
  const schema = z
    .string()
    .trim()
    .max(
      options?.max ?? VALIDATION_LIMITS.MEDIUM_TEXT,
      `${fieldName} cannot exceed ${
        options?.max ?? VALIDATION_LIMITS.MEDIUM_TEXT
      } characters`,
    );

  return options?.allowEmpty === true
    ? schema.optional()
    : schema.min(1, `${fieldName} cannot be empty`).optional();
};

export const noteSchema = (fieldName = "Note") =>
  optionalTrimmedStringSchema(fieldName, {
    max: VALIDATION_LIMITS.NOTE,
  });

export const statusSchema = z.enum(["active", "inactive"]);

export const monthNumberSchema = z.coerce
  .number({ error: "Month is required" })
  .int("Month must be an integer")
  .min(1, "Month must be between 1 and 12")
  .max(12, "Month must be between 1 and 12");

export const yearNumberSchema = z.coerce
  .number({ error: "Year is required" })
  .int("Year must be an integer")
  .min(VALIDATION_LIMITS.YEAR_MIN, `Year must be at least ${VALIDATION_LIMITS.YEAR_MIN}`)
  .max(VALIDATION_LIMITS.YEAR_MAX, `Year cannot exceed ${VALIDATION_LIMITS.YEAR_MAX}`);

export const payrollMonthSchema = z
  .string({ error: "Payroll month is required" })
  .trim()
  .regex(/^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/, "Payroll month must follow YYYY-MM format");

const isValidDateString = (value: string) => {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const dateStringSchema = (fieldName = "Date") =>
  z
    .string({ error: `${fieldName} is required` })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldName} must follow YYYY-MM-DD format`)
    .refine((value) => isValidDateString(value), {
      message: `${fieldName} must be a valid date`,
    });

export const optionalDateStringSchema = (fieldName = "Date") =>
  dateStringSchema(fieldName).optional();

export const timeStringSchema = (fieldName = "Time") =>
  z
    .string({ error: `${fieldName} is required` })
    .trim()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      `${fieldName} must follow HH:mm 24-hour format`,
    );

export const optionalTimeStringSchema = (fieldName = "Time") =>
  timeStringSchema(fieldName).optional();

export const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const paginationQueryFields = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(VALIDATION_LIMITS.PAGE_LIMIT_MAX)
    .optional(),
};

export const sortOrderSchema = z.enum(["asc", "desc"]).optional();

export const dateRangeSchema = z
  .object({
    fromDate: optionalDateStringSchema("From date"),
    toDate: optionalDateStringSchema("To date"),
  })
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) {
        return true;
      }

      return new Date(data.fromDate).getTime() <= new Date(data.toDate).getTime();
    },
    {
      message: "From date cannot be later than to date",
      path: ["fromDate"],
    },
  );

export const createAtLeastOneFieldRefinement = (message = "At least one field is required") => ({
  message,
});

export const ensureAtLeastOneField = (data: Record<string, unknown>) =>
  Object.values(data).some((value) => value !== undefined);

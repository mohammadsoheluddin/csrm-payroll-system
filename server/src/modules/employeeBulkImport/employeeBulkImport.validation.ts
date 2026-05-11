import { z } from "zod";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const employeeBulkImportSourceSchema = z.enum([
  "excel",
  "csv",
  "manual_bulk",
  "api",
]);

const employeeStatusSchema = z.enum(["active", "inactive"]);

const employmentStatusSchema = z.enum([
  "active",
  "probation",
  "confirmed",
  "resigned",
  "terminated",
  "retired",
  "suspended",
]);

const serviceTypeSchema = z.enum([
  "permanent",
  "probation",
  "contractual",
  "temporary",
  "daily_wage",
  "intern",
]);

const payTypeSchema = z.enum(["monthly", "daily", "hourly"]);

const genderSchema = z.enum(["male", "female", "other"]);

const isValidDateString = (value: string) => {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const dateStringSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldName} must follow YYYY-MM-DD format`)
    .refine((value) => isValidDateString(value), {
      message: `${fieldName} must be a valid date`,
    });

const employeeIdSchema = z
  .string()
  .trim()
  .min(2, "Employee ID must be at least 2 characters")
  .max(30, "Employee ID cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Employee ID can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const optionalCodeSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} cannot be empty`)
    .max(30, `${fieldName} cannot exceed 30 characters`)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      `${fieldName} can contain only letters, numbers, underscore and hyphen`,
    )
    .transform((value) => value.toUpperCase())
    .optional();

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(20, "Phone number cannot exceed 20 characters")
  .regex(
    /^[+0-9][0-9\s-]{6,19}$/,
    "Phone number can contain only numbers, space, hyphen and optional plus sign",
  );

const salarySchema = z.coerce
  .number()
  .min(0, "Basic salary cannot be negative")
  .max(100000000, "Basic salary is too large");

const dutyHourPerDaySchema = z.coerce
  .number()
  .min(0, "Duty hour per day cannot be negative")
  .max(24, "Duty hour per day cannot exceed 24");

const leaveDaySchema = z.coerce
  .number()
  .min(0, "Leave day cannot be negative")
  .max(365, "Leave day cannot exceed 365");

const rawPayloadSchema = z.record(z.string(), z.unknown()).optional();

const employeeBulkImportRowSchema = z
  .object({
    rowNo: z.coerce.number().int().positive().optional(),

    employeeId: employeeIdSchema,
    officeId: optionalCodeSchema("Office ID"),
    cardNo: optionalCodeSchema("Card No"),

    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),
    middleName: z
      .string()
      .trim()
      .max(50, "Middle name cannot exceed 50 characters")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),

    email: z.string().trim().toLowerCase().email("Invalid employee email"),
    phone: phoneSchema,
    gender: genderSchema,
    dateOfBirth: dateStringSchema("Date of birth").optional(),

    company: objectIdSchema("company id"),
    majorDepartment: objectIdSchema("major department id"),
    department: objectIdSchema("department id"),
    designation: objectIdSchema("designation id"),
    branch: objectIdSchema("branch id"),

    joiningDate: dateStringSchema("Joining date"),
    confirmationDate: dateStringSchema("Confirmation date").optional(),

    serviceType: serviceTypeSchema.optional(),
    payType: payTypeSchema.optional(),
    dutyHourPerDay: dutyHourPerDaySchema.optional(),
    leaveDay: leaveDaySchema.optional(),
    employmentStatus: employmentStatusSchema.optional(),
    basicSalary: salarySchema.optional(),
    status: employeeStatusSchema.optional(),

    rawPayload: rawPayloadSchema,
  })
  .strict()
  .refine(
    (data) => {
      if (!data.confirmationDate) {
        return true;
      }

      return data.confirmationDate >= data.joiningDate;
    },
    {
      message: "Confirmation date cannot be before joining date",
      path: ["confirmationDate"],
    },
  );

const employeeBulkImportPayloadSchema = z
  .object({
    source: employeeBulkImportSourceSchema,
    rows: z
      .array(employeeBulkImportRowSchema)
      .min(1, "At least one employee import row is required")
      .max(3000, "Maximum 3000 employee import rows are allowed per request"),
    sourceFileName: z
      .string()
      .trim()
      .max(255, "Source file name cannot exceed 255 characters")
      .optional(),
    strictMode: z.boolean().optional(),
    remarks: z
      .string()
      .trim()
      .max(1000, "Remarks cannot exceed 1000 characters")
      .optional(),
  })
  .strict();

const previewEmployeeBulkImportValidationSchema = z.object({
  body: employeeBulkImportPayloadSchema,
});

const commitEmployeeBulkImportValidationSchema = z.object({
  body: employeeBulkImportPayloadSchema,
});

const getAllEmployeeBulkImportsValidationSchema = z.object({
  query: z
    .object({
      source: employeeBulkImportSourceSchema.optional(),
      status: z
        .enum(["previewed", "committed", "partial_committed", "failed"])
        .optional(),
      batchNo: z.string().trim().max(100).optional(),
      sourceFileName: z.string().trim().max(255).optional(),
      fromDate: dateStringSchema("From date").optional(),
      toDate: dateStringSchema("To date").optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(200).optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.fromDate && data.toDate) {
          return data.toDate >= data.fromDate;
        }

        return true;
      },
      {
        message: "To date cannot be earlier than from date",
        path: ["toDate"],
      },
    )
    .optional(),
});


const employeeBulkImportTemplateQueryValidationSchema = z.object({
  query: z
    .object({
      source: employeeBulkImportSourceSchema.optional(),
      includeSample: z
        .union([z.boolean(), z.enum(["true", "false"])])
        .optional(),
    })
    .strict()
    .optional(),
});


const revertEmployeeBulkImportValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee bulk import batch id"),
  }),
  body: z
    .object({
      note: z
        .string()
        .trim()
        .max(1000, "Revert note cannot exceed 1000 characters")
        .optional(),
    })
    .strict()
    .optional(),
});

const employeeBulkImportIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee bulk import batch id"),
  }),
});

const deleteEmployeeBulkImportValidationSchema = createSoftDeleteValidationSchema("id");

const restoreEmployeeBulkImportValidationSchema = createRestoreValidationSchema("id");

export const EmployeeBulkImportValidations = {
  previewEmployeeBulkImportValidationSchema,
  commitEmployeeBulkImportValidationSchema,
  getAllEmployeeBulkImportsValidationSchema,
  employeeBulkImportTemplateQueryValidationSchema,
  revertEmployeeBulkImportValidationSchema,
  employeeBulkImportIdParamValidationSchema,
  deleteEmployeeBulkImportValidationSchema,
  restoreEmployeeBulkImportValidationSchema,
};

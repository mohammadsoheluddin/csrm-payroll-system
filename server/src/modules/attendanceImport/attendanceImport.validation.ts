import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const attendanceImportSourceSchema = z.enum([
  "device",
  "excel",
  "manual_bulk",
  "api",
]);

const attendanceImportMatchBySchema = z.enum(["employeeId", "officeId", "cardNo"]);

const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "leave",
  "half-day",
  "weekend",
  "holiday",
]);

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

const timeStringSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      `${fieldName} must follow HH:mm 24-hour format`,
    );

const optionalRemarksSchema = z
  .string()
  .trim()
  .max(1000, "Remarks cannot exceed 1000 characters")
  .optional();

const rawPayloadSchema = z.record(z.string(), z.unknown()).optional();

const attendanceImportRowSchema = z
  .object({
    rowNo: z.coerce.number().int().positive().optional(),
    employeeIdentifier: z
      .string()
      .trim()
      .min(1, "Employee identifier is required")
      .max(100, "Employee identifier cannot exceed 100 characters"),
    attendanceDate: dateStringSchema("Attendance date"),
    punchTime: timeStringSchema("Punch time").optional(),
    checkInTime: timeStringSchema("Check-in time").optional(),
    checkOutTime: timeStringSchema("Check-out time").optional(),
    status: attendanceStatusSchema.optional(),
    deviceId: z
      .string()
      .trim()
      .max(100, "Device ID cannot exceed 100 characters")
      .optional(),
    remarks: z
      .string()
      .trim()
      .max(500, "Row remarks cannot exceed 500 characters")
      .optional(),
    rawPayload: rawPayloadSchema,
  })
  .strict()
  .refine(
    (data) => {
      if (data.checkInTime && data.checkOutTime) {
        return data.checkOutTime >= data.checkInTime;
      }

      return true;
    },
    {
      message: "Check-out time cannot be earlier than check-in time",
      path: ["checkOutTime"],
    },
  );

const attendanceImportPayloadSchema = z
  .object({
    source: attendanceImportSourceSchema,
    matchBy: attendanceImportMatchBySchema,
    rows: z
      .array(attendanceImportRowSchema)
      .min(1, "At least one attendance import row is required")
      .max(5000, "Maximum 5000 attendance import rows are allowed per request"),
    overwrite: z.boolean().optional(),
    company: objectIdSchema("company id").optional(),
    majorDepartment: objectIdSchema("major department id").optional(),
    department: objectIdSchema("department id").optional(),
    branch: objectIdSchema("branch id").optional(),
    deviceId: z
      .string()
      .trim()
      .max(100, "Device ID cannot exceed 100 characters")
      .optional(),
    sourceFileName: z
      .string()
      .trim()
      .max(255, "Source file name cannot exceed 255 characters")
      .optional(),
    remarks: optionalRemarksSchema,
  })
  .strict();

const previewAttendanceImportValidationSchema = z.object({
  body: attendanceImportPayloadSchema,
});

const commitAttendanceImportValidationSchema = z.object({
  body: attendanceImportPayloadSchema,
});

const getAllAttendanceImportsValidationSchema = z.object({
  query: z
    .object({
      source: attendanceImportSourceSchema.optional(),
      matchBy: attendanceImportMatchBySchema.optional(),
      status: z.enum(["committed", "failed"]).optional(),
      company: objectIdSchema("company id").optional(),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      deviceId: z.string().trim().max(100).optional(),
      batchNo: z.string().trim().max(100).optional(),
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


const booleanQuerySchema = z
  .enum(["true", "false", "1", "0", "yes", "no"])
  .optional();

const attendanceImportTemplateQueryValidationSchema = z.object({
  query: z
    .object({
      source: attendanceImportSourceSchema.optional(),
      matchBy: attendanceImportMatchBySchema.optional(),
      includeSample: booleanQuerySchema,
    })
    .strict()
    .optional(),
});

const attendanceImportIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("attendance import batch id"),
  }),
});

export const AttendanceImportValidations = {
  previewAttendanceImportValidationSchema,
  commitAttendanceImportValidationSchema,
  getAllAttendanceImportsValidationSchema,
  attendanceImportIdParamValidationSchema,
  attendanceImportTemplateQueryValidationSchema,
};

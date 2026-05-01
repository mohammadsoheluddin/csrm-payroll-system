import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "leave",
  "half-day",
  "weekend",
  "holiday",
]);

const attendanceSourceSchema = z.enum(["manual", "device", "import"]);

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

const remarksSchema = z
  .string()
  .trim()
  .max(500, "Remarks cannot exceed 500 characters");

const deviceIdSchema = z
  .string()
  .trim()
  .max(100, "Device ID cannot exceed 100 characters");

const createAttendanceValidationSchema = z.object({
  body: z
    .object({
      employee: objectIdSchema("employee id"),
      attendanceDate: dateStringSchema("Attendance date"),
      checkInTime: timeStringSchema("Check-in time").optional(),
      checkOutTime: timeStringSchema("Check-out time").optional(),
      status: attendanceStatusSchema.optional(),
      source: attendanceSourceSchema.optional(),
      remarks: remarksSchema.optional(),
      deviceId: deviceIdSchema.optional(),
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
    ),
});

const updateAttendanceValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("attendance id"),
  }),
  body: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      attendanceDate: dateStringSchema("Attendance date").optional(),
      checkInTime: timeStringSchema("Check-in time").optional(),
      checkOutTime: timeStringSchema("Check-out time").optional(),
      status: attendanceStatusSchema.optional(),
      source: attendanceSourceSchema.optional(),
      remarks: remarksSchema.optional(),
      deviceId: deviceIdSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    })
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
    ),
});

const getAllAttendanceValidationSchema = z.object({
  query: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      status: attendanceStatusSchema.optional(),
      source: attendanceSourceSchema.optional(),
      attendanceDate: dateStringSchema("Attendance date").optional(),
      fromDate: dateStringSchema("From date").optional(),
      toDate: dateStringSchema("To date").optional(),
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

const attendanceIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("attendance id"),
  }),
});

export const AttendanceValidations = {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
  getAllAttendanceValidationSchema,
  attendanceIdParamValidationSchema,
};

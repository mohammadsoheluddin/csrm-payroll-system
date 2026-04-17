import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const createAttendanceValidationSchema = z.object({
  body: z.object({
    employee: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Employee ID is required"
          : "Invalid employee ID",
    }),
    attendanceDate: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Attendance date is required"
            : "Invalid attendance date",
      })
      .regex(dateRegex, {
        error: "Attendance date must be in YYYY-MM-DD format",
      }),
    checkInTime: z
      .string()
      .regex(timeRegex, { error: "Check-in time must be in HH:mm format" })
      .optional(),
    checkOutTime: z
      .string()
      .regex(timeRegex, { error: "Check-out time must be in HH:mm format" })
      .optional(),
    status: z
      .enum(
        [
          "present",
          "absent",
          "late",
          "leave",
          "half-day",
          "weekend",
          "holiday",
        ],
        { error: "Invalid attendance status" },
      )
      .optional(),
    source: z
      .enum(["manual", "device", "import"], {
        error: "Invalid attendance source",
      })
      .optional(),
    remarks: z.string().optional(),
    deviceId: z.string().optional(),
  }),
});

const updateAttendanceValidationSchema = z.object({
  body: z.object({
    employee: z.string().optional(),
    attendanceDate: z
      .string()
      .regex(dateRegex, {
        error: "Attendance date must be in YYYY-MM-DD format",
      })
      .optional(),
    checkInTime: z
      .string()
      .regex(timeRegex, { error: "Check-in time must be in HH:mm format" })
      .optional(),
    checkOutTime: z
      .string()
      .regex(timeRegex, { error: "Check-out time must be in HH:mm format" })
      .optional(),
    status: z
      .enum(
        [
          "present",
          "absent",
          "late",
          "leave",
          "half-day",
          "weekend",
          "holiday",
        ],
        { error: "Invalid attendance status" },
      )
      .optional(),
    source: z
      .enum(["manual", "device", "import"], {
        error: "Invalid attendance source",
      })
      .optional(),
    remarks: z.string().optional(),
    deviceId: z.string().optional(),
  }),
});

export const AttendanceValidations = {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
};

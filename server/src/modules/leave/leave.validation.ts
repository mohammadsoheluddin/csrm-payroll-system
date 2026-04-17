import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createLeaveValidationSchema = z.object({
  body: z.object({
    employee: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Employee ID is required"
          : "Invalid employee ID",
    }),
    leaveType: z.enum(
      [
        "casual",
        "sick",
        "earned",
        "unpaid",
        "maternity",
        "paternity",
        "official",
        "others",
      ],
      {
        error: "Invalid leave type",
      },
    ),
    startDate: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Start date is required"
            : "Invalid start date",
      })
      .regex(dateRegex, { error: "Start date must be in YYYY-MM-DD format" }),
    endDate: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "End date is required"
            : "Invalid end date",
      })
      .regex(dateRegex, { error: "End date must be in YYYY-MM-DD format" }),
    totalDays: z.number({
      error: (issue) =>
        issue.input === undefined
          ? "Total days is required"
          : "Invalid total days",
    }),
    reason: z.string({
      error: (issue) =>
        issue.input === undefined ? "Reason is required" : "Invalid reason",
    }),
    status: z
      .enum(["pending", "approved", "rejected", "cancelled"], {
        error: "Invalid leave status",
      })
      .optional(),
    approvedBy: z.string().optional(),
    approvalNote: z.string().optional(),
  }),
});

const updateLeaveValidationSchema = z.object({
  body: z.object({
    employee: z.string().optional(),
    leaveType: z
      .enum(
        [
          "casual",
          "sick",
          "earned",
          "unpaid",
          "maternity",
          "paternity",
          "official",
          "others",
        ],
        {
          error: "Invalid leave type",
        },
      )
      .optional(),
    startDate: z
      .string()
      .regex(dateRegex, { error: "Start date must be in YYYY-MM-DD format" })
      .optional(),
    endDate: z
      .string()
      .regex(dateRegex, { error: "End date must be in YYYY-MM-DD format" })
      .optional(),
    totalDays: z.number().optional(),
    reason: z.string().optional(),
    status: z
      .enum(["pending", "approved", "rejected", "cancelled"], {
        error: "Invalid leave status",
      })
      .optional(),
    approvedBy: z.string().optional(),
    approvalNote: z.string().optional(),
  }),
});

export const LeaveValidations = {
  createLeaveValidationSchema,
  updateLeaveValidationSchema,
};

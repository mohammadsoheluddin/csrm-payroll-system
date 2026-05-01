import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const leaveTypeSchema = z.enum([
  "casual",
  "sick",
  "earned",
  "unpaid",
  "maternity",
  "paternity",
  "official",
  "others",
]);

const leaveStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

const leaveApprovalStatusSchema = z.enum(["approved", "rejected", "cancelled"]);

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

const reasonSchema = z
  .string()
  .trim()
  .min(3, "Reason must be at least 3 characters")
  .max(500, "Reason cannot exceed 500 characters");

const approvalNoteSchema = z
  .string()
  .trim()
  .max(500, "Approval note cannot exceed 500 characters");

const createLeaveValidationSchema = z.object({
  body: z
    .object({
      employee: objectIdSchema("employee id"),
      leaveType: leaveTypeSchema,
      startDate: dateStringSchema("Start date"),
      endDate: dateStringSchema("End date"),
      reason: reasonSchema,
      status: leaveStatusSchema.optional(),
      approvedBy: objectIdSchema("approved by user id").optional(),
      approvalNote: approvalNoteSchema.optional(),
    })
    .strict()
    .refine((data) => data.endDate >= data.startDate, {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    }),
});

const updateLeaveValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("leave id"),
  }),
  body: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      leaveType: leaveTypeSchema.optional(),
      startDate: dateStringSchema("Start date").optional(),
      endDate: dateStringSchema("End date").optional(),
      reason: reasonSchema.optional(),
      status: leaveStatusSchema.optional(),
      approvedBy: objectIdSchema("approved by user id").optional(),
      approvalNote: approvalNoteSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate >= data.startDate;
        }

        return true;
      },
      {
        message: "End date cannot be earlier than start date",
        path: ["endDate"],
      },
    ),
});

const approveLeaveValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("leave id"),
  }),
  body: z
    .object({
      status: leaveApprovalStatusSchema,
      approvedBy: objectIdSchema("approved by user id").optional(),
      approvalNote: approvalNoteSchema.optional(),
    })
    .strict(),
});

const getAllLeaveValidationSchema = z.object({
  query: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      approvedBy: objectIdSchema("approved by user id").optional(),
      leaveType: leaveTypeSchema.optional(),
      status: leaveStatusSchema.optional(),
      startDate: dateStringSchema("Start date").optional(),
      endDate: dateStringSchema("End date").optional(),
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

const leaveIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("leave id"),
  }),
});

export const LeaveValidations = {
  createLeaveValidationSchema,
  updateLeaveValidationSchema,
  approveLeaveValidationSchema,
  getAllLeaveValidationSchema,
  leaveIdParamValidationSchema,
};

import { z } from "zod";
import {
  LEAVE_APPROVAL_STATUSES,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  MANAGEMENT_CONTROLLED_LEAVE_TYPES,
  REPLACEMENT_LEAVE_TYPE,
} from "./leave.constant";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const leaveTypeSchema = z.enum(LEAVE_TYPES);
const leaveStatusSchema = z.enum(LEAVE_STATUSES);
const leaveApprovalStatusSchema = z.enum(LEAVE_APPROVAL_STATUSES);

const isManagementControlledLeaveType = (leaveType?: string) => {
  if (!leaveType) {
    return false;
  }

  return (MANAGEMENT_CONTROLLED_LEAVE_TYPES as readonly string[]).includes(
    leaveType,
  );
};

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

const managementApprovalNoteSchema = z
  .string()
  .trim()
  .max(500, "Management approval note cannot exceed 500 characters");

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
      isManagementApproved: z.boolean().optional(),
      managementApprovalNote: managementApprovalNoteSchema.optional(),
      replacementForDate: dateStringSchema("Replacement for date").optional(),
    })
    .strict()
    .refine((data) => data.endDate >= data.startDate, {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    })
    .refine(
      (data) => {
        if (!isManagementControlledLeaveType(data.leaveType)) {
          return true;
        }

        return data.isManagementApproved === true;
      },
      {
        message:
          "Management approval is required for paid, unpaid or others leave",
        path: ["isManagementApproved"],
      },
    )
    .refine(
      (data) => {
        if (!isManagementControlledLeaveType(data.leaveType)) {
          return true;
        }

        return Boolean(data.managementApprovalNote?.trim());
      },
      {
        message:
          "Management approval note is required for paid, unpaid or others leave",
        path: ["managementApprovalNote"],
      },
    )
    .refine(
      (data) => {
        if (data.leaveType !== REPLACEMENT_LEAVE_TYPE) {
          return true;
        }

        return Boolean(data.replacementForDate);
      },
      {
        message: "Replacement for date is required for replacement leave",
        path: ["replacementForDate"],
      },
    )
    .refine(
      (data) => {
        if (data.leaveType !== REPLACEMENT_LEAVE_TYPE) {
          return true;
        }

        return data.startDate === data.endDate;
      },
      {
        message: "Replacement leave must be created for one day at a time",
        path: ["endDate"],
      },
    )
    .refine(
      (data) => {
        if (data.leaveType === REPLACEMENT_LEAVE_TYPE) {
          return true;
        }

        return !data.replacementForDate;
      },
      {
        message: "Replacement for date is allowed only for replacement leave",
        path: ["replacementForDate"],
      },
    ),
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
      isManagementApproved: z.boolean().optional(),
      managementApprovalNote: managementApprovalNoteSchema.optional(),
      replacementForDate: dateStringSchema("Replacement for date").optional(),
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
    )
    .refine(
      (data) => {
        if (!isManagementControlledLeaveType(data.leaveType)) {
          return true;
        }

        return data.isManagementApproved === true;
      },
      {
        message:
          "Management approval is required for paid, unpaid or others leave",
        path: ["isManagementApproved"],
      },
    )
    .refine(
      (data) => {
        if (!isManagementControlledLeaveType(data.leaveType)) {
          return true;
        }

        return Boolean(data.managementApprovalNote?.trim());
      },
      {
        message:
          "Management approval note is required for paid, unpaid or others leave",
        path: ["managementApprovalNote"],
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
      replacementForDate: dateStringSchema("Replacement for date").optional(),
      isManagementApproved: z.enum(["true", "false"]).optional(),
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

const leaveBalanceValidationSchema = z.object({
  params: z.object({
    employeeId: objectIdSchema("employee id"),
  }),
  query: z
    .object({
      year: z
        .string()
        .trim()
        .regex(/^\d{4}$/, "Year must follow YYYY format")
        .optional(),
    })
    .strict()
    .optional(),
});

export const LeaveValidations = {
  createLeaveValidationSchema,
  updateLeaveValidationSchema,
  approveLeaveValidationSchema,
  getAllLeaveValidationSchema,
  leaveIdParamValidationSchema,
  leaveBalanceValidationSchema,
};

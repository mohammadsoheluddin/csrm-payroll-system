import { z } from "zod";

const monthRegex = /^\d{4}-\d{2}$/;

const createPayrollValidationSchema = z.object({
  body: z.object({
    employee: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Employee ID is required"
          : "Invalid employee ID",
    }),
    payrollMonth: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Payroll month is required"
            : "Invalid payroll month",
      })
      .regex(monthRegex, { error: "Payroll month must be in YYYY-MM format" }),
    remarks: z.string().optional(),
  }),
});

const updatePayrollValidationSchema = z.object({
  body: z.object({
    status: z
      .enum(["draft", "generated", "paid"], {
        error: "Invalid payroll status",
      })
      .optional(),
    remarks: z.string().optional(),
  }),
});

export const PayrollValidations = {
  createPayrollValidationSchema,
  updatePayrollValidationSchema,
};

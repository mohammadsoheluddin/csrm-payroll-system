import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createSalaryStructureValidationSchema = z.object({
  body: z.object({
    employee: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Employee ID is required"
          : "Invalid employee ID",
    }),
    basicSalary: z.number({
      error: (issue) =>
        issue.input === undefined
          ? "Basic salary is required"
          : "Invalid basic salary",
    }),
    houseRent: z.number().optional(),
    medicalAllowance: z.number().optional(),
    transportAllowance: z.number().optional(),
    otherAllowance: z.number().optional(),
    taxDeduction: z.number().optional(),
    providentFund: z.number().optional(),
    loanDeduction: z.number().optional(),
    otherDeduction: z.number().optional(),
    effectiveFrom: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Effective from date is required"
            : "Invalid effective date",
      })
      .regex(dateRegex, {
        error: "Effective from must be in YYYY-MM-DD format",
      }),
    remarks: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateSalaryStructureValidationSchema = z.object({
  body: z.object({
    employee: z.string().optional(),
    basicSalary: z.number().optional(),
    houseRent: z.number().optional(),
    medicalAllowance: z.number().optional(),
    transportAllowance: z.number().optional(),
    otherAllowance: z.number().optional(),
    taxDeduction: z.number().optional(),
    providentFund: z.number().optional(),
    loanDeduction: z.number().optional(),
    otherDeduction: z.number().optional(),
    effectiveFrom: z
      .string()
      .regex(dateRegex, {
        error: "Effective from must be in YYYY-MM-DD format",
      })
      .optional(),
    remarks: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const SalaryStructureValidations = {
  createSalaryStructureValidationSchema,
  updateSalaryStructureValidationSchema,
};

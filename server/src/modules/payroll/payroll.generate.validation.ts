import { z } from "zod";

const generateMonthlyPayrollValidationSchema = z.object({
  body: z.object({
    month: z
      .number()
      .min(1, "Month must be at least 1.")
      .max(12, "Month cannot exceed 12."),

    year: z.number().min(2000, "Year must be at least 2000."),

    company: z.string().min(1, "Company is required."),
  }),
});

export const PayrollGenerateValidation = {
  generateMonthlyPayrollValidationSchema,
};

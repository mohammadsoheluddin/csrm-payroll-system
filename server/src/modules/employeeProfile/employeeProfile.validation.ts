import { z } from "zod";

const employeeReferenceSchema = z
  .string()
  .trim()
  .min(1, "Employee reference is required")
  .max(80, "Employee reference cannot exceed 80 characters");

const positiveIntegerStringSchema = (fieldName: string, max = 100) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${fieldName} must be a positive number`)
    .refine((value) => Number(value) > 0 && Number(value) <= max, {
      message: `${fieldName} must be between 1 and ${max}`,
    })
    .optional();

const getEmployeeProfileValidationSchema = z.object({
  params: z.object({
    employeeRef: employeeReferenceSchema,
  }),
  query: z
    .object({
      year: z
        .string()
        .trim()
        .regex(/^\d{4}$/, "Year must follow YYYY format")
        .optional(),
      payrollMonth: z
        .string()
        .trim()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Payroll month must follow YYYY-MM format")
        .optional(),
      historyLimit: positiveIntegerStringSchema("History limit", 36),
      movementLimit: positiveIntegerStringSchema("Movement limit", 50),
      legacyLimit: positiveIntegerStringSchema("Legacy limit", 100),
    })
    .strict()
    .optional(),
});

export const EmployeeProfileValidations = {
  getEmployeeProfileValidationSchema,
};

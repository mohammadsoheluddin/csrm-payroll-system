import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`);

const optionalObjectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`)
    .optional();

const generateTimeBillValidationSchema = z.object({
  body: z.object({
    month: z
      .number()
      .int("Month must be an integer.")
      .min(1, "Month must be at least 1.")
      .max(12, "Month cannot exceed 12."),
    year: z
      .number()
      .int("Year must be an integer.")
      .min(2000, "Year must be at least 2000.")
      .max(2100, "Year cannot exceed 2100."),
    company: objectIdSchema("Company"),
    majorDepartment: optionalObjectIdSchema("Major department"),
    department: optionalObjectIdSchema("Department"),
    branch: optionalObjectIdSchema("Branch"),
    employee: optionalObjectIdSchema("Employee"),
    tiffinRate: z
      .number()
      .min(0, "Tiffin rate cannot be negative.")
      .optional(),
    overwrite: z.boolean().optional(),
    remarks: z.string().trim().max(500).optional(),
  }),
});

const timeBillActionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("Time bill id"),
  }),
  body: z
    .object({
      note: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export const TimeBillValidations = {
  generateTimeBillValidationSchema,
  timeBillActionValidationSchema,
};

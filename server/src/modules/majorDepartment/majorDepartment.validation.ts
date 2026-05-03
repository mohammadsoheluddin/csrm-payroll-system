import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const majorDepartmentStatusSchema = z.enum(["active", "inactive"]);

const majorDepartmentCodeSchema = z
  .string()
  .trim()
  .min(2, "Major department code must be at least 2 characters")
  .max(30, "Major department code cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Major department code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const createMajorDepartmentValidationSchema = z.object({
  body: z
    .object({
      company: objectIdSchema("company id"),
      name: z
        .string()
        .trim()
        .min(2, "Major department name must be at least 2 characters")
        .max(120, "Major department name cannot exceed 120 characters"),
      code: majorDepartmentCodeSchema,
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
      sortOrder: z.coerce
        .number()
        .int("Sort order must be an integer")
        .min(0, "Sort order cannot be negative")
        .optional(),
      status: majorDepartmentStatusSchema.optional(),
    })
    .strict(),
});

const updateMajorDepartmentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("major department id"),
  }),
  body: z
    .object({
      company: objectIdSchema("company id").optional(),
      name: z
        .string()
        .trim()
        .min(2, "Major department name must be at least 2 characters")
        .max(120, "Major department name cannot exceed 120 characters")
        .optional(),
      code: majorDepartmentCodeSchema.optional(),
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
      sortOrder: z.coerce
        .number()
        .int("Sort order must be an integer")
        .min(0, "Sort order cannot be negative")
        .optional(),
      status: majorDepartmentStatusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllMajorDepartmentsValidationSchema = z.object({
  query: z
    .object({
      company: objectIdSchema("company id").optional(),
      status: majorDepartmentStatusSchema.optional(),
    })
    .strict()
    .optional(),
});

const majorDepartmentIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("major department id"),
  }),
});

export const MajorDepartmentValidations = {
  createMajorDepartmentValidationSchema,
  updateMajorDepartmentValidationSchema,
  getAllMajorDepartmentsValidationSchema,
  majorDepartmentIdParamValidationSchema,
};

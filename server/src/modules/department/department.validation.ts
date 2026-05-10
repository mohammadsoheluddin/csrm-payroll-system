import {
  createRestoreValidationSchema,
  createSoftDeleteValidationSchema,
} from "../../common/softDelete";
import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const departmentStatusSchema = z.enum(["active", "inactive"]);

const departmentCodeSchema = z
  .string()
  .trim()
  .min(2, "Department code must be at least 2 characters")
  .max(30, "Department code cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Department code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const createDepartmentValidationSchema = z.object({
  body: z
    .object({
      company: objectIdSchema("company id"),
      majorDepartment: objectIdSchema("major department id"),
      name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(120, "Department name cannot exceed 120 characters"),
      code: departmentCodeSchema,
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
      status: departmentStatusSchema.optional(),
    })
    .strict(),
});

const updateDepartmentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("department id"),
  }),
  body: z
    .object({
      company: objectIdSchema("company id").optional(),
      majorDepartment: objectIdSchema("major department id").optional(),
      name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(120, "Department name cannot exceed 120 characters")
        .optional(),
      code: departmentCodeSchema.optional(),
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
      status: departmentStatusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllDepartmentsValidationSchema = z.object({
  query: z
    .object({
      company: objectIdSchema("company id").optional(),
      majorDepartment: objectIdSchema("major department id").optional(),
      status: departmentStatusSchema.optional(),
    })
    .strict()
    .optional(),
});

const departmentIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("department id"),
  }),
});

const deleteDepartmentValidationSchema = createSoftDeleteValidationSchema("id");
const restoreDepartmentValidationSchema = createRestoreValidationSchema("id");

export const DepartmentValidations = {
  createDepartmentValidationSchema,
  updateDepartmentValidationSchema,
  getAllDepartmentsValidationSchema,
  departmentIdValidationSchema,
  deleteDepartmentValidationSchema,
  restoreDepartmentValidationSchema,
};

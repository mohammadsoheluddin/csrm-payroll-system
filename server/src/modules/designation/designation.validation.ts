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

const designationStatusSchema = z.enum(["active", "inactive"]);

const designationCategorySchema = z.enum([
  "management",
  "officer",
  "staff",
  "worker",
  "technical",
  "security",
  "driver",
  "sales",
  "other",
]);

const designationCodeSchema = z
  .string()
  .trim()
  .min(2, "Designation code must be at least 2 characters")
  .max(50, "Designation code cannot exceed 50 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Designation code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const createDesignationValidationSchema = z.object({
  body: z
    .object({
      company: objectIdSchema("company id"),
      name: z
        .string()
        .trim()
        .min(2, "Designation name must be at least 2 characters")
        .max(120, "Designation name cannot exceed 120 characters"),
      code: designationCodeSchema,
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      category: designationCategorySchema.optional(),
      gradeLevel: z.coerce
        .number()
        .int("Grade level must be an integer")
        .min(0, "Grade level cannot be negative")
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
      status: designationStatusSchema.optional(),
    })
    .strict(),
});

const updateDesignationValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("designation id"),
  }),
  body: z
    .object({
      company: objectIdSchema("company id").optional(),
      name: z
        .string()
        .trim()
        .min(2, "Designation name must be at least 2 characters")
        .max(120, "Designation name cannot exceed 120 characters")
        .optional(),
      code: designationCodeSchema.optional(),
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      category: designationCategorySchema.optional(),
      gradeLevel: z.coerce
        .number()
        .int("Grade level must be an integer")
        .min(0, "Grade level cannot be negative")
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
      status: designationStatusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllDesignationsValidationSchema = z.object({
  query: z
    .object({
      company: objectIdSchema("company id").optional(),
      category: designationCategorySchema.optional(),
      status: designationStatusSchema.optional(),
    })
    .strict()
    .optional(),
});

const designationIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("designation id"),
  }),
});

const deleteDesignationValidationSchema = createSoftDeleteValidationSchema("id");
const restoreDesignationValidationSchema = createRestoreValidationSchema("id");

export const DesignationValidations = {
  createDesignationValidationSchema,
  updateDesignationValidationSchema,
  getAllDesignationsValidationSchema,
  designationIdParamValidationSchema,
  deleteDesignationValidationSchema,
  restoreDesignationValidationSchema,
};

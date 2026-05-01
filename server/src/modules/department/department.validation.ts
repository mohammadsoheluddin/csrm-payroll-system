import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid department id");

const departmentStatusSchema = z.enum(["active", "inactive"]);

const departmentCodeSchema = z
  .string()
  .trim()
  .min(2, "Department code must be at least 2 characters")
  .max(20, "Department code cannot exceed 20 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Department code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const createDepartmentValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters"),
      code: departmentCodeSchema,
      status: departmentStatusSchema.optional(),
    })
    .strict(),
});

const updateDepartmentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters")
        .optional(),
      code: departmentCodeSchema.optional(),
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
      status: departmentStatusSchema.optional(),
    })
    .strict()
    .optional(),
});

const departmentIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const DepartmentValidations = {
  createDepartmentValidationSchema,
  updateDepartmentValidationSchema,
  getAllDepartmentsValidationSchema,
  departmentIdValidationSchema,
};

import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid branch id");

const branchStatusSchema = z.enum(["active", "inactive"]);

const branchCodeSchema = z
  .string()
  .trim()
  .min(2, "Branch code must be at least 2 characters")
  .max(20, "Branch code cannot exceed 20 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Branch code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const createBranchValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Branch name must be at least 2 characters")
        .max(100, "Branch name cannot exceed 100 characters"),
      code: branchCodeSchema,
      address: z
        .string()
        .trim()
        .min(2, "Branch address must be at least 2 characters")
        .max(300, "Branch address cannot exceed 300 characters"),
      status: branchStatusSchema.optional(),
    })
    .strict(),
});

const updateBranchValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Branch name must be at least 2 characters")
        .max(100, "Branch name cannot exceed 100 characters")
        .optional(),
      code: branchCodeSchema.optional(),
      address: z
        .string()
        .trim()
        .min(2, "Branch address must be at least 2 characters")
        .max(300, "Branch address cannot exceed 300 characters")
        .optional(),
      status: branchStatusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllBranchesValidationSchema = z.object({
  query: z
    .object({
      status: branchStatusSchema.optional(),
    })
    .strict()
    .optional(),
});

const branchIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const BranchValidations = {
  createBranchValidationSchema,
  updateBranchValidationSchema,
  getAllBranchesValidationSchema,
  branchIdValidationSchema,
};

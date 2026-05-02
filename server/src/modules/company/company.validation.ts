import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const companyStatusSchema = z.enum(["active", "inactive"]);

const companyTypeSchema = z.enum([
  "company",
  "concern",
  "sister_concern",
  "unit",
  "project",
]);

const companyCodeSchema = z
  .string()
  .trim()
  .min(2, "Company code must be at least 2 characters")
  .max(30, "Company code cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Company code can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(30, "Phone number cannot exceed 30 characters")
  .regex(
    /^[+0-9][0-9\s-]{6,29}$/,
    "Phone number can contain only numbers, space, hyphen and optional plus sign",
  );

const createCompanyValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name cannot exceed 150 characters"),
      code: companyCodeSchema,
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      legalName: z
        .string()
        .trim()
        .min(2, "Legal name must be at least 2 characters")
        .max(200, "Legal name cannot exceed 200 characters")
        .optional(),
      type: companyTypeSchema.optional(),
      parentCompany: objectIdSchema("parent company id").optional(),
      isPrimary: z.boolean().optional(),
      address: z
        .string()
        .trim()
        .max(500, "Address cannot exceed 500 characters")
        .optional(),
      phone: phoneSchema.optional(),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid company email")
        .optional(),
      website: z.string().trim().url("Invalid website URL").optional(),
      tin: z
        .string()
        .trim()
        .max(50, "TIN cannot exceed 50 characters")
        .optional(),
      bin: z
        .string()
        .trim()
        .max(50, "BIN cannot exceed 50 characters")
        .optional(),
      registrationNo: z
        .string()
        .trim()
        .max(100, "Registration number cannot exceed 100 characters")
        .optional(),
      logoUrl: z.string().trim().url("Invalid logo URL").optional(),
      status: companyStatusSchema.optional(),
      notes: z
        .string()
        .trim()
        .max(1000, "Notes cannot exceed 1000 characters")
        .optional(),
    })
    .strict(),
});

const updateCompanyValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("company id"),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name cannot exceed 150 characters")
        .optional(),
      code: companyCodeSchema.optional(),
      shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name cannot exceed 50 characters")
        .optional(),
      legalName: z
        .string()
        .trim()
        .min(2, "Legal name must be at least 2 characters")
        .max(200, "Legal name cannot exceed 200 characters")
        .optional(),
      type: companyTypeSchema.optional(),
      parentCompany: objectIdSchema("parent company id").optional(),
      isPrimary: z.boolean().optional(),
      address: z
        .string()
        .trim()
        .max(500, "Address cannot exceed 500 characters")
        .optional(),
      phone: phoneSchema.optional(),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid company email")
        .optional(),
      website: z.string().trim().url("Invalid website URL").optional(),
      tin: z
        .string()
        .trim()
        .max(50, "TIN cannot exceed 50 characters")
        .optional(),
      bin: z
        .string()
        .trim()
        .max(50, "BIN cannot exceed 50 characters")
        .optional(),
      registrationNo: z
        .string()
        .trim()
        .max(100, "Registration number cannot exceed 100 characters")
        .optional(),
      logoUrl: z.string().trim().url("Invalid logo URL").optional(),
      status: companyStatusSchema.optional(),
      notes: z
        .string()
        .trim()
        .max(1000, "Notes cannot exceed 1000 characters")
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllCompaniesValidationSchema = z.object({
  query: z
    .object({
      status: companyStatusSchema.optional(),
      type: companyTypeSchema.optional(),
      parentCompany: objectIdSchema("parent company id").optional(),
      isPrimary: z.enum(["true", "false"]).optional(),
    })
    .strict()
    .optional(),
});

const companyIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("company id"),
  }),
});

export const CompanyValidations = {
  createCompanyValidationSchema,
  updateCompanyValidationSchema,
  getAllCompaniesValidationSchema,
  companyIdParamValidationSchema,
};

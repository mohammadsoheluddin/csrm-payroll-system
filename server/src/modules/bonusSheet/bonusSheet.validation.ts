import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`);

const optionalObjectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`)
    .optional();

const bonusMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Bonus month must be YYYY-MM.");

const bonusTypeSchema = z.enum([
  "eid",
  "puja",
  "festival",
  "attendance",
  "production",
  "special_incentive",
  "other",
]);

const calculationBasisSchema = z.enum([
  "gross_salary",
  "basic_salary",
  "percentage_of_gross",
  "percentage_of_basic",
  "fixed_amount",
]);

const generateBonusSheetValidationSchema = z.object({
  body: z
    .object({
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1900).max(2100),
      company: objectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
      bonusName: z.string().trim().min(1, "Bonus name is required."),
      bonusType: bonusTypeSchema,
      calculationBasis: calculationBasisSchema,
      bonusPercentage: z.number().min(0).max(1000).optional(),
      fixedAmount: z.number().min(0).optional(),
      minimumServiceDays: z.number().int().min(0).optional(),
      includeProbation: z.boolean().optional(),
      overwrite: z.boolean().optional(),
      remarks: z.string().trim().optional(),
    })
    .refine(
      (data) =>
        ![
          "percentage_of_gross",
          "percentage_of_basic",
        ].includes(data.calculationBasis) || Number(data.bonusPercentage || 0) > 0,
      {
        message: "Bonus percentage is required for percentage based bonus.",
        path: ["bonusPercentage"],
      },
    )
    .refine(
      (data) =>
        data.calculationBasis !== "fixed_amount" ||
        Number(data.fixedAmount || 0) > 0,
      {
        message: "Fixed amount is required for fixed amount bonus.",
        path: ["fixedAmount"],
      },
    ),
});

const bonusSheetActionValidationSchema = z.object({
  body: z.object({
    note: z.string().trim().optional(),
  }),
});

const bonusSheetBulkActionValidationSchema = z.object({
  body: z
    .object({
      bonusMonth: bonusMonthSchema.optional(),
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().min(1900).max(2100).optional(),
      company: objectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
      bonusName: z.string().trim().optional(),
      bonusType: bonusTypeSchema.optional(),
      note: z.string().trim().optional(),
      strict: z.boolean().optional(),
    })
    .refine((data) => Boolean(data.bonusMonth || (data.month && data.year)), {
      message: "Either bonusMonth or both month and year are required.",
      path: ["bonusMonth"],
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    })
    .refine((data) => !(data.year && !data.month), {
      message: "Month is required when year is provided.",
      path: ["month"],
    }),
});

const bonusSheetSummaryQueryValidationSchema = z.object({
  query: z
    .object({
      bonusMonth: bonusMonthSchema.optional(),
      month: z
        .string()
        .trim()
        .regex(/^(0?[1-9]|1[0-2])$/, "Month must be 1-12.")
        .optional(),
      year: z
        .string()
        .trim()
        .regex(/^(19|20|21)\d{2}$/, "Year must be valid.")
        .optional(),
      company: objectIdSchema("Company"),
      majorDepartment: optionalObjectIdSchema("Major department"),
      department: optionalObjectIdSchema("Department"),
      branch: optionalObjectIdSchema("Branch"),
      employee: optionalObjectIdSchema("Employee"),
      bonusName: z.string().trim().optional(),
      bonusType: bonusTypeSchema.optional(),
    })
    .refine((data) => Boolean(data.bonusMonth || (data.month && data.year)), {
      message: "Either bonusMonth or both month and year are required.",
      path: ["bonusMonth"],
    })
    .refine((data) => !(data.month && !data.year), {
      message: "Year is required when month is provided.",
      path: ["year"],
    })
    .refine((data) => !(data.year && !data.month), {
      message: "Month is required when year is provided.",
      path: ["month"],
    }),
});

export const BonusSheetValidations = {
  generateBonusSheetValidationSchema,
  bonusSheetActionValidationSchema,
  bonusSheetBulkActionValidationSchema,
  bonusSheetSummaryQueryValidationSchema,
};

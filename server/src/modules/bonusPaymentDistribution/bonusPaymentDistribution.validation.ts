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

const bonusTypeSchema = z
  .enum([
    "eid",
    "puja",
    "festival",
    "attendance",
    "production",
    "special_incentive",
    "other",
  ])
  .optional();

const paymentModeSchema = z.enum(["bank", "cash", "mobile_banking"]).optional();

const monthlyBodyBaseSchema = z
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
    bonusType: bonusTypeSchema,
    paymentMode: paymentModeSchema,
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
  });

const generateBonusPaymentDistributionValidationSchema = z.object({
  body: monthlyBodyBaseSchema.extend({
    overwrite: z.boolean().optional(),
    allowCashFallback: z.boolean().optional(),
    remarks: z.string().trim().optional(),
  }),
});

const bonusPaymentDistributionActionValidationSchema = z.object({
  body: z.object({
    note: z.string().trim().optional(),
  }),
});

const bonusPaymentDistributionBulkActionValidationSchema = z.object({
  body: monthlyBodyBaseSchema.extend({
    note: z.string().trim().optional(),
    strict: z.boolean().optional(),
  }),
});

const bonusPaymentDistributionSummaryQueryValidationSchema = z.object({
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
      bonusType: bonusTypeSchema,
      paymentMode: paymentModeSchema,
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

const bonusPaymentDistributionExportQueryValidationSchema = z.object({
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
      bonusType: bonusTypeSchema,
      paymentMode: z.enum(["bank", "cash", "mobile_banking"]),
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

export const BonusPaymentDistributionValidations = {
  generateBonusPaymentDistributionValidationSchema,
  bonusPaymentDistributionActionValidationSchema,
  bonusPaymentDistributionBulkActionValidationSchema,
  bonusPaymentDistributionSummaryQueryValidationSchema,
  bonusPaymentDistributionExportQueryValidationSchema,
};

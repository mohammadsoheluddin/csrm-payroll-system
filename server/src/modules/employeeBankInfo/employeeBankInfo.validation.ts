import { z } from "zod";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const statusSchema = z.enum(["active", "inactive"]);

const paymentModeSchema = z.enum(["bank", "cash", "mobile_banking"]);

const mobileBankingProviderSchema = z.enum([
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "other",
]);

const isValidDateString = (value: string) => {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const dateStringSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldName} must follow YYYY-MM-DD format`)
    .refine((value) => isValidDateString(value), {
      message: `${fieldName} must be a valid date`,
    });

const optionalTextSchema = (fieldName: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} cannot be empty`)
    .max(max, `${fieldName} cannot exceed ${max} characters`)
    .optional();

const optionalCodeSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} cannot be empty`)
    .max(50, `${fieldName} cannot exceed 50 characters`)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      `${fieldName} can contain only letters, numbers, underscore and hyphen`,
    )
    .transform((value) => value.toUpperCase())
    .optional();

const accountNoSchema = z
  .string()
  .trim()
  .min(4, "Account no must be at least 4 characters")
  .max(40, "Account no cannot exceed 40 characters")
  .regex(
    /^[A-Za-z0-9-]+$/,
    "Account no can contain only letters, numbers and hyphen",
  )
  .optional();

const mobileNoSchema = z
  .string()
  .trim()
  .min(7, "Mobile banking no must be at least 7 characters")
  .max(20, "Mobile banking no cannot exceed 20 characters")
  .regex(
    /^[+0-9][0-9\s-]{6,19}$/,
    "Mobile banking no can contain only numbers, space, hyphen and optional plus sign",
  )
  .optional();

const routingNoSchema = z
  .string()
  .trim()
  .min(3, "Routing no must be at least 3 characters")
  .max(30, "Routing no cannot exceed 30 characters")
  .regex(/^[0-9-]+$/, "Routing no can contain only numbers and hyphen")
  .optional();

const createEmployeeBankInfoValidationSchema = z.object({
  body: z
    .object({
      employee: objectIdSchema("employee id"),
      company: objectIdSchema("company id"),

      accountName: optionalTextSchema("Account name", 120),
      bankName: optionalTextSchema("Bank name", 120),
      bankBranchName: optionalTextSchema("Bank branch name", 120),
      bankBranchCode: optionalCodeSchema("Bank branch code"),
      accountNo: accountNoSchema,
      processBankBranchNo: optionalCodeSchema("Process bank branch no"),
      routingNo: routingNoSchema,

      paymentMode: paymentModeSchema,

      mobileBankingProvider: mobileBankingProviderSchema.optional(),
      mobileBankingNo: mobileNoSchema,

      cashPayReason: optionalTextSchema("Cash pay reason", 300),

      effectiveFrom: dateStringSchema("Effective from"),
      effectiveTo: dateStringSchema("Effective to").optional(),

      isPrimary: z.boolean().optional(),
      status: statusSchema.optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (!data.effectiveTo) {
          return true;
        }

        return new Date(data.effectiveTo) >= new Date(data.effectiveFrom);
      },
      {
        message: "Effective to cannot be before effective from",
      },
    ),
});

const updateEmployeeBankInfoValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee bank info id"),
  }),
  body: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      company: objectIdSchema("company id").optional(),

      accountName: optionalTextSchema("Account name", 120),
      bankName: optionalTextSchema("Bank name", 120),
      bankBranchName: optionalTextSchema("Bank branch name", 120),
      bankBranchCode: optionalCodeSchema("Bank branch code"),
      accountNo: accountNoSchema,
      processBankBranchNo: optionalCodeSchema("Process bank branch no"),
      routingNo: routingNoSchema,

      paymentMode: paymentModeSchema.optional(),

      mobileBankingProvider: mobileBankingProviderSchema.optional(),
      mobileBankingNo: mobileNoSchema,

      cashPayReason: optionalTextSchema("Cash pay reason", 300),

      effectiveFrom: dateStringSchema("Effective from").optional(),
      effectiveTo: dateStringSchema("Effective to").optional(),

      isPrimary: z.boolean().optional(),
      status: statusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllEmployeeBankInfosValidationSchema = z.object({
  query: z
    .object({
      employee: objectIdSchema("employee id").optional(),
      company: objectIdSchema("company id").optional(),
      paymentMode: paymentModeSchema.optional(),
      status: statusSchema.optional(),
      isPrimary: z.enum(["true", "false"]).optional(),
    })
    .strict()
    .optional(),
});

const employeeBankInfoIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee bank info id"),
  }),
});

const deleteEmployeeBankInfoValidationSchema = createSoftDeleteValidationSchema("id");

const restoreEmployeeBankInfoValidationSchema = createRestoreValidationSchema("id");

export const EmployeeBankInfoValidations = {
  createEmployeeBankInfoValidationSchema,
  updateEmployeeBankInfoValidationSchema,
  getAllEmployeeBankInfosValidationSchema,
  employeeBankInfoIdParamValidationSchema,
  deleteEmployeeBankInfoValidationSchema,
  restoreEmployeeBankInfoValidationSchema,
};

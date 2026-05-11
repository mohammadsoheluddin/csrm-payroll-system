import { z } from "zod";
import {
  idParamValidationSchema,
  noteSchema,
  objectIdSchema,
  optionalTrimmedStringSchema,
  requiredTrimmedStringSchema,
  statusSchema,
} from "../../common/validation";

const accountTypeSchema = z.enum([
  "salary",
  "ot",
  "bonus",
  "general",
  "tada",
  "allowance",
]);

const currencySchema = z
  .string()
  .trim()
  .length(3, "Currency must be a 3-letter code")
  .transform((value) => value.toUpperCase())
  .optional();

const routingNoSchema = optionalTrimmedStringSchema("Routing no", { max: 50 });
const swiftCodeSchema = optionalTrimmedStringSchema("SWIFT code", { max: 50 });

const createCompanyBankAccountValidationSchema = z.object({
  body: z
    .object({
      company: objectIdSchema("company id"),
      accountName: requiredTrimmedStringSchema("Account name", {
        min: 2,
        max: 150,
      }),
      bankName: requiredTrimmedStringSchema("Bank name", {
        min: 2,
        max: 150,
      }),
      branchName: requiredTrimmedStringSchema("Branch name", {
        min: 2,
        max: 150,
      }),
      branchCode: requiredTrimmedStringSchema("Branch code", {
        min: 1,
        max: 50,
      }),
      routingNo: routingNoSchema,
      swiftCode: swiftCodeSchema,
      accountNo: requiredTrimmedStringSchema("Account no", {
        min: 3,
        max: 80,
      }),
      processBankBranchNo: requiredTrimmedStringSchema(
        "Process bank branch no",
        {
          min: 1,
          max: 80,
        },
      ),
      accountType: accountTypeSchema,
      currency: currencySchema,
      remarks: noteSchema("Remarks"),
      isPrimary: z.boolean().optional(),
      status: statusSchema.optional(),
    })
    .strict(),
});

const updateCompanyBankAccountValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("company bank account id"),
  }),
  body: z
    .object({
      company: objectIdSchema("company id").optional(),
      accountName: requiredTrimmedStringSchema("Account name", {
        min: 2,
        max: 150,
      }).optional(),
      bankName: requiredTrimmedStringSchema("Bank name", {
        min: 2,
        max: 150,
      }).optional(),
      branchName: requiredTrimmedStringSchema("Branch name", {
        min: 2,
        max: 150,
      }).optional(),
      branchCode: requiredTrimmedStringSchema("Branch code", {
        min: 1,
        max: 50,
      }).optional(),
      routingNo: routingNoSchema,
      swiftCode: swiftCodeSchema,
      accountNo: requiredTrimmedStringSchema("Account no", {
        min: 3,
        max: 80,
      }).optional(),
      processBankBranchNo: requiredTrimmedStringSchema(
        "Process bank branch no",
        {
          min: 1,
          max: 80,
        },
      ).optional(),
      accountType: accountTypeSchema.optional(),
      currency: currencySchema,
      remarks: noteSchema("Remarks"),
      isPrimary: z.boolean().optional(),
      status: statusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: "At least one field is required for update",
    }),
});

const getAllCompanyBankAccountsValidationSchema = z.object({
  query: z
    .object({
      company: objectIdSchema("company id").optional(),
      accountType: accountTypeSchema.optional(),
      status: statusSchema.optional(),
    })
    .strict()
    .optional(),
});

const companyBankAccountIdValidationSchema = idParamValidationSchema("id");

export const CompanyBankAccountValidations = {
  createCompanyBankAccountValidationSchema,
  updateCompanyBankAccountValidationSchema,
  getAllCompanyBankAccountsValidationSchema,
  companyBankAccountIdValidationSchema,
};

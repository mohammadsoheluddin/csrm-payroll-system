import { z } from "zod";

const createCompanyBankAccountValidationSchema = z.object({
  body: z.object({
    company: z.string(),

    accountName: z.string(),

    bankName: z.string(),

    branchName: z.string(),

    branchCode: z.string(),

    routingNo: z.string().optional(),

    swiftCode: z.string().optional(),

    accountNo: z.string(),

    processBankBranchNo: z.string(),

    accountType: z.enum([
      "salary",
      "ot",
      "bonus",
      "general",
      "tada",
      "allowance",
    ]),

    currency: z.string().optional(),

    remarks: z.string().optional(),

    isPrimary: z.boolean().optional(),

    status: z.enum(["active", "inactive"]).optional(),
  }),
});

const updateCompanyBankAccountValidationSchema = z.object({
  body: z.object({
    company: z.string().optional(),

    accountName: z.string().optional(),

    bankName: z.string().optional(),

    branchName: z.string().optional(),

    branchCode: z.string().optional(),

    routingNo: z.string().optional(),

    swiftCode: z.string().optional(),

    accountNo: z.string().optional(),

    processBankBranchNo: z.string().optional(),

    accountType: z
      .enum(["salary", "ot", "bonus", "general", "tada", "allowance"])
      .optional(),

    currency: z.string().optional(),

    remarks: z.string().optional(),

    isPrimary: z.boolean().optional(),

    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const CompanyBankAccountValidations = {
  createCompanyBankAccountValidationSchema,
  updateCompanyBankAccountValidationSchema,
};

import { z } from "zod";
import {
  BANK_SHEET_PAYMENT_MODES,
  BANK_SHEET_SOURCE_TYPES,
} from "./bankSheet.constants";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const positiveNumberStringSchema = (fieldName: string) =>
  z.string().trim().regex(/^\d+$/, `${fieldName} must be a valid number`);

const bankSheetSourceTypeSchema = z.enum(BANK_SHEET_SOURCE_TYPES);
const bankSheetPaymentModeSchema = z.enum(BANK_SHEET_PAYMENT_MODES);

const generateBankSheetPreviewValidationSchema = z.object({
  query: z
    .object({
      sourceType: bankSheetSourceTypeSchema.optional(),
      month: positiveNumberStringSchema("Month"),
      year: positiveNumberStringSchema("Year"),
      company: objectIdSchema("company id"),
      department: objectIdSchema("department id").optional(),
      branch: objectIdSchema("branch id").optional(),
      bankName: z
        .string()
        .trim()
        .min(1, "Bank name cannot be empty")
        .max(120, "Bank name cannot exceed 120 characters")
        .optional(),
      paymentMode: bankSheetPaymentModeSchema.optional(),
    })
    .strict()
    .refine(
      (data) => {
        const month = Number(data.month);
        return month >= 1 && month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
        path: ["month"],
      },
    )
    .refine(
      (data) => {
        const year = Number(data.year);
        return year >= 2000 && year <= 2100;
      },
      {
        message: "Year must be between 2000 and 2100",
        path: ["year"],
      },
    ),
});

export const BankSheetValidations = {
  generateBankSheetPreviewValidationSchema,
};

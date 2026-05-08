import { z } from "zod";

const getAllBankSheetHistoryValidationSchema = z.object({
  query: z.object({
    payrollMonth: z.string().optional(),
    exportType: z.string().optional(),
  }),
});

export const BankSheetHistoryValidations = {
  getAllBankSheetHistoryValidationSchema,
};

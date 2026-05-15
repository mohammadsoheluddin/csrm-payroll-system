import { z } from "zod";
import {
  createRestoreValidationSchema,
  createSoftDeleteValidationSchema,
} from "../../common/softDelete";
import {
  objectIdSchema,
  optionalObjectIdSchema,
  payrollMonthSchema,
  paginationQueryFields,
} from "../../common/validation";

const sourceSchema = z.enum([
  "old_payroll_software",
  "current_payroll_software",
  "manual_excel",
  "other",
]);

const sheetTypeSchema = z.enum([
  "salary",
  "wages",
  "salary_and_wages",
  "ot",
  "bonus",
  "mixed",
]);

const matchBySchema = z.enum(["employeeId", "officeId", "cardNo", "name"]);

const recordStatusSchema = z.enum([
  "matched",
  "unmatched",
  "duplicate_identifier",
  "invalid",
]);

const paymentModeSchema = z.enum(["bank", "cash", "mobile", "mixed", "unknown"]);

const optionalText = (max = 255) =>
  z.string().trim().max(max, `Text cannot exceed ${max} characters`).optional();

const optionalAmount = z.coerce.number().finite().min(0).optional();

const rawPayloadSchema = z.record(z.string(), z.unknown()).optional();

const legacySalaryImportRowSchema = z
  .object({
    rowNo: z.coerce.number().int().positive().optional(),
    employeeIdentifier: optionalText(120),
    employeeId: optionalText(120),
    officeId: optionalText(120),
    cardNo: optionalText(120),
    employeeName: optionalText(255),
    companyName: optionalText(255),
    majorDepartmentName: optionalText(255),
    departmentName: optionalText(255),
    designationName: optionalText(255),
    branchName: optionalText(255),
    payType: optionalText(100),
    paymentMode: paymentModeSchema.or(z.string().trim().max(100)).optional(),
    grossAmount: optionalAmount,
    basicAmount: optionalAmount,
    houseRentAmount: optionalAmount,
    medicalAmount: optionalAmount,
    conveyanceAmount: optionalAmount,
    tiffinAmount: optionalAmount,
    overtimeHour: optionalAmount,
    overtimeRate: optionalAmount,
    overtimeAmount: optionalAmount,
    bonusAmount: optionalAmount,
    otherAllowanceAmount: optionalAmount,
    bankAmount: optionalAmount,
    cashAmount: optionalAmount,
    mobileBankAmount: optionalAmount,
    aitAmount: optionalAmount,
    loanAmount: optionalAmount,
    advanceAmount: optionalAmount,
    pfAmount: optionalAmount,
    stampAmount: optionalAmount,
    foodAmount: optionalAmount,
    absentDeductionAmount: optionalAmount,
    leaveDeductionAmount: optionalAmount,
    otherDeductionAmount: optionalAmount,
    totalDeductionAmount: optionalAmount,
    netAmount: optionalAmount,
    payableAmount: optionalAmount,
    remarks: optionalText(500),
    rawPayload: rawPayloadSchema,
  })
  .strict();

const legacySalaryImportPayloadSchema = z
  .object({
    source: sourceSchema,
    sheetType: sheetTypeSchema,
    payrollMonth: payrollMonthSchema,
    company: optionalObjectIdSchema("company id"),
    sourceFileName: optionalText(255),
    sourceSheetName: optionalText(255),
    matchBy: matchBySchema.optional().default("employeeId"),
    remarks: optionalText(1000),
    rows: z
      .array(legacySalaryImportRowSchema)
      .min(1, "At least one legacy salary row is required")
      .max(10000, "Maximum 10000 rows are allowed per import batch"),
  })
  .strict();

const previewLegacySalaryImportValidationSchema = z.object({
  body: legacySalaryImportPayloadSchema,
});

const commitLegacySalaryImportValidationSchema = z.object({
  body: legacySalaryImportPayloadSchema,
});

const parseExcelValidationSchema = z.object({
  body: z
    .object({
      fileName: z.string({ error: "File name is required" }).trim().min(1).max(255),
      fileBase64: z.string({ error: "File base64 is required" }).trim().min(1),
      sheetName: optionalText(255),
      headerRow: z.coerce.number().int().positive().max(100).optional(),
      dataStartRow: z.coerce.number().int().positive().max(101).optional(),
      maxRows: z.coerce.number().int().positive().max(10000).optional(),
    })
    .strict(),
});

const getAllLegacySalaryImportBatchesValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: z.coerce.number().int().min(1).max(12).optional(),
      year: z.coerce.number().int().min(2000).max(2100).optional(),
      company: optionalObjectIdSchema("company id"),
      source: sourceSchema.optional(),
      sheetType: sheetTypeSchema.optional(),
      status: z.enum(["committed", "archived", "deleted"]).optional(),
      batchNo: optionalText(100),
      fromMonth: payrollMonthSchema.optional(),
      toMonth: payrollMonthSchema.optional(),
      ...paginationQueryFields,
    })
    .strict()
    .optional(),
});

const getLegacySalaryRecordsValidationSchema = z.object({
  query: z
    .object({
      batch: optionalObjectIdSchema("batch id"),
      payrollMonth: payrollMonthSchema.optional(),
      month: z.coerce.number().int().min(1).max(12).optional(),
      year: z.coerce.number().int().min(2000).max(2100).optional(),
      company: optionalObjectIdSchema("company id"),
      employee: optionalObjectIdSchema("employee id"),
      employeeId: optionalText(120),
      officeId: optionalText(120),
      cardNo: optionalText(120),
      employeeName: optionalText(255),
      departmentName: optionalText(255),
      status: recordStatusSchema.optional(),
      ...paginationQueryFields,
    })
    .strict()
    .optional(),
});

const getLegacySalarySummaryValidationSchema = z.object({
  query: z
    .object({
      payrollMonth: payrollMonthSchema.optional(),
      month: z.coerce.number().int().min(1).max(12).optional(),
      year: z.coerce.number().int().min(2000).max(2100).optional(),
      company: optionalObjectIdSchema("company id"),
      groupBy: z
        .enum(["department", "majorDepartment", "company", "sheetType", "status"])
        .optional(),
    })
    .strict()
    .optional(),
});

const legacySalaryImportIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("legacy salary import batch id"),
  }),
});

const deleteLegacySalaryImportValidationSchema = createSoftDeleteValidationSchema("id");
const restoreLegacySalaryImportValidationSchema = createRestoreValidationSchema("id");

export const LegacySalaryImportValidations = {
  previewLegacySalaryImportValidationSchema,
  commitLegacySalaryImportValidationSchema,
  parseExcelValidationSchema,
  getAllLegacySalaryImportBatchesValidationSchema,
  getLegacySalaryRecordsValidationSchema,
  getLegacySalarySummaryValidationSchema,
  legacySalaryImportIdParamValidationSchema,
  deleteLegacySalaryImportValidationSchema,
  restoreLegacySalaryImportValidationSchema,
};

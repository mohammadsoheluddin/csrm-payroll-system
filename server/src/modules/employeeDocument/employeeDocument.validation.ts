import { z } from "zod";
import {
  createRestoreValidationSchema,
  createSoftDeleteValidationSchema,
} from "../../common/softDelete";
import {
  dateRangeSchema,
  dateStringSchema,
  ensureAtLeastOneField,
  objectIdSchema,
  optionalDateStringSchema,
  optionalTrimmedStringSchema,
  VALIDATION_LIMITS,
} from "../../common/validation";
import {
  EMPLOYEE_DOCUMENT_CATEGORIES,
  EMPLOYEE_DOCUMENT_CONFIDENTIALITIES,
  EMPLOYEE_DOCUMENT_STATUSES,
  EMPLOYEE_DOCUMENT_STORAGE_PROVIDERS,
} from "./employeeDocument.model";

const employeeDocumentCategorySchema = z.enum(EMPLOYEE_DOCUMENT_CATEGORIES);
const employeeDocumentStatusSchema = z.enum(EMPLOYEE_DOCUMENT_STATUSES);
const employeeDocumentConfidentialitySchema = z.enum(
  EMPLOYEE_DOCUMENT_CONFIDENTIALITIES,
);
const employeeDocumentStorageProviderSchema = z.enum(
  EMPLOYEE_DOCUMENT_STORAGE_PROVIDERS,
);

const titleSchema = z
  .string({ error: "Document title is required" })
  .trim()
  .min(1, "Document title is required")
  .max(180, "Document title cannot exceed 180 characters");

const fileNameSchema = z
  .string({ error: "File name is required" })
  .trim()
  .min(1, "File name is required")
  .max(255, "File name cannot exceed 255 characters");

const optionalFileNameSchema = z
  .string()
  .trim()
  .min(1, "File name cannot be empty")
  .max(255, "File name cannot exceed 255 characters")
  .optional();

const fileUrlSchema = z
  .string()
  .trim()
  .max(1000, "File URL cannot exceed 1000 characters")
  .optional();

const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Tag cannot be empty")
      .max(40, "Tag cannot exceed 40 characters"),
  )
  .max(20, "Maximum 20 tags are allowed")
  .optional();

const hasValidIssueExpiryOrder = (data: {
  issueDate?: string;
  expiryDate?: string;
}) => {
  if (!data.issueDate || !data.expiryDate) {
    return true;
  }

  return new Date(data.issueDate).getTime() <= new Date(data.expiryDate).getTime();
};

const issueExpiryValidationMessage = {
  message: "Issue date cannot be later than expiry date",
  path: ["expiryDate"],
};

const employeeDocumentBodyShape = {
  employee: objectIdSchema("employee id"),
  company: objectIdSchema("company id"),

  category: employeeDocumentCategorySchema,
  title: titleSchema,
  documentNo: optionalTrimmedStringSchema("Document no", {
    max: 80,
  }).transform((value) => value?.toUpperCase()),
  issuingAuthority: optionalTrimmedStringSchema("Issuing authority", {
    max: 180,
  }),
  issueDate: optionalDateStringSchema("Issue date"),
  expiryDate: optionalDateStringSchema("Expiry date"),

  fileName: fileNameSchema,
  originalFileName: optionalFileNameSchema,
  fileExtension: optionalTrimmedStringSchema("File extension", {
    max: 20,
  }).transform((value) => value?.toLowerCase()),
  mimeType: optionalTrimmedStringSchema("MIME type", {
    max: 120,
  }).transform((value) => value?.toLowerCase()),
  fileSize: z.coerce
    .number()
    .int("File size must be an integer")
    .min(0, "File size cannot be negative")
    .optional(),
  fileUrl: fileUrlSchema,
  storageProvider: employeeDocumentStorageProviderSchema,
  storagePath: optionalTrimmedStringSchema("Storage path", {
    max: 1000,
  }),
  checksum: optionalTrimmedStringSchema("Checksum", {
    max: 160,
  }),

  confidentiality: employeeDocumentConfidentialitySchema,
  status: employeeDocumentStatusSchema,

  remarks: optionalTrimmedStringSchema("Remarks", {
    max: VALIDATION_LIMITS.NOTE,
  }),
  tags: tagsSchema,
};

const createEmployeeDocumentBodySchema = z
  .object({
    ...employeeDocumentBodyShape,
    storageProvider: employeeDocumentStorageProviderSchema.default("pending"),
    confidentiality: employeeDocumentConfidentialitySchema.default(
      "confidential",
    ),
    status: employeeDocumentStatusSchema.default("pending"),
  })
  .strict()
  .refine(hasValidIssueExpiryOrder, issueExpiryValidationMessage);

const updateEmployeeDocumentBodySchema = z
  .object(employeeDocumentBodyShape)
  .partial()
  .strict()
  .refine(ensureAtLeastOneField, {
    message: "At least one field is required for update",
  })
  .refine(hasValidIssueExpiryOrder, issueExpiryValidationMessage);


const uploadEmployeeDocumentFileValidationSchema = z.object({
  query: z
    .object({
      employee: objectIdSchema("employee id"),
      company: objectIdSchema("company id"),
      category: employeeDocumentCategorySchema,
      title: titleSchema,
      documentNo: optionalTrimmedStringSchema("Document no", {
        max: 80,
      }),
      issuingAuthority: optionalTrimmedStringSchema("Issuing authority", {
        max: 180,
      }),
      issueDate: optionalDateStringSchema("Issue date"),
      expiryDate: optionalDateStringSchema("Expiry date"),
      confidentiality: employeeDocumentConfidentialitySchema.optional(),
      status: z.enum(["pending", "archived"]).optional(),
      remarks: optionalTrimmedStringSchema("Remarks", {
        max: VALIDATION_LIMITS.NOTE,
      }),
      tags: optionalTrimmedStringSchema("Tags", {
        max: 500,
      }),
    })
    .strict()
    .refine(hasValidIssueExpiryOrder, issueExpiryValidationMessage),
});

const downloadEmployeeDocumentFileValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee document id"),
  }),
});

const createEmployeeDocumentValidationSchema = z.object({
  body: createEmployeeDocumentBodySchema,
});

const updateEmployeeDocumentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee document id"),
  }),
  body: updateEmployeeDocumentBodySchema,
});

const getAllEmployeeDocumentsValidationSchema = z.object({
  query: dateRangeSchema
    .extend({
      employee: objectIdSchema("employee id").optional(),
      company: objectIdSchema("company id").optional(),
      category: employeeDocumentCategorySchema.optional(),
      status: employeeDocumentStatusSchema.optional(),
      confidentiality: employeeDocumentConfidentialitySchema.optional(),
      storageProvider: employeeDocumentStorageProviderSchema.optional(),
      expiryStatus: z
        .enum(["expired", "expiring_soon", "valid", "no_expiry"])
        .optional(),
      searchTerm: optionalTrimmedStringSchema("Search term", { max: 120 }),
    })
    .strict()
    .optional(),
});

const employeeDocumentIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee document id"),
  }),
});

const employeeDocumentEmployeeParamValidationSchema = z.object({
  params: z.object({
    employeeId: objectIdSchema("employee id"),
  }),
  query: z
    .object({
      category: employeeDocumentCategorySchema.optional(),
      status: employeeDocumentStatusSchema.optional(),
      includeDeleted: z.enum(["true", "false"]).optional(),
    })
    .strict()
    .optional(),
});

const verifyEmployeeDocumentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee document id"),
  }),
  body: z
    .object({
      verificationRemarks: optionalTrimmedStringSchema(
        "Verification remarks",
        { max: VALIDATION_LIMITS.NOTE },
      ),
    })
    .strict()
    .optional()
    .default({}),
});

const rejectEmployeeDocumentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee document id"),
  }),
  body: z
    .object({
      rejectionReason: z
        .string({ error: "Rejection reason is required" })
        .trim()
        .min(1, "Rejection reason is required")
        .max(VALIDATION_LIMITS.NOTE, "Rejection reason is too long"),
    })
    .strict(),
});

const deleteEmployeeDocumentValidationSchema = createSoftDeleteValidationSchema("id");
const restoreEmployeeDocumentValidationSchema = createRestoreValidationSchema("id");

const expiringEmployeeDocumentsValidationSchema = z.object({
  query: z
    .object({
      company: objectIdSchema("company id").optional(),
      days: z.coerce
        .number()
        .int("Days must be an integer")
        .min(1, "Days must be at least 1")
        .max(365, "Days cannot exceed 365")
        .optional(),
      asOfDate: dateStringSchema("As of date").optional(),
    })
    .strict()
    .optional(),
});

export const EmployeeDocumentValidations = {
  createEmployeeDocumentValidationSchema,
  updateEmployeeDocumentValidationSchema,
  getAllEmployeeDocumentsValidationSchema,
  employeeDocumentIdParamValidationSchema,
  employeeDocumentEmployeeParamValidationSchema,
  verifyEmployeeDocumentValidationSchema,
  rejectEmployeeDocumentValidationSchema,
  deleteEmployeeDocumentValidationSchema,
  restoreEmployeeDocumentValidationSchema,
  expiringEmployeeDocumentsValidationSchema,
  uploadEmployeeDocumentFileValidationSchema,
  downloadEmployeeDocumentFileValidationSchema,
};

import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ObjectId.`);

const optionalStringSchema = z.string().trim().min(1).optional();
const optionalDateSchema = z.string().trim().min(1).optional();

const booleanStringSchema = z.enum(["true", "false"]).optional();

const paginationQuerySchema = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

const auditLogRiskLevelSchema = z
  .enum(["low", "medium", "high", "critical"])
  .optional();

const auditLogCategorySchema = z
  .enum([
    "authentication",
    "authorization",
    "data_access",
    "data_mutation",
    "approval",
    "lock_control",
    "export",
    "payroll_process",
    "system",
    "general",
  ])
  .optional();

const auditLogSortBySchema = z
  .enum([
    "createdAt",
    "updatedAt",
    "module",
    "action",
    "actorRole",
    "actorEmail",
    "entityName",
    "ipAddress",
    "deviceType",
    "riskLevel",
    "category",
  ])
  .optional();

const auditLogSortOrderSchema = z.enum(["asc", "desc"]).optional();

const dateRangeRefinement = (data: { fromDate?: string; toDate?: string }) => {
  if (!data.fromDate || !data.toDate) {
    return true;
  }

  return new Date(data.fromDate).getTime() <= new Date(data.toDate).getTime();
};

const auditLogQueryValidationSchema = z.object({
  query: z
    .object({
      module: optionalStringSchema,
      action: optionalStringSchema,
      riskLevel: auditLogRiskLevelSchema,
      category: auditLogCategorySchema,
      actorId: optionalStringSchema,
      actorName: optionalStringSchema,
      actorEmail: optionalStringSchema,
      actorRole: optionalStringSchema,
      entityId: optionalStringSchema,
      entityName: optionalStringSchema,
      requestId: optionalStringSchema,
      requestMethod: optionalStringSchema,
      requestPath: optionalStringSchema,
      ipAddress: optionalStringSchema,
      networkType: optionalStringSchema,
      deviceType: optionalStringSchema,
      browser: optionalStringSchema,
      operatingSystem: optionalStringSchema,
      clientName: optionalStringSchema,
      clientId: optionalStringSchema,
      sessionId: optionalStringSchema,
      searchTerm: optionalStringSchema,
      fromDate: optionalDateSchema,
      toDate: optionalDateSchema,
      includeData: booleanStringSchema,
      sensitiveOnly: booleanStringSchema,
      hasPreviousData: booleanStringSchema,
      hasNewData: booleanStringSchema,
      hasMetadata: booleanStringSchema,
      sortBy: auditLogSortBySchema,
      sortOrder: auditLogSortOrderSchema,
      ...paginationQuerySchema,
    })
    .refine(dateRangeRefinement, {
      message: "fromDate cannot be after toDate.",
      path: ["fromDate"],
    }),
});

const auditLogSummaryQueryValidationSchema = z.object({
  query: z
    .object({
      module: optionalStringSchema,
      action: optionalStringSchema,
      riskLevel: auditLogRiskLevelSchema,
      category: auditLogCategorySchema,
      actorRole: optionalStringSchema,
      actorEmail: optionalStringSchema,
      entityId: optionalStringSchema,
      ipAddress: optionalStringSchema,
      networkType: optionalStringSchema,
      deviceType: optionalStringSchema,
      browser: optionalStringSchema,
      operatingSystem: optionalStringSchema,
      clientId: optionalStringSchema,
      sessionId: optionalStringSchema,
      fromDate: optionalDateSchema,
      toDate: optionalDateSchema,
    })
    .refine(dateRangeRefinement, {
      message: "fromDate cannot be after toDate.",
      path: ["fromDate"],
    }),
});

const auditLogTimelineQueryValidationSchema = z.object({
  query: z
    .object({
      module: optionalStringSchema,
      action: optionalStringSchema,
      riskLevel: auditLogRiskLevelSchema,
      category: auditLogCategorySchema,
      actorRole: optionalStringSchema,
      actorEmail: optionalStringSchema,
      entityId: optionalStringSchema,
      fromDate: optionalDateSchema,
      toDate: optionalDateSchema,
      groupBy: z.enum(["hour", "day", "month"]).optional(),
      limit: z.coerce.number().int().min(1).max(120).optional(),
    })
    .refine(dateRangeRefinement, {
      message: "fromDate cannot be after toDate.",
      path: ["fromDate"],
    }),
});

const auditLogFilterOptionsQueryValidationSchema = z.object({
  query: z.object({
    fromDate: optionalDateSchema,
    toDate: optionalDateSchema,
  }),
});

const auditLogSensitiveQueryValidationSchema = z.object({
  query: z
    .object({
      module: optionalStringSchema,
      action: optionalStringSchema,
      riskLevel: auditLogRiskLevelSchema,
      category: auditLogCategorySchema,
      actorRole: optionalStringSchema,
      actorEmail: optionalStringSchema,
      entityId: optionalStringSchema,
      fromDate: optionalDateSchema,
      toDate: optionalDateSchema,
      includeData: booleanStringSchema,
      ...paginationQuerySchema,
    })
    .refine(dateRangeRefinement, {
      message: "fromDate cannot be after toDate.",
      path: ["fromDate"],
    }),
});

const auditLogIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("Audit log id"),
  }),
});

const auditLogEntityParamValidationSchema = z.object({
  params: z.object({
    entityId: z.string().trim().min(1, "Entity id is required."),
  }),
  query: z.object({
    module: optionalStringSchema,
    action: optionalStringSchema,
    riskLevel: auditLogRiskLevelSchema,
    category: auditLogCategorySchema,
    fromDate: optionalDateSchema,
    toDate: optionalDateSchema,
    includeData: booleanStringSchema,
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const AuditLogValidations = {
  auditLogQueryValidationSchema,
  auditLogSummaryQueryValidationSchema,
  auditLogTimelineQueryValidationSchema,
  auditLogFilterOptionsQueryValidationSchema,
  auditLogSensitiveQueryValidationSchema,
  auditLogIdParamValidationSchema,
  auditLogEntityParamValidationSchema,
};

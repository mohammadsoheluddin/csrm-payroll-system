import { PipelineStage } from "mongoose";
import AppError from "../../errors/AppError";
import {
  TAuditLog,
  TAuditLogEntityTrailQuery,
  TAuditLogFilterOptionsQuery,
  TAuditLogQuery,
  TAuditLogSensitiveQuery,
  TAuditLogSummaryQuery,
  TAuditLogTimelineQuery,
  TCreateAuditLogPayload,
} from "./auditLog.interface";
import AuditLog from "./auditLog.model";

type TAuditLogMongoFilter = Record<string, any>;

const MAX_AUDIT_LOG_LIMIT = 100;
const DEFAULT_AUDIT_LOG_LIMIT = 20;

const SENSITIVE_AUDIT_ACTIONS = [
  "permission_denied",
  "role_change",
  "delete",
  "soft_delete",
  "restore",
  "approve",
  "approved",
  "reject",
  "lock",
  "locked",
  "unlock",
  "unlocked",
  "pay",
  "export",
  "download",
] as const;

const SENSITIVE_RISK_LEVELS = ["high", "critical"] as const;

const createAuditLogIntoDB = async (payload: TCreateAuditLogPayload) => {
  const result = await AuditLog.create(payload);
  return result;
};

/**
 * Added:
 * Use this function from other modules later.
 * Audit log failure should not break the main business operation.
 */
const createAuditLogSafely = async (payload: TCreateAuditLogPayload) => {
  try {
    const result = await AuditLog.create(payload);
    return result;
  } catch (error) {
    console.error("Audit log creation failed:", error);
    return null;
  }
};

const normalizeNumber = (
  value: string | number | undefined,
  defaultValue: number,
  maxValue?: number,
) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  const normalized = Math.floor(parsed);

  if (maxValue && normalized > maxValue) {
    return maxValue;
  }

  return normalized;
};

const normalizeBoolean = (value?: string) => value === "true";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseAuditDate = (value: string, endOfDay = false) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const appendDateRangeFilter = (
  filter: TAuditLogMongoFilter,
  fromDate?: string,
  toDate?: string,
) => {
  if (!fromDate && !toDate) {
    return;
  }

  const createdAtFilter: Record<string, Date> = {};

  if (fromDate) {
    const parsedFromDate = parseAuditDate(fromDate);

    if (parsedFromDate) {
      createdAtFilter.$gte = parsedFromDate;
    }
  }

  if (toDate) {
    const parsedToDate = parseAuditDate(toDate, true);

    if (parsedToDate) {
      createdAtFilter.$lte = parsedToDate;
    }
  }

  if (Object.keys(createdAtFilter).length > 0) {
    filter.createdAt = createdAtFilter;
  }
};

const appendExactMatchFilters = (
  filter: TAuditLogMongoFilter,
  query: Partial<TAuditLogQuery>,
) => {
  const exactFilterFields: Array<keyof TAuditLogQuery> = [
    "module",
    "action",
    "riskLevel",
    "category",
    "actorId",
    "actorRole",
    "entityId",
    "requestId",
    "requestMethod",
    "ipAddress",
    "networkType",
    "deviceType",
    "browser",
    "operatingSystem",
    "clientName",
    "clientId",
    "sessionId",
  ];

  exactFilterFields.forEach((field) => {
    const value = query[field];

    if (typeof value === "string" && value.trim()) {
      filter[field] = value.trim();
    }
  });
};

const appendRegexFilter = (
  filter: TAuditLogMongoFilter,
  field: keyof TAuditLog,
  value?: string,
) => {
  if (!value?.trim()) {
    return;
  }

  filter[field] = {
    $regex: escapeRegExp(value.trim()),
    $options: "i",
  };
};

const appendDataPresenceFilter = (
  filter: TAuditLogMongoFilter,
  field: "previousData" | "newData" | "metadata",
  value?: string,
) => {
  if (value === "true") {
    filter[field] = { $ne: null };
  }

  if (value === "false") {
    filter[field] = null;
  }
};

const buildAuditLogFilter = (
  query: Partial<TAuditLogQuery | TAuditLogSummaryQuery | TAuditLogFilterOptionsQuery>,
) => {
  const filter: TAuditLogMongoFilter = {};

  appendExactMatchFilters(filter, query as Partial<TAuditLogQuery>);
  appendRegexFilter(filter, "actorName", (query as TAuditLogQuery).actorName);
  appendRegexFilter(filter, "actorEmail", (query as TAuditLogQuery).actorEmail);
  appendRegexFilter(filter, "entityName", (query as TAuditLogQuery).entityName);
  appendRegexFilter(filter, "requestPath", (query as TAuditLogQuery).requestPath);

  appendDateRangeFilter(filter, query.fromDate, query.toDate);

  appendDataPresenceFilter(
    filter,
    "previousData",
    (query as TAuditLogQuery).hasPreviousData,
  );
  appendDataPresenceFilter(filter, "newData", (query as TAuditLogQuery).hasNewData);
  appendDataPresenceFilter(filter, "metadata", (query as TAuditLogQuery).hasMetadata);

  if ((query as TAuditLogQuery).sensitiveOnly === "true") {
    filter.$or = [
      { riskLevel: { $in: [...SENSITIVE_RISK_LEVELS] } },
      { action: { $in: [...SENSITIVE_AUDIT_ACTIONS] } },
    ];
  }

  const searchTerm = (query as TAuditLogQuery).searchTerm;

  if (searchTerm?.trim()) {
    const safeSearchTerm = escapeRegExp(searchTerm.trim());
    const regexFilter = { $regex: safeSearchTerm, $options: "i" };

    filter.$or = [
      { description: regexFilter },
      { actorName: regexFilter },
      { actorEmail: regexFilter },
      { entityName: regexFilter },
      { entityId: regexFilter },
      { requestId: regexFilter },
      { requestPath: regexFilter },
      { ipAddress: regexFilter },
      { clientName: regexFilter },
      { clientId: regexFilter },
      { sessionId: regexFilter },
    ];
  }

  return filter;
};

const getAllAuditLogsFromDB = async (query: TAuditLogQuery) => {
  const pageNumber = normalizeNumber(query.page, 1);
  const limitNumber = normalizeNumber(
    query.limit,
    DEFAULT_AUDIT_LOG_LIMIT,
    MAX_AUDIT_LOG_LIMIT,
  );
  const skip = (pageNumber - 1) * limitNumber;
  const filter = buildAuditLogFilter(query);
  const includeData = query.includeData !== "false";

  const allowedSortFields = new Set([
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
  ]);
  const sortBy = allowedSortFields.has(String(query.sortBy))
    ? String(query.sortBy)
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const auditLogQuery = AuditLog.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limitNumber);

  if (!includeData) {
    auditLogQuery.select("-previousData -newData -metadata -requestQuery -userAgent");
  }

  const [data, total] = await Promise.all([
    auditLogQuery,
    AuditLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

const getAuditLogSummaryFromDB = async (query: TAuditLogSummaryQuery) => {
  const filter = buildAuditLogFilter(query);

  const [
    totalLogs,
    moduleSummary,
    actionSummary,
    actorRoleSummary,
    networkSummary,
    deviceSummary,
    riskLevelSummary,
    categorySummary,
    highRiskCount,
    criticalRiskCount,
    recentSensitiveLogs,
  ] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$actorRole", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$networkType", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AuditLog.countDocuments({ ...filter, riskLevel: "high" }),
    AuditLog.countDocuments({ ...filter, riskLevel: "critical" }),
    AuditLog.find({
      ...filter,
      action: {
        $in: [
          "permission_denied",
          "role_change",
          "delete",
          "soft_delete",
          "lock",
          "unlock",
          "unlocked",
          "restore",
          "approve",
          "approved",
          "reject",
          "pay",
          "export",
          "download",
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "module action riskLevel category actorEmail actorRole entityId entityName description ipAddress createdAt",
      ),
  ]);

  return {
    totalLogs,
    summary: {
      byModule: moduleSummary.map((item) => ({
        module: item._id || "unknown",
        count: item.count,
      })),
      byAction: actionSummary.map((item) => ({
        action: item._id || "unknown",
        count: item.count,
      })),
      byActorRole: actorRoleSummary.map((item) => ({
        actorRole: item._id || "unknown",
        count: item.count,
      })),
      byNetworkType: networkSummary.map((item) => ({
        networkType: item._id || "unknown",
        count: item.count,
      })),
      byDeviceType: deviceSummary.map((item) => ({
        deviceType: item._id || "unknown",
        count: item.count,
      })),
      byRiskLevel: riskLevelSummary.map((item) => ({
        riskLevel: item._id || "unknown",
        count: item.count,
      })),
      byCategory: categorySummary.map((item) => ({
        category: item._id || "unknown",
        count: item.count,
      })),
    },
    sensitiveActivity: {
      highRiskCount,
      criticalRiskCount,
      totalRecentSensitiveLogs: recentSensitiveLogs.length,
      recentLogs: recentSensitiveLogs,
    },
  };
};

const getAuditLogTimelineFromDB = async (query: TAuditLogTimelineQuery) => {
  const filter = buildAuditLogFilter(query);
  const limitNumber = normalizeNumber(query.limit, 60, 120);
  const groupBy = query.groupBy || "day";

  const dateFormatMap: Record<string, string> = {
    hour: "%Y-%m-%d %H:00",
    day: "%Y-%m-%d",
    month: "%Y-%m",
  };

  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormatMap[groupBy] || dateFormatMap.day,
            date: "$createdAt",
          },
        },
        totalLogs: { $sum: 1 },
        uniqueActors: { $addToSet: "$actorId" },
        modules: { $addToSet: "$module" },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: limitNumber },
    {
      $project: {
        _id: 0,
        period: "$_id",
        totalLogs: 1,
        uniqueActorCount: { $size: "$uniqueActors" },
        moduleCount: { $size: "$modules" },
      },
    },
  ];

  const timeline = await AuditLog.aggregate(pipeline);

  return {
    groupBy,
    totalPeriods: timeline.length,
    data: timeline.reverse(),
  };
};

const getAuditLogFilterOptionsFromDB = async (
  query: TAuditLogFilterOptionsQuery,
) => {
  const filter: TAuditLogMongoFilter = {};
  appendDateRangeFilter(filter, query.fromDate, query.toDate);

  const [
    modules,
    actions,
    actorRoles,
    networkTypes,
    deviceTypes,
    riskLevels,
    categories,
    browsers,
    operatingSystems,
    clientNames,
  ] = await Promise.all([
    AuditLog.distinct("module", filter),
    AuditLog.distinct("action", filter),
    AuditLog.distinct("actorRole", filter),
    AuditLog.distinct("networkType", filter),
    AuditLog.distinct("deviceType", filter),
    AuditLog.distinct("riskLevel", filter),
    AuditLog.distinct("category", filter),
    AuditLog.distinct("browser", filter),
    AuditLog.distinct("operatingSystem", filter),
    AuditLog.distinct("clientName", filter),
  ]);

  const sortValues = (values: unknown[]) =>
    values
      .filter((value): value is string => typeof value === "string" && Boolean(value))
      .sort((a, b) => a.localeCompare(b));

  return {
    modules: sortValues(modules),
    actions: sortValues(actions),
    actorRoles: sortValues(actorRoles),
    networkTypes: sortValues(networkTypes),
    deviceTypes: sortValues(deviceTypes),
    riskLevels: sortValues(riskLevels),
    categories: sortValues(categories),
    browsers: sortValues(browsers),
    operatingSystems: sortValues(operatingSystems),
    clientNames: sortValues(clientNames),
    sortFields: [
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
    ],
  };
};

const getSingleAuditLogFromDB = async (id: string) => {
  const result = await AuditLog.findById(id);

  if (!result) {
    throw new AppError(404, "Audit log not found");
  }

  return result;
};

const getAuditLogsByEntityFromDB = async (
  entityId: string,
  query: TAuditLogEntityTrailQuery = {},
) => {
  const pageNumber = normalizeNumber(query.page, 1);
  const limitNumber = normalizeNumber(
    query.limit,
    DEFAULT_AUDIT_LOG_LIMIT,
    MAX_AUDIT_LOG_LIMIT,
  );
  const skip = (pageNumber - 1) * limitNumber;
  const includeData = query.includeData !== "false";

  const filter: TAuditLogMongoFilter = { entityId };

  if (query.module) {
    filter.module = query.module;
  }

  if (query.action) {
    filter.action = query.action;
  }

  if (query.riskLevel) {
    filter.riskLevel = query.riskLevel;
  }

  if (query.category) {
    filter.category = query.category;
  }

  appendDateRangeFilter(filter, query.fromDate, query.toDate);

  const auditLogQuery = AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  if (!includeData) {
    auditLogQuery.select("-previousData -newData -metadata -requestQuery -userAgent");
  }

  const [data, total] = await Promise.all([
    auditLogQuery,
    AuditLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};



const getSensitiveAuditLogsFromDB = async (
  query: TAuditLogSensitiveQuery = {},
) => {
  const pageNumber = normalizeNumber(query.page, 1);
  const limitNumber = normalizeNumber(
    query.limit,
    DEFAULT_AUDIT_LOG_LIMIT,
    MAX_AUDIT_LOG_LIMIT,
  );
  const skip = (pageNumber - 1) * limitNumber;
  const includeData = query.includeData !== "false";

  const filter = buildAuditLogFilter({
    ...query,
    sensitiveOnly: "true",
  } as TAuditLogQuery);

  const auditLogQuery = AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  if (!includeData) {
    auditLogQuery.select("-previousData -newData -metadata -requestQuery -userAgent");
  }

  const [data, total] = await Promise.all([
    auditLogQuery,
    AuditLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

export const AuditLogServices = {
  createAuditLogIntoDB,
  createAuditLogSafely,
  getAllAuditLogsFromDB,
  getAuditLogSummaryFromDB,
  getAuditLogTimelineFromDB,
  getAuditLogFilterOptionsFromDB,
  getSingleAuditLogFromDB,
  getAuditLogsByEntityFromDB,
  getSensitiveAuditLogsFromDB,
};

import AppError from "../../errors/AppError";
import { TAuditLogQuery, TCreateAuditLogPayload } from "./auditLog.interface";
import AuditLog from "./auditLog.model";

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

const getAllAuditLogsFromDB = async (query: TAuditLogQuery) => {
  const {
    module,
    action,
    actorId,
    actorRole,
    entityId,
    ipAddress,
    networkType,
    deviceType,
    browser,
    operatingSystem,
    fromDate,
    toDate,
    page = "1",
    limit = "20",
  } = query;

  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const limitNumber = Number(limit) > 0 ? Number(limit) : 20;
  const skip = (pageNumber - 1) * limitNumber;

  // Fixed: Proper TypeScript type instead of raw Record
  const filter: Record<string, unknown> = {};

  if (module) {
    filter.module = module;
  }

  if (action) {
    filter.action = action;
  }

  if (actorId) {
    filter.actorId = actorId;
  }

  if (actorRole) {
    filter.actorRole = actorRole;
  }

  if (entityId) {
    filter.entityId = entityId;
  }

  // Added: Device/network query filters
  if (ipAddress) {
    filter.ipAddress = ipAddress;
  }

  if (networkType) {
    filter.networkType = networkType;
  }

  if (deviceType) {
    filter.deviceType = deviceType;
  }

  if (browser) {
    filter.browser = browser;
  }

  if (operatingSystem) {
    filter.operatingSystem = operatingSystem;
  }

  if (fromDate || toDate) {
    const createdAtFilter: Record<string, Date> = {};

    if (fromDate) {
      createdAtFilter.$gte = new Date(fromDate);
    }

    if (toDate) {
      createdAtFilter.$lte = new Date(toDate);
    }

    filter.createdAt = createdAtFilter;
  }

  const [data, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
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

const getSingleAuditLogFromDB = async (id: string) => {
  const result = await AuditLog.findById(id);

  if (!result) {
    throw new AppError(404, "Audit log not found");
  }

  return result;
};

const getAuditLogsByEntityFromDB = async (entityId: string) => {
  const result = await AuditLog.find({ entityId }).sort({ createdAt: -1 });
  return result;
};

export const AuditLogServices = {
  createAuditLogIntoDB,
  createAuditLogSafely,
  getAllAuditLogsFromDB,
  getSingleAuditLogFromDB,
  getAuditLogsByEntityFromDB,
};

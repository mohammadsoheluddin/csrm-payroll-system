import { Request } from "express";
import type { TRequestUser } from "../../middleware/auth";
import { TCreateAuditLogPayload } from "./auditLog.interface";
import { AuditLogServices } from "./auditLog.service";

type TRequestWithUser = Request & {
  user?: TRequestUser;
};

type TAuditPayloadWithoutActor = Omit<
  TCreateAuditLogPayload,
  "actorId" | "actorEmail" | "actorRole" | "ipAddress" | "userAgent"
>;

/**
 * Added:
 * Converts Mongoose documents or plain objects into safe audit data.
 * This keeps previousData/newData TypeScript-safe.
 */
export const toAuditData = (data: unknown): Record<string, unknown> | null => {
  if (!data) {
    return null;
  }

  if (typeof data !== "object") {
    return { value: data };
  }

  const possibleMongooseDocument = data as {
    toObject?: () => Record<string, unknown>;
  };

  if (typeof possibleMongooseDocument.toObject === "function") {
    return possibleMongooseDocument.toObject();
  }

  return data as Record<string, unknown>;
};

/**
 * Added:
 * Gets a readable entity id from Mongoose document/plain object.
 */
export const getAuditEntityId = (
  data: unknown,
  fallbackId?: string,
): string | undefined => {
  const auditData = toAuditData(data);

  if (auditData?._id) {
    return String(auditData._id);
  }

  return fallbackId;
};

/**
 * Added:
 * Gets a readable entity name for audit timeline.
 */
export const getAuditEntityName = (
  data: unknown,
  keys: string[] = ["name", "title", "employeeId", "email", "payrollMonth"],
): string | undefined => {
  const auditData = toAuditData(data);

  if (!auditData) {
    return undefined;
  }

  for (const key of keys) {
    if (auditData[key]) {
      return String(auditData[key]);
    }
  }

  return undefined;
};

/**
 * Added:
 * Creates audit log from Express request.
 * Audit log failure will not break main API operation because service uses createAuditLogSafely().
 */
export const createAuditLogFromRequest = async (
  req: Request,
  payload: TAuditPayloadWithoutActor,
) => {
  const user = (req as TRequestWithUser).user;

  await AuditLogServices.createAuditLogSafely({
    ...payload,
    actorId: user?.userId,
    actorEmail: user?.email,
    actorRole: user?.role,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });
};

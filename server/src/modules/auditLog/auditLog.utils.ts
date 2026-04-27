import { Request } from "express";
import type { TRequestUser } from "../../middleware/auth";
import {
  TAuditDeviceType,
  TAuditNetworkType,
  TCreateAuditLogPayload,
} from "./auditLog.interface";
import { AuditLogServices } from "./auditLog.service";

type TRequestWithUser = Request & {
  user?: TRequestUser;
};

type TAuditPayloadWithoutActorAndRequest = Omit<
  TCreateAuditLogPayload,
  | "actorId"
  | "actorEmail"
  | "actorRole"
  | "ipAddress"
  | "forwardedFor"
  | "realIp"
  | "networkType"
  | "userAgent"
  | "browser"
  | "operatingSystem"
  | "deviceType"
  | "requestId"
  | "requestMethod"
  | "requestUrl"
  | "requestOriginalUrl"
  | "requestPath"
  | "requestQuery"
  | "clientName"
  | "clientId"
  | "sessionId"
>;

const getHeaderValue = (
  req: Request,
  headerName: string,
): string | undefined => {
  const value = req.headers[headerName.toLowerCase()];

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
};

const normalizeIp = (ip?: string): string | undefined => {
  if (!ip) {
    return undefined;
  }

  return ip.replace("::ffff:", "").trim();
};

const getClientIp = (req: Request): string | undefined => {
  const forwardedFor = getHeaderValue(req, "x-forwarded-for");

  if (forwardedFor) {
    return normalizeIp(forwardedFor.split(",")[0]);
  }

  return normalizeIp(req.ip || req.socket.remoteAddress);
};

const getNetworkType = (ip?: string): TAuditNetworkType => {
  if (!ip) {
    return "unknown";
  }

  const normalizedIp = normalizeIp(ip);

  if (!normalizedIp) {
    return "unknown";
  }

  if (normalizedIp === "::1" || normalizedIp === "127.0.0.1") {
    return "loopback";
  }

  if (
    normalizedIp.startsWith("10.") ||
    normalizedIp.startsWith("192.168.") ||
    normalizedIp.startsWith("172.16.") ||
    normalizedIp.startsWith("172.17.") ||
    normalizedIp.startsWith("172.18.") ||
    normalizedIp.startsWith("172.19.") ||
    normalizedIp.startsWith("172.2") ||
    normalizedIp.startsWith("172.30.") ||
    normalizedIp.startsWith("172.31.")
  ) {
    return "private";
  }

  return "public";
};

const detectDeviceType = (userAgent?: string): TAuditDeviceType => {
  if (!userAgent) {
    return "unknown";
  }

  const ua = userAgent.toLowerCase();

  if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) {
    return "bot";
  }

  if (ua.includes("ipad") || ua.includes("tablet")) {
    return "tablet";
  }

  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }

  if (
    ua.includes("windows") ||
    ua.includes("macintosh") ||
    ua.includes("linux")
  ) {
    return "desktop";
  }

  return "unknown";
};

const detectBrowser = (userAgent?: string): string | undefined => {
  if (!userAgent) {
    return undefined;
  }

  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/")) {
    return "Microsoft Edge";
  }

  if (ua.includes("opr/") || ua.includes("opera")) {
    return "Opera";
  }

  if (ua.includes("chrome/") && !ua.includes("edg/")) {
    return "Chrome";
  }

  if (ua.includes("firefox/")) {
    return "Firefox";
  }

  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "Safari";
  }

  return "Unknown";
};

const detectOperatingSystem = (userAgent?: string): string | undefined => {
  if (!userAgent) {
    return undefined;
  }

  const ua = userAgent.toLowerCase();

  if (ua.includes("windows")) {
    return "Windows";
  }

  if (ua.includes("mac os") || ua.includes("macintosh")) {
    return "macOS";
  }

  if (ua.includes("android")) {
    return "Android";
  }

  if (ua.includes("iphone") || ua.includes("ipad")) {
    return "iOS";
  }

  if (ua.includes("linux")) {
    return "Linux";
  }

  return "Unknown";
};

const generateRequestId = (req: Request): string => {
  const existingRequestId =
    getHeaderValue(req, "x-request-id") ||
    getHeaderValue(req, "x-correlation-id");

  if (existingRequestId) {
    return existingRequestId;
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Added:
 * Converts Mongoose documents or plain objects into safe audit data.
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
 * Creates audit log from Express request with actor, device, IP, network and request metadata.
 */
export const createAuditLogFromRequest = async (
  req: Request,
  payload: TAuditPayloadWithoutActorAndRequest,
) => {
  const user = (req as TRequestWithUser).user;
  const userAgent = req.get("user-agent");
  const ipAddress = getClientIp(req);
  const forwardedFor = getHeaderValue(req, "x-forwarded-for");
  const realIp = getHeaderValue(req, "x-real-ip");

  await AuditLogServices.createAuditLogSafely({
    ...payload,
    actorId: user?.userId,
    actorEmail: user?.email,
    actorRole: user?.role,

    requestId: generateRequestId(req),
    requestMethod: req.method,
    requestUrl: req.url,
    requestOriginalUrl: req.originalUrl,
    requestPath: req.path,
    requestQuery: toAuditData(req.query),

    ipAddress,
    forwardedFor,
    realIp,
    networkType: getNetworkType(ipAddress),

    userAgent,
    browser: detectBrowser(userAgent),
    operatingSystem: detectOperatingSystem(userAgent),
    deviceType: detectDeviceType(userAgent),

    clientName: getHeaderValue(req, "x-client-name"),
    clientId: getHeaderValue(req, "x-client-id"),
    sessionId: getHeaderValue(req, "x-session-id"),

    location: null,
  });
};

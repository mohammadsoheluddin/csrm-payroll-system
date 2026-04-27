import { Schema, model } from "mongoose";
import { TAuditLog } from "./auditLog.interface";

const auditLogSchema = new Schema<TAuditLog>(
  {
    actorId: {
      type: String,
      trim: true,
    },
    actorName: {
      type: String,
      trim: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      trim: true,
      index: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    entityId: {
      type: String,
      trim: true,
      index: true,
    },
    entityName: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    previousData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },

    // Added: Request metadata for audit investigation
    requestId: {
      type: String,
      trim: true,
      index: true,
    },
    requestMethod: {
      type: String,
      trim: true,
    },
    requestUrl: {
      type: String,
      trim: true,
    },
    requestOriginalUrl: {
      type: String,
      trim: true,
    },
    requestPath: {
      type: String,
      trim: true,
    },
    requestQuery: {
      type: Schema.Types.Mixed,
      default: null,
    },

    // Added: IP and network metadata
    ipAddress: {
      type: String,
      trim: true,
      index: true,
    },
    forwardedFor: {
      type: String,
      trim: true,
    },
    realIp: {
      type: String,
      trim: true,
    },
    networkType: {
      type: String,
      trim: true,
      index: true,
    },

    // Added: Device/browser metadata
    userAgent: {
      type: String,
      trim: true,
    },
    browser: {
      type: String,
      trim: true,
      index: true,
    },
    operatingSystem: {
      type: String,
      trim: true,
      index: true,
    },
    deviceType: {
      type: String,
      trim: true,
      index: true,
    },

    // Added: Optional frontend/client identifiers
    clientName: {
      type: String,
      trim: true,
    },
    clientId: {
      type: String,
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      index: true,
    },

    location: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ deviceType: 1, createdAt: -1 });
auditLogSchema.index({ networkType: 1, createdAt: -1 });

const AuditLog = model<TAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;

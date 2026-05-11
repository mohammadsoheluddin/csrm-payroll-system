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
      index: true,
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
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: "general",
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
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, riskLevel: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, category: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ riskLevel: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ actorEmail: 1, createdAt: -1 });
auditLogSchema.index({ actorRole: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1, createdAt: -1 });
auditLogSchema.index({ entityName: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ deviceType: 1, createdAt: -1 });
auditLogSchema.index({ networkType: 1, createdAt: -1 });
auditLogSchema.index({ requestId: 1, createdAt: -1 });
auditLogSchema.index({ clientId: 1, createdAt: -1 });
auditLogSchema.index({ sessionId: 1, createdAt: -1 });

const AuditLog = model<TAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;

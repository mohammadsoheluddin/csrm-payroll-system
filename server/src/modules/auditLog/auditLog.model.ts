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

    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
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

const AuditLog = model<TAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;

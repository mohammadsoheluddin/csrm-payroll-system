import { Request } from "express";
import { Schema, Types } from "mongoose";
import { z } from "zod";
import AppError from "../errors/AppError";

export const SOFT_DELETE_REASON_MAX_LENGTH = 500;

export const SOFT_DELETE_STATUS = {
  ACTIVE: false,
  DELETED: true,
} as const;

export type TSoftDeleteObjectId = Types.ObjectId | string | null;

export type TSoftDeleteRequestUser = {
  userId?: string;
  email?: string;
  role?: string;
  employeeId?: string;
};

export type TSoftDeleteFields = {
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: TSoftDeleteObjectId;
  deleteReason?: string | null;
  restoredAt?: Date | null;
  restoredBy?: TSoftDeleteObjectId;
  restoreReason?: string | null;
  updatedBy?: TSoftDeleteObjectId;
};

export type TSoftDeleteRequestBody = {
  deleteReason?: string;
};

export type TRestoreRequestBody = {
  restoreReason?: string;
};

export type TSoftDeleteMongoFilter<T = unknown> = Record<string, any>;

export type TSoftDeleteMongoUpdate<T = unknown> = Record<string, any>;

const softDeleteReasonSchema = z
  .string()
  .trim()
  .min(1, "Reason cannot be empty")
  .max(
    SOFT_DELETE_REASON_MAX_LENGTH,
    `Reason cannot exceed ${SOFT_DELETE_REASON_MAX_LENGTH} characters`,
  );

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

export const softDeleteBodyValidationSchema = z
  .object({
    deleteReason: softDeleteReasonSchema.optional(),
  })
  .strict();

export const restoreBodyValidationSchema = z
  .object({
    restoreReason: softDeleteReasonSchema.optional(),
  })
  .strict();

export const createSoftDeleteValidationSchema = (paramName = "id") =>
  z.object({
    params: z.object({
      [paramName]: objectIdSchema(paramName),
    }),
    body: softDeleteBodyValidationSchema.optional().default({}),
  });

export const createRestoreValidationSchema = (paramName = "id") =>
  z.object({
    params: z.object({
      [paramName]: objectIdSchema(paramName),
    }),
    body: restoreBodyValidationSchema.optional().default({}),
  });

export const softDeleteSchemaFields = {
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  deleteReason: {
    type: String,
    trim: true,
    default: null,
  },
  restoredAt: {
    type: Date,
    default: null,
  },
  restoredBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  restoreReason: {
    type: String,
    trim: true,
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
};

export const normalizeSoftDeleteReason = (reason?: unknown): string | null => {
  if (typeof reason !== "string") {
    return null;
  }

  const trimmedReason = reason.trim();
  return trimmedReason || null;
};

export const getRequestUser = (req: Request): TSoftDeleteRequestUser | undefined =>
  (req as Request & { user?: TSoftDeleteRequestUser }).user;

export const getRequestUserId = (req: Request): string | undefined =>
  getRequestUser(req)?.userId;


export const getObjectIdString = (value?: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    const objectValue = value as {
      _id?: unknown;
      id?: unknown;
    };

    if (objectValue._id instanceof Types.ObjectId) {
      return objectValue._id.toString();
    }

    if (typeof objectValue._id === "string") {
      return objectValue._id;
    }

    if (objectValue.id instanceof Types.ObjectId) {
      return objectValue.id.toString();
    }

    if (typeof objectValue.id === "string") {
      return objectValue.id;
    }
  }

  return undefined;
};

export const getObjectIdStringOrThrow = (
  value: unknown,
  fieldName = "record ID",
): string => {
  const objectIdString = getObjectIdString(value);

  if (!objectIdString || !Types.ObjectId.isValid(objectIdString)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return objectIdString;
};

export const toObjectIdOrNull = (value?: unknown): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(String(value))) {
    return null;
  }

  return new Types.ObjectId(String(value));
};

export const toObjectIdOrThrow = (
  value: unknown,
  fieldName = "record ID",
): Types.ObjectId => {
  if (!value || !Types.ObjectId.isValid(String(value))) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new Types.ObjectId(String(value));
};

export const buildActiveFilter = <T>(
  filter: TSoftDeleteMongoFilter<T> = {},
): TSoftDeleteMongoFilter<T> => ({
  ...filter,
  isDeleted: { $ne: true },
});

export const buildDeletedFilter = <T>(
  filter: TSoftDeleteMongoFilter<T> = {},
): TSoftDeleteMongoFilter<T> => ({
  ...filter,
  isDeleted: true,
});

export const buildSoftDeleteUpdate = <T>(options?: {
  userId?: string;
  deleteReason?: string | null;
  deletedAt?: Date;
}): TSoftDeleteMongoUpdate<T> => {
  const actorObjectId = toObjectIdOrNull(options?.userId);

  return {
    $set: {
      isDeleted: true,
      deletedAt: options?.deletedAt || new Date(),
      deletedBy: actorObjectId,
      deleteReason: normalizeSoftDeleteReason(options?.deleteReason),
      updatedBy: actorObjectId,
    },
  };
};

export const buildRestoreUpdate = <T>(options?: {
  userId?: string;
  restoreReason?: string | null;
  restoredAt?: Date;
}): TSoftDeleteMongoUpdate<T> => {
  const actorObjectId = toObjectIdOrNull(options?.userId);

  return {
    $set: {
      isDeleted: false,
      restoredAt: options?.restoredAt || new Date(),
      restoredBy: actorObjectId,
      restoreReason: normalizeSoftDeleteReason(options?.restoreReason),
      updatedBy: actorObjectId,
    },
  };
};

export const SOFT_DELETE_ROUTE_CONVENTION = {
  ACTIVE_LIST: "GET /resource",
  SINGLE_ACTIVE: "GET /resource/:id",
  DELETED_LIST: "GET /resource/deleted",
  SOFT_DELETE: "DELETE /resource/:id",
  RESTORE: "PATCH /resource/:id/restore",
} as const;

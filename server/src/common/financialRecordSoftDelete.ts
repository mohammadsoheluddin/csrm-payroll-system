import mongoose, { Model } from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  getObjectIdString,
  type TRestoreRequestBody,
  type TSoftDeleteRequestBody,
} from "./softDelete";
import AppError from "../errors/AppError";

export type TFinancialRecordSoftDeleteOptions = TSoftDeleteRequestBody &
  TRestoreRequestBody & {
    userId?: string;
  };

export type TFinancialRecordSoftDeleteConfig = {
  model: Model<any>;
  recordName: string;
  populate?: string[];
  queryFields?: string[];
  restoreUniqueFields?: string[];
  blockedDeleteStatuses?: string[];
  blockedRestoreStatuses?: string[];
  blockIfLocked?: boolean;
  defaultSort?: Record<string, 1 | -1>;
};

const DEFAULT_BLOCKED_DELETE_STATUSES = ["locked", "paid", "finalized"];
const DEFAULT_BLOCKED_RESTORE_STATUSES = ["locked", "paid", "finalized"];

const pickQueryFields = (
  query: Record<string, unknown>,
  allowedFields: string[] = [],
) => {
  const filter: Record<string, unknown> = {};

  for (const field of allowedFields) {
    const value = query[field];

    if (value !== undefined && value !== null && value !== "") {
      filter[field] = value;
    }
  }

  return filter;
};

const applyPopulate = (queryBuilder: any, populate: string[] = []) => {
  let builder = queryBuilder;

  for (const path of populate) {
    builder = builder.populate(path);
  }

  return builder;
};

const isRecordLocked = (record: any, blockedStatuses: string[]) => {
  const status = String(record?.status || "").toLowerCase();

  return record?.isLocked === true || blockedStatuses.includes(status);
};

const buildRestoreDuplicateFilter = (
  record: any,
  uniqueFields: string[] = [],
) => {
  const duplicateFilter: Record<string, unknown> = {};

  for (const field of uniqueFields) {
    const value = record?.[field];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    const objectIdValue = getObjectIdString(value);
    duplicateFilter[field] = objectIdValue || value;
  }

  return duplicateFilter;
};

export const createFinancialRecordSoftDeleteHandlers = (
  config: TFinancialRecordSoftDeleteConfig,
) => {
  const getDeletedRecordsFromDB = async (query: Record<string, unknown> = {}) => {
    const filter = buildDeletedFilter(
      pickQueryFields(query, config.queryFields || []),
    );

    const result = await applyPopulate(
      config.model
        .find(filter)
        .sort(config.defaultSort || { deletedAt: -1, createdAt: -1 }),
      config.populate || [],
    );

    return result;
  };

  const softDeleteRecordFromDB = async (
    id: string,
    options: TFinancialRecordSoftDeleteOptions = {},
  ) => {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, `Invalid ${config.recordName} ID`);
    }

    const record = await config.model.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new AppError(404, `${config.recordName} not found`);
    }

    if (
      config.blockIfLocked !== false &&
      isRecordLocked(record, config.blockedDeleteStatuses || DEFAULT_BLOCKED_DELETE_STATUSES)
    ) {
      throw new AppError(
        400,
        `${config.recordName} is locked/finalized and cannot be deleted. Use unlock/void/reversal workflow first.`,
      );
    }

    const update = buildSoftDeleteUpdate({
      userId: options.userId,
      deleteReason: options.deleteReason,
    });

    record.set(update.$set);
    await record.save();

    return applyPopulate(config.model.findById(id), config.populate || []);
  };

  const restoreRecordIntoDB = async (
    id: string,
    options: TFinancialRecordSoftDeleteOptions = {},
  ) => {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, `Invalid ${config.recordName} ID`);
    }

    const record = await config.model.findOne(buildDeletedFilter({ _id: id }));

    if (!record) {
      throw new AppError(404, `Deleted ${config.recordName} not found`);
    }

    if (
      config.blockIfLocked !== false &&
      isRecordLocked(record, config.blockedRestoreStatuses || DEFAULT_BLOCKED_RESTORE_STATUSES)
    ) {
      throw new AppError(
        400,
        `Deleted ${config.recordName} is locked/finalized and cannot be restored directly. Use controlled reversal workflow first.`,
      );
    }

    const duplicateFilter = buildRestoreDuplicateFilter(
      record,
      config.restoreUniqueFields || [],
    );

    if (Object.keys(duplicateFilter).length > 0) {
      const duplicateRecord = await config.model.findOne({
        ...duplicateFilter,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (duplicateRecord) {
        throw new AppError(
          409,
          `Cannot restore ${config.recordName} because an active duplicate record already exists`,
        );
      }
    }

    const update = buildRestoreUpdate({
      userId: options.userId,
      restoreReason: options.restoreReason,
    });

    record.set(update.$set);
    await record.save();

    return applyPopulate(config.model.findById(id), config.populate || []);
  };

  return {
    getDeletedRecordsFromDB,
    softDeleteRecordFromDB,
    restoreRecordIntoDB,
  };
};

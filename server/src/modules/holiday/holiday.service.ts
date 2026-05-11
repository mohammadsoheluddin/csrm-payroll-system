import mongoose from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  type TRestoreRequestBody,
  type TSoftDeleteRequestBody,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import { THoliday } from "./holiday.interface";
import Holiday from "./holiday.model";

type THolidayDeleteRestoreOptions = TSoftDeleteRequestBody &
  TRestoreRequestBody & {
    userId?: string;
  };

const createHolidayIntoDB = async (payload: THoliday) => {
  const existingHoliday = await Holiday.findOne({
    holidayDate: payload.holidayDate,
    holidayName: payload.holidayName,
    isDeleted: false,
  });

  if (existingHoliday) {
    throw new AppError(
      409,
      "Holiday already exists with this name on this date",
    );
  }

  const result = await Holiday.create(payload);
  return result;
};

const buildHolidayFilter = (query: Record<string, unknown>, deleted = false) => {
  const filter: Record<string, unknown> = { isDeleted: deleted };

  if (query.holidayType) {
    filter.holidayType = query.holidayType;
  }

  if (query.holidayDate) {
    filter.holidayDate = query.holidayDate;
  }

  if (query.month) {
    const month = query.month as string;
    filter.holidayDate = { $regex: `^${month}` };
  }

  return filter;
};

const getAllHolidayFromDB = async (query: Record<string, unknown>) => {
  const filter = buildHolidayFilter(query, false);

  const result = await Holiday.find(filter).sort({
    holidayDate: 1,
    createdAt: -1,
  });
  return result;
};

const getDeletedHolidayFromDB = async (query: Record<string, unknown>) => {
  const filter = buildHolidayFilter(query, true);

  const result = await Holiday.find(filter).sort({
    deletedAt: -1,
    holidayDate: 1,
    createdAt: -1,
  });
  return result;
};

const getSingleHolidayFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid holiday ID");
  }

  const result = await Holiday.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!result) {
    throw new AppError(404, "Holiday not found");
  }

  return result;
};

const updateHolidayIntoDB = async (id: string, payload: Partial<THoliday>) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid holiday ID");
  }

  const existingHoliday = await Holiday.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingHoliday) {
    throw new AppError(404, "Holiday not found");
  }

  const nextHolidayName = payload.holidayName || existingHoliday.holidayName;
  const nextHolidayDate = payload.holidayDate || existingHoliday.holidayDate;

  const duplicateHoliday = await Holiday.findOne({
    holidayName: nextHolidayName,
    holidayDate: nextHolidayDate,
    isDeleted: false,
    _id: { $ne: id },
  });

  if (duplicateHoliday) {
    throw new AppError(
      409,
      "Another holiday already exists with this name on this date",
    );
  }

  const result = await Holiday.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, "Holiday not found");
  }

  return result;
};

const deleteHolidayFromDB = async (
  id: string,
  options: THolidayDeleteRestoreOptions = {},
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid holiday ID");
  }

  const result = await Holiday.findOneAndUpdate(
    { _id: id, isDeleted: false },
    buildSoftDeleteUpdate({
      userId: options.userId,
      deleteReason: options.deleteReason,
    }),
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, "Holiday not found");
  }

  return result;
};

const restoreHolidayIntoDB = async (
  id: string,
  options: THolidayDeleteRestoreOptions = {},
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid holiday ID");
  }

  const existingHoliday = await Holiday.findOne(buildDeletedFilter({ _id: id }));

  if (!existingHoliday) {
    throw new AppError(404, "Deleted holiday not found");
  }

  const duplicateHoliday = await Holiday.findOne({
    holidayName: existingHoliday.holidayName,
    holidayDate: existingHoliday.holidayDate,
    isDeleted: false,
    _id: { $ne: id },
  });

  if (duplicateHoliday) {
    throw new AppError(
      409,
      "Cannot restore holiday because another active holiday exists with this name on this date",
    );
  }

  const result = await Holiday.findOneAndUpdate(
    buildDeletedFilter({ _id: id }),
    buildRestoreUpdate({
      userId: options.userId,
      restoreReason: options.restoreReason,
    }),
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, "Deleted holiday not found");
  }

  return result;
};

export const HolidayServices = {
  createHolidayIntoDB,
  getAllHolidayFromDB,
  getDeletedHolidayFromDB,
  getSingleHolidayFromDB,
  updateHolidayIntoDB,
  deleteHolidayFromDB,
  restoreHolidayIntoDB,
};

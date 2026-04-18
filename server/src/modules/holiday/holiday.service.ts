import AppError from "../../errors/AppError";
import Holiday from "./holiday.model";
import { THoliday } from "./holiday.interface";
import mongoose from "mongoose";

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

const getAllHolidayFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

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

  const result = await Holiday.find(filter).sort({
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

  if (payload.holidayName && payload.holidayDate) {
    const duplicateHoliday = await Holiday.findOne({
      holidayName: payload.holidayName,
      holidayDate: payload.holidayDate,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (duplicateHoliday) {
      throw new AppError(
        409,
        "Another holiday already exists with this name on this date",
      );
    }
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

const deleteHolidayFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid holiday ID");
  }

  const result = await Holiday.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Holiday not found");
  }

  return result;
};

export const HolidayServices = {
  createHolidayIntoDB,
  getAllHolidayFromDB,
  getSingleHolidayFromDB,
  updateHolidayIntoDB,
  deleteHolidayFromDB,
};

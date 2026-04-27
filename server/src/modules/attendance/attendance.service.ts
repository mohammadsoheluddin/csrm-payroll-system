import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Attendance from "./attendance.model";
import { TAttendance } from "./attendance.interface";
import Employee from "../employee/employee.model";

type TAttendanceQuery = {
  employee?: string;
  status?: string;
  attendanceDate?: string;
  source?: string;
  fromDate?: string;
  toDate?: string;
};

const createAttendanceIntoDB = async (payload: TAttendance) => {
  if (!mongoose.isValidObjectId(payload.employee)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const isEmployeeExists = await Employee.findOne({
    _id: payload.employee,
    isDeleted: false,
  });

  if (!isEmployeeExists) {
    throw new AppError(404, "Employee not found");
  }

  const existingAttendance = await Attendance.findOne({
    employee: payload.employee,
    attendanceDate: payload.attendanceDate,
    isDeleted: false,
  });

  if (existingAttendance) {
    throw new AppError(
      409,
      "Attendance already exists for this employee on this date",
    );
  }

  const result = await Attendance.create(payload);

  const populatedResult = await Attendance.findById(result._id).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  return populatedResult;
};

const getAllAttendanceFromDB = async (query: TAttendanceQuery) => {
  // Fixed: Proper TypeScript type instead of raw Record
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.employee) {
    filter.employee = query.employee;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.source) {
    filter.source = query.source;
  }

  if (query.attendanceDate) {
    filter.attendanceDate = query.attendanceDate;
  } else if (query.fromDate || query.toDate) {
    const attendanceDateFilter: Record<string, string> = {};

    if (query.fromDate) {
      attendanceDateFilter.$gte = query.fromDate;
    }

    if (query.toDate) {
      attendanceDateFilter.$lte = query.toDate;
    }

    filter.attendanceDate = attendanceDateFilter;
  }

  const result = await Attendance.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .sort({ attendanceDate: -1, createdAt: -1 });

  return result;
};

const getSingleAttendanceFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid attendance ID");
  }

  const result = await Attendance.findOne({
    _id: id,
    isDeleted: false,
  }).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  if (!result) {
    throw new AppError(404, "Attendance not found");
  }

  return result;
};

const updateAttendanceIntoDB = async (
  id: string,
  payload: Partial<TAttendance>,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid attendance ID");
  }

  const existingAttendance = await Attendance.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingAttendance) {
    throw new AppError(404, "Attendance not found");
  }

  const employeeId = payload.employee || existingAttendance.employee;
  const attendanceDate =
    payload.attendanceDate || existingAttendance.attendanceDate;

  if (payload.employee) {
    if (!mongoose.isValidObjectId(payload.employee)) {
      throw new AppError(400, "Invalid employee ID");
    }

    const isEmployeeExists = await Employee.findOne({
      _id: payload.employee,
      isDeleted: false,
    });

    if (!isEmployeeExists) {
      throw new AppError(404, "Employee not found");
    }
  }

  const duplicateAttendance = await Attendance.findOne({
    employee: employeeId,
    attendanceDate,
    isDeleted: false,
    _id: { $ne: id },
  });

  if (duplicateAttendance) {
    throw new AppError(
      409,
      "Another attendance already exists for this employee on this date",
    );
  }

  const result = await Attendance.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  ).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  if (!result) {
    throw new AppError(404, "Attendance not found");
  }

  return result;
};

const deleteAttendanceFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid attendance ID");
  }

  const result = await Attendance.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Attendance not found");
  }

  return result;
};

export const AttendanceServices = {
  createAttendanceIntoDB,
  getAllAttendanceFromDB,
  getSingleAttendanceFromDB,
  updateAttendanceIntoDB,
  deleteAttendanceFromDB,
};

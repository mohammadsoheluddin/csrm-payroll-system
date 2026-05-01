import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import type {
  TAttendance,
  TAttendanceSource,
  TAttendanceStatus,
} from "./attendance.interface";
import Attendance from "./attendance.model";

type TAttendanceDateFilter = {
  $gte?: string;
  $lte?: string;
};

type TAttendanceDBFilter = {
  isDeleted: boolean;
  employee?: mongoose.Types.ObjectId;
  status?: TAttendanceStatus;
  source?: TAttendanceSource;
  attendanceDate?: string | TAttendanceDateFilter;
};

const getStringQueryValue = (
  query: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = query[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
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

const getAllAttendanceFromDB = async (query: Record<string, unknown>) => {
  const filter: TAttendanceDBFilter = {
    isDeleted: false,
  };

  const employee = getStringQueryValue(query, "employee");
  const status = getStringQueryValue(query, "status");
  const source = getStringQueryValue(query, "source");
  const attendanceDate = getStringQueryValue(query, "attendanceDate");
  const fromDate = getStringQueryValue(query, "fromDate");
  const toDate = getStringQueryValue(query, "toDate");

  if (employee) {
    if (!mongoose.isValidObjectId(employee)) {
      throw new AppError(400, "Invalid employee ID");
    }

    filter.employee = new mongoose.Types.ObjectId(employee);
  }

  if (status) {
    filter.status = status as TAttendanceStatus;
  }

  if (source) {
    filter.source = source as TAttendanceSource;
  }

  if (fromDate || toDate) {
    filter.attendanceDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  } else if (attendanceDate) {
    filter.attendanceDate = attendanceDate;
  }

  const result = await Attendance.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .sort({
      attendanceDate: -1,
      createdAt: -1,
    });

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
    _id: {
      $ne: id,
    },
  });

  if (duplicateAttendance) {
    throw new AppError(
      409,
      "Another attendance already exists for this employee on this date",
    );
  }

  const result = await Attendance.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
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
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    },
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

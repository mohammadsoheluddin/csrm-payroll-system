import mongoose from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  type TRestoreRequestBody,
  type TSoftDeleteRequestBody,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
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
  isDeleted: boolean | { $ne: boolean };
  employee?: mongoose.Types.ObjectId;
  status?: TAttendanceStatus;
  source?: TAttendanceSource;
  attendanceDate?: string | TAttendanceDateFilter;
};

type TAttendanceDeleteRestoreOptions = TSoftDeleteRequestBody &
  TRestoreRequestBody & {
    userId?: string;
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

const getPayrollMonthFromDate = (attendanceDate: string) =>
  attendanceDate.slice(0, 7);

const populateAttendanceQuery = () => ({
  path: "employee",
  populate: [{ path: "branch" }, { path: "department" }],
});

const ensureAttendanceMonthIsNotLocked = async (attendance: TAttendance) => {
  const lockedFinalization = await AttendanceFinalization.findOne({
    employee: attendance.employee,
    payrollMonth: getPayrollMonthFromDate(attendance.attendanceDate),
    isDeleted: { $ne: true },
    $or: [{ isLocked: true }, { status: "locked" }],
  });

  if (lockedFinalization) {
    throw new AppError(
      409,
      "Attendance cannot be deleted or restored because the payroll month is locked in attendance finalization",
    );
  }
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

  const populatedResult = await Attendance.findById(result._id).populate(
    populateAttendanceQuery(),
  );

  return populatedResult;
};

const buildAttendanceFilter = (query: Record<string, unknown>, deleted = false) => {
  const filter: TAttendanceDBFilter = {
    isDeleted: deleted ? true : false,
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

  return filter;
};

const getAllAttendanceFromDB = async (query: Record<string, unknown>) => {
  const filter = buildAttendanceFilter(query, false);

  const result = await Attendance.find(filter)
    .populate(populateAttendanceQuery())
    .sort({
      attendanceDate: -1,
      createdAt: -1,
    });

  return result;
};

const getDeletedAttendanceFromDB = async (query: Record<string, unknown>) => {
  const filter = buildAttendanceFilter(query, true);

  const result = await Attendance.find(filter)
    .populate(populateAttendanceQuery())
    .sort({
      deletedAt: -1,
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
  }).populate(populateAttendanceQuery());

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

  await ensureAttendanceMonthIsNotLocked(existingAttendance);

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
  ).populate(populateAttendanceQuery());

  if (!result) {
    throw new AppError(404, "Attendance not found");
  }

  return result;
};

const deleteAttendanceFromDB = async (
  id: string,
  options: TAttendanceDeleteRestoreOptions = {},
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

  await ensureAttendanceMonthIsNotLocked(existingAttendance);

  const result = await Attendance.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    buildSoftDeleteUpdate({
      userId: options.userId,
      deleteReason: options.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateAttendanceQuery());

  if (!result) {
    throw new AppError(404, "Attendance not found");
  }

  return result;
};

const restoreAttendanceIntoDB = async (
  id: string,
  options: TAttendanceDeleteRestoreOptions = {},
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid attendance ID");
  }

  const existingAttendance = await Attendance.findOne(buildDeletedFilter({ _id: id }));

  if (!existingAttendance) {
    throw new AppError(404, "Deleted attendance not found");
  }

  await ensureAttendanceMonthIsNotLocked(existingAttendance);

  const activeDuplicate = await Attendance.findOne({
    employee: existingAttendance.employee,
    attendanceDate: existingAttendance.attendanceDate,
    isDeleted: false,
    _id: { $ne: id },
  });

  if (activeDuplicate) {
    throw new AppError(
      409,
      "Cannot restore attendance because another active attendance exists for this employee on this date",
    );
  }

  const result = await Attendance.findOneAndUpdate(
    buildDeletedFilter({ _id: id }),
    buildRestoreUpdate({
      userId: options.userId,
      restoreReason: options.restoreReason,
    }),
    { new: true, runValidators: true },
  ).populate(populateAttendanceQuery());

  if (!result) {
    throw new AppError(404, "Deleted attendance not found");
  }

  return result;
};

export const AttendanceServices = {
  createAttendanceIntoDB,
  getAllAttendanceFromDB,
  getDeletedAttendanceFromDB,
  getSingleAttendanceFromDB,
  updateAttendanceIntoDB,
  deleteAttendanceFromDB,
  restoreAttendanceIntoDB,
};

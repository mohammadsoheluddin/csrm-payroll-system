import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import type { TLeave, TLeaveStatus, TLeaveType } from "./leave.interface";
import Leave from "./leave.model";

type TLeaveDateFilter = {
  $gte?: string;
  $lte?: string;
};

type TLeaveDBFilter = {
  isDeleted: boolean;
  employee?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  leaveType?: TLeaveType;
  status?: TLeaveStatus;
  startDate?: string | TLeaveDateFilter;
  endDate?: string | TLeaveDateFilter;
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

const ensureEmployeeExists = async (employeeId: unknown) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  return employee;
};

const validateLeaveDateRange = (startDate: string, endDate: string) => {
  if (endDate < startDate) {
    throw new AppError(400, "End date cannot be earlier than start date");
  }
};

const createLeaveIntoDB = async (payload: TLeave) => {
  await ensureEmployeeExists(payload.employee);

  validateLeaveDateRange(payload.startDate, payload.endDate);

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  if (payload.totalDays < 1) {
    throw new AppError(400, "Total leave days must be at least 1");
  }

  const result = await Leave.create(payload);

  const populatedResult = await Leave.findById(result._id)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy");

  return populatedResult;
};

const getAllLeaveFromDB = async (query: Record<string, unknown>) => {
  const filter: TLeaveDBFilter = {
    isDeleted: false,
  };

  const employee = getStringQueryValue(query, "employee");
  const approvedBy = getStringQueryValue(query, "approvedBy");
  const leaveType = getStringQueryValue(query, "leaveType");
  const status = getStringQueryValue(query, "status");
  const startDate = getStringQueryValue(query, "startDate");
  const endDate = getStringQueryValue(query, "endDate");
  const fromDate = getStringQueryValue(query, "fromDate");
  const toDate = getStringQueryValue(query, "toDate");

  if (employee) {
    if (!mongoose.isValidObjectId(employee)) {
      throw new AppError(400, "Invalid employee ID");
    }

    filter.employee = new mongoose.Types.ObjectId(employee);
  }

  if (approvedBy) {
    if (!mongoose.isValidObjectId(approvedBy)) {
      throw new AppError(400, "Invalid approved by user ID");
    }

    filter.approvedBy = new mongoose.Types.ObjectId(approvedBy);
  }

  if (leaveType) {
    filter.leaveType = leaveType as TLeaveType;
  }

  if (status) {
    filter.status = status as TLeaveStatus;
  }

  if (fromDate || toDate) {
    filter.startDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  } else if (startDate) {
    filter.startDate = startDate;
  }

  if (endDate) {
    filter.endDate = endDate;
  }

  const result = await Leave.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .sort({
      createdAt: -1,
    });

  return result;
};

const getSingleLeaveFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const result = await Leave.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy");

  if (!result) {
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

const updateLeaveIntoDB = async (id: string, payload: Partial<TLeave>) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const existingLeave = await Leave.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingLeave) {
    throw new AppError(404, "Leave record not found");
  }

  if (payload.employee) {
    await ensureEmployeeExists(payload.employee);
  }

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  if (payload.totalDays !== undefined && payload.totalDays < 1) {
    throw new AppError(400, "Total leave days must be at least 1");
  }

  const nextStartDate = payload.startDate || existingLeave.startDate;
  const nextEndDate = payload.endDate || existingLeave.endDate;

  validateLeaveDateRange(nextStartDate, nextEndDate);

  const result = await Leave.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy");

  if (!result) {
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

const deleteLeaveFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const result = await Leave.findOneAndUpdate(
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
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

export const LeaveServices = {
  createLeaveIntoDB,
  getAllLeaveFromDB,
  getSingleLeaveFromDB,
  updateLeaveIntoDB,
  deleteLeaveFromDB,
};

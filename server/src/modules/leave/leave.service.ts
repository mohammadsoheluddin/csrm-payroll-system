import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import type { TLeave, TLeaveStatus, TLeaveType } from "./leave.interface";
import Leave from "./leave.model";

type TCreateLeavePayload = Omit<TLeave, "totalDays"> & {
  totalDays?: number;
};

type TUpdateLeavePayload = Partial<TLeave>;

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

type TLeaveOverlapFilter = {
  isDeleted: boolean;
  employee: mongoose.Types.ObjectId;
  status: {
    $in: TLeaveStatus[];
  };
  startDate: {
    $lte: string;
  };
  endDate: {
    $gte: string;
  };
  _id?: {
    $ne: mongoose.Types.ObjectId;
  };
};

const ACTIVE_LEAVE_STATUSES: TLeaveStatus[] = ["pending", "approved"];

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

const toObjectId = (value: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(String(value));
};

const ensureEmployeeExists = async (employeeId: unknown) => {
  const employeeObjectId = toObjectId(employeeId, "employee ID");

  const employee = await Employee.findOne({
    _id: employeeObjectId,
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

const calculateTotalLeaveDays = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(
    (end.getTime() - start.getTime()) / millisecondsPerDay,
  );

  return diffDays + 1;
};

const ensureNoOverlappingLeave = async ({
  employeeId,
  startDate,
  endDate,
  excludeLeaveId,
  currentStatus,
}: {
  employeeId: unknown;
  startDate: string;
  endDate: string;
  excludeLeaveId?: string;
  currentStatus?: TLeaveStatus;
}) => {
  const effectiveStatus = currentStatus || "pending";

  if (!ACTIVE_LEAVE_STATUSES.includes(effectiveStatus)) {
    return;
  }

  const employeeObjectId = toObjectId(employeeId, "employee ID");

  const overlapFilter: TLeaveOverlapFilter = {
    employee: employeeObjectId,
    isDeleted: false,
    status: {
      $in: ACTIVE_LEAVE_STATUSES,
    },
    startDate: {
      $lte: endDate,
    },
    endDate: {
      $gte: startDate,
    },
  };

  if (excludeLeaveId) {
    overlapFilter._id = {
      $ne: toObjectId(excludeLeaveId, "leave ID"),
    };
  }

  const overlappingLeave = await Leave.findOne(overlapFilter);

  if (overlappingLeave) {
    throw new AppError(
      409,
      "Leave already exists for this employee within the selected date range",
    );
  }
};

const createLeaveIntoDB = async (payload: TCreateLeavePayload) => {
  await ensureEmployeeExists(payload.employee);

  validateLeaveDateRange(payload.startDate, payload.endDate);

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  await ensureNoOverlappingLeave({
    employeeId: payload.employee,
    startDate: payload.startDate,
    endDate: payload.endDate,
    currentStatus: payload.status || "pending",
  });

  const calculatedTotalDays = calculateTotalLeaveDays(
    payload.startDate,
    payload.endDate,
  );

  const result = await Leave.create({
    ...payload,
    totalDays: calculatedTotalDays,
  });

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
    filter.employee = toObjectId(employee, "employee ID");
  }

  if (approvedBy) {
    filter.approvedBy = toObjectId(approvedBy, "approved by user ID");
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

const updateLeaveIntoDB = async (id: string, payload: TUpdateLeavePayload) => {
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

  const nextEmployee = payload.employee || existingLeave.employee;
  const nextStartDate = payload.startDate || existingLeave.startDate;
  const nextEndDate = payload.endDate || existingLeave.endDate;
  const nextStatus = payload.status || existingLeave.status || "pending";

  validateLeaveDateRange(nextStartDate, nextEndDate);

  await ensureNoOverlappingLeave({
    employeeId: nextEmployee,
    startDate: nextStartDate,
    endDate: nextEndDate,
    excludeLeaveId: id,
    currentStatus: nextStatus,
  });

  const calculatedTotalDays = calculateTotalLeaveDays(
    nextStartDate,
    nextEndDate,
  );

  const result = await Leave.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...payload,
      totalDays: calculatedTotalDays,
    },
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

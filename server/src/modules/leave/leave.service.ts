import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Leave from "./leave.model";
import { TLeave } from "./leave.interface";
import Employee from "../employee/employee.model";

const createLeaveIntoDB = async (payload: TLeave) => {
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

  if (payload.totalDays < 1) {
    throw new AppError(400, "Total leave days must be at least 1");
  }

  const result = await Leave.create(payload);

  const populatedResult = await Leave.findById(result._id).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  return populatedResult;
};

const getAllLeaveFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.employee) {
    filter.employee = query.employee;
  }

  if (query.leaveType) {
    filter.leaveType = query.leaveType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.startDate) {
    filter.startDate = query.startDate;
  }

  if (query.endDate) {
    filter.endDate = query.endDate;
  }

  const result = await Leave.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .sort({ createdAt: -1 });

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

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  if (payload.totalDays !== undefined && payload.totalDays < 1) {
    throw new AppError(400, "Total leave days must be at least 1");
  }

  const result = await Leave.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
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
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
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

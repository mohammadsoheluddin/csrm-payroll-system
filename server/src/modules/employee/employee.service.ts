import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "./employee.model";
import { TEmployee } from "./employee.interface";
import Branch from "../branch/branch.model";
import Department from "../department/department.model";

const createEmployeeIntoDB = async (payload: TEmployee) => {
  const existingEmployee = await Employee.findOne({
    $or: [{ employeeId: payload.employeeId }, { email: payload.email }],
  });

  if (existingEmployee) {
    throw new AppError(409, "Employee already exists with this ID or email");
  }

  if (!mongoose.isValidObjectId(payload.branch)) {
    throw new AppError(400, "Invalid branch ID");
  }

  if (!mongoose.isValidObjectId(payload.department)) {
    throw new AppError(400, "Invalid department ID");
  }

  const isBranchExists = await Branch.findById(payload.branch);
  if (!isBranchExists) {
    throw new AppError(404, "Branch not found");
  }

  const isDepartmentExists = await Department.findById(payload.department);
  if (!isDepartmentExists) {
    throw new AppError(404, "Department not found");
  }

  const result = await Employee.create(payload);

  const populatedResult = await Employee.findById(result._id)
    .populate("branch")
    .populate("department");

  return populatedResult;
};

const getAllEmployeesFromDB = async (status?: string) => {
  const query: Record<string, unknown> = { isDeleted: false };

  if (status) {
    query.status = status;
  }

  const result = await Employee.find(query)
    .populate("branch")
    .populate("department");

  return result;
};

const getSingleEmployeeFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const result = await Employee.findOne({ _id: id, isDeleted: false })
    .populate("branch")
    .populate("department");

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const updateEmployeeIntoDB = async (
  id: string,
  payload: Partial<TEmployee>,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid employee ID");
  }

  if (payload.branch) {
    if (!mongoose.isValidObjectId(payload.branch)) {
      throw new AppError(400, "Invalid branch ID");
    }

    const isBranchExists = await Branch.findById(payload.branch);
    if (!isBranchExists) {
      throw new AppError(404, "Branch not found");
    }
  }

  if (payload.department) {
    if (!mongoose.isValidObjectId(payload.department)) {
      throw new AppError(400, "Invalid department ID");
    }

    const isDepartmentExists = await Department.findById(payload.department);
    if (!isDepartmentExists) {
      throw new AppError(404, "Department not found");
    }
  }

  if (payload.email) {
    const existingEmployeeByEmail = await Employee.findOne({
      email: payload.email,
      _id: { $ne: id },
    });

    if (existingEmployeeByEmail) {
      throw new AppError(
        409,
        "Another employee already exists with this email",
      );
    }
  }

  if (payload.employeeId) {
    const existingEmployeeById = await Employee.findOne({
      employeeId: payload.employeeId,
      _id: { $ne: id },
    });

    if (existingEmployeeById) {
      throw new AppError(
        409,
        "Another employee already exists with this employee ID",
      );
    }
  }

  const result = await Employee.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  )
    .populate("branch")
    .populate("department");

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const deleteEmployeeFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const result = await Employee.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

export const EmployeeServices = {
  createEmployeeIntoDB,
  getAllEmployeesFromDB,
  getSingleEmployeeFromDB,
  updateEmployeeIntoDB,
  deleteEmployeeFromDB,
};

import AppError from "../../errors/AppError";
import Employee from "./employee.model";
import { TEmployee } from "./employee.interface";

const createEmployeeIntoDB = async (payload: TEmployee) => {
  const existingEmployee = await Employee.findOne({
    $or: [{ employeeId: payload.employeeId }, { email: payload.email }],
  });

  if (existingEmployee) {
    throw new AppError(409, "Employee already exists with this ID or email");
  }

  const result = await Employee.create(payload);
  return result;
};

const getAllEmployeesFromDB = async (status?: string) => {
  const query: Record<string, unknown> = { isDeleted: false };

  if (status) {
    query.status = status;
  }

  const result = await Employee.find(query);
  return result;
};

const getSingleEmployeeFromDB = async (id: string) => {
  const result = await Employee.findOne({ _id: id, isDeleted: false });

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const updateEmployeeIntoDB = async (
  id: string,
  payload: Partial<TEmployee>,
) => {
  const result = await Employee.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const deleteEmployeeFromDB = async (id: string) => {
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

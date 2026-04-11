import AppError from "../../errors/AppError";
import Department from "./department.model";
import { TDepartment } from "./department.interface";

const createDepartmentIntoDB = async (payload: TDepartment) => {
  const existingDepartment = await Department.findOne({
    $or: [{ name: payload.name }, { code: payload.code }],
  });

  if (existingDepartment) {
    throw new AppError(409, "Department already exists with this name or code");
  }

  const result = await Department.create(payload);
  return result;
};

const getAllDepartmentsFromDB = async (status?: string) => {
  const query: Record<string, unknown> = { isDeleted: false };

  if (status) {
    query.status = status;
  }

  const result = await Department.find(query);
  return result;
};

const getSingleDepartmentFromDB = async (id: string) => {
  const result = await Department.findOne({ _id: id, isDeleted: false });

  if (!result) {
    throw new AppError(404, "Department not found");
  }

  return result;
};

const updateDepartmentIntoDB = async (
  id: string,
  payload: Partial<TDepartment>,
) => {
  const result = await Department.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Department not found");
  }

  return result;
};

const deleteDepartmentFromDB = async (id: string) => {
  const result = await Department.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Department not found");
  }

  return result;
};

export const DepartmentServices = {
  createDepartmentIntoDB,
  getAllDepartmentsFromDB,
  getSingleDepartmentFromDB,
  updateDepartmentIntoDB,
  deleteDepartmentFromDB,
};

import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import MajorDepartment from "../majorDepartment/majorDepartment.model";
import type { TDepartment, TDepartmentStatus } from "./department.interface";
import Department from "./department.model";

type TCreateDepartmentPayload = Omit<
  TDepartment,
  "company" | "majorDepartment"
> & {
  company: string | mongoose.Types.ObjectId;
  majorDepartment: string | mongoose.Types.ObjectId;
};

type TUpdateDepartmentPayload = Partial<
  Omit<TDepartment, "company" | "majorDepartment">
> & {
  company?: string | mongoose.Types.ObjectId;
  majorDepartment?: string | mongoose.Types.ObjectId;
};

type TDepartmentDBQuery = {
  isDeleted: boolean;
  company?: mongoose.Types.ObjectId;
  majorDepartment?: mongoose.Types.ObjectId;
  status?: TDepartmentStatus;
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

const toObjectId = (value: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(String(value));
};

const ensureCompanyExists = async (companyId: unknown) => {
  const companyObjectId = toObjectId(companyId, "company ID");

  const company = await Company.findOne({
    _id: companyObjectId,
    isDeleted: false,
  });

  if (!company) {
    throw new AppError(404, "Company not found");
  }

  return companyObjectId;
};

const ensureMajorDepartmentExists = async ({
  company,
  majorDepartment,
}: {
  company: mongoose.Types.ObjectId;
  majorDepartment: unknown;
}) => {
  const majorDepartmentObjectId = toObjectId(
    majorDepartment,
    "major department ID",
  );

  const majorDepartmentDoc = await MajorDepartment.findOne({
    _id: majorDepartmentObjectId,
    company,
    isDeleted: false,
  });

  if (!majorDepartmentDoc) {
    throw new AppError(404, "Major department not found under this company");
  }

  return majorDepartmentObjectId;
};

const ensureUniqueDepartment = async ({
  company,
  majorDepartment,
  name,
  code,
  excludeDepartmentId,
}: {
  company: mongoose.Types.ObjectId;
  majorDepartment: mongoose.Types.ObjectId;
  name?: string;
  code?: string;
  excludeDepartmentId?: string;
}) => {
  const conditions = [];

  if (name) {
    conditions.push({
      name,
    });
  }

  if (code) {
    conditions.push({
      code,
    });
  }

  if (!conditions.length) {
    return;
  }

  const existingDepartment = await Department.findOne({
    company,
    majorDepartment,
    isDeleted: false,
    $or: conditions,
    ...(excludeDepartmentId
      ? {
          _id: {
            $ne: toObjectId(excludeDepartmentId, "department ID"),
          },
        }
      : {}),
  });

  if (existingDepartment) {
    throw new AppError(
      409,
      "Department already exists with this name or code under this major department",
    );
  }
};

const createDepartmentIntoDB = async (payload: TCreateDepartmentPayload) => {
  const companyObjectId = await ensureCompanyExists(payload.company);

  const majorDepartmentObjectId = await ensureMajorDepartmentExists({
    company: companyObjectId,
    majorDepartment: payload.majorDepartment,
  });

  await ensureUniqueDepartment({
    company: companyObjectId,
    majorDepartment: majorDepartmentObjectId,
    name: payload.name,
    code: payload.code,
  });

  const result = await Department.create({
    ...payload,
    company: companyObjectId,
    majorDepartment: majorDepartmentObjectId,
  });

  const populatedResult = await Department.findById(result._id)
    .populate("company")
    .populate("majorDepartment");

  return populatedResult;
};

const getAllDepartmentsFromDB = async (query: Record<string, unknown>) => {
  const filter: TDepartmentDBQuery = {
    isDeleted: false,
  };

  const company = getStringQueryValue(query, "company");
  const majorDepartment = getStringQueryValue(query, "majorDepartment");
  const status = getStringQueryValue(query, "status");

  if (company) {
    filter.company = toObjectId(company, "company ID");
  }

  if (majorDepartment) {
    filter.majorDepartment = toObjectId(majorDepartment, "major department ID");
  }

  if (status) {
    filter.status = status as TDepartmentStatus;
  }

  const result = await Department.find(filter)
    .populate("company")
    .populate("majorDepartment")
    .sort({
      sortOrder: 1,
      name: 1,
    });

  return result;
};

const getSingleDepartmentFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid department ID");
  }

  const result = await Department.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("company")
    .populate("majorDepartment");

  if (!result) {
    throw new AppError(404, "Department not found");
  }

  return result;
};

const updateDepartmentIntoDB = async (
  id: string,
  payload: TUpdateDepartmentPayload,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid department ID");
  }

  const existingDepartment = await Department.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingDepartment) {
    throw new AppError(404, "Department not found");
  }

  const nextCompany = payload.company
    ? await ensureCompanyExists(payload.company)
    : existingDepartment.company;

  const nextMajorDepartment = payload.majorDepartment
    ? await ensureMajorDepartmentExists({
        company: nextCompany,
        majorDepartment: payload.majorDepartment,
      })
    : await ensureMajorDepartmentExists({
        company: nextCompany,
        majorDepartment: existingDepartment.majorDepartment,
      });

  await ensureUniqueDepartment({
    company: nextCompany,
    majorDepartment: nextMajorDepartment,
    name: payload.name,
    code: payload.code,
    excludeDepartmentId: id,
  });

  const result = await Department.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...payload,
      company: nextCompany,
      majorDepartment: nextMajorDepartment,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("company")
    .populate("majorDepartment");

  if (!result) {
    throw new AppError(404, "Department not found");
  }

  return result;
};

const deleteDepartmentFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid department ID");
  }

  const result = await Department.findOneAndUpdate(
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
  )
    .populate("company")
    .populate("majorDepartment");

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

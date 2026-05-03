import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import type {
  TMajorDepartment,
  TMajorDepartmentStatus,
} from "./majorDepartment.interface";
import MajorDepartment from "./majorDepartment.model";

type TCreateMajorDepartmentPayload = Omit<TMajorDepartment, "company"> & {
  company: string | mongoose.Types.ObjectId;
};

type TUpdateMajorDepartmentPayload = Partial<
  Omit<TMajorDepartment, "company">
> & {
  company?: string | mongoose.Types.ObjectId;
};

type TMajorDepartmentDBQuery = {
  isDeleted: boolean;
  company?: mongoose.Types.ObjectId;
  status?: TMajorDepartmentStatus;
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

const ensureUniqueMajorDepartment = async ({
  company,
  name,
  code,
  excludeMajorDepartmentId,
}: {
  company: mongoose.Types.ObjectId;
  name?: string;
  code?: string;
  excludeMajorDepartmentId?: string;
}) => {
  const conditions = [];

  if (name) {
    conditions.push({ name });
  }

  if (code) {
    conditions.push({ code });
  }

  if (!conditions.length) {
    return;
  }

  const existingMajorDepartment = await MajorDepartment.findOne({
    company,
    isDeleted: false,
    $or: conditions,
    ...(excludeMajorDepartmentId
      ? {
          _id: {
            $ne: toObjectId(excludeMajorDepartmentId, "major department ID"),
          },
        }
      : {}),
  });

  if (existingMajorDepartment) {
    throw new AppError(
      409,
      "Major department already exists with this name or code under this company",
    );
  }
};

const createMajorDepartmentIntoDB = async (
  payload: TCreateMajorDepartmentPayload,
) => {
  const companyObjectId = await ensureCompanyExists(payload.company);

  await ensureUniqueMajorDepartment({
    company: companyObjectId,
    name: payload.name,
    code: payload.code,
  });

  const result = await MajorDepartment.create({
    ...payload,
    company: companyObjectId,
  });

  const populatedResult = await MajorDepartment.findById(result._id).populate(
    "company",
  );

  return populatedResult;
};

const getAllMajorDepartmentsFromDB = async (query: Record<string, unknown>) => {
  const filter: TMajorDepartmentDBQuery = {
    isDeleted: false,
  };

  const company = getStringQueryValue(query, "company");
  const status = getStringQueryValue(query, "status");

  if (company) {
    filter.company = toObjectId(company, "company ID");
  }

  if (status) {
    filter.status = status as TMajorDepartmentStatus;
  }

  const result = await MajorDepartment.find(filter).populate("company").sort({
    sortOrder: 1,
    name: 1,
  });

  return result;
};

const getSingleMajorDepartmentFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid major department ID");
  }

  const result = await MajorDepartment.findOne({
    _id: id,
    isDeleted: false,
  }).populate("company");

  if (!result) {
    throw new AppError(404, "Major department not found");
  }

  return result;
};

const updateMajorDepartmentIntoDB = async (
  id: string,
  payload: TUpdateMajorDepartmentPayload,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid major department ID");
  }

  const existingMajorDepartment = await MajorDepartment.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingMajorDepartment) {
    throw new AppError(404, "Major department not found");
  }

  const nextCompany = payload.company
    ? await ensureCompanyExists(payload.company)
    : existingMajorDepartment.company;

  await ensureUniqueMajorDepartment({
    company: nextCompany,
    name: payload.name,
    code: payload.code,
    excludeMajorDepartmentId: id,
  });

  const result = await MajorDepartment.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...payload,
      company: nextCompany,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Major department not found");
  }

  return result;
};

const deleteMajorDepartmentFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid major department ID");
  }

  const result = await MajorDepartment.findOneAndUpdate(
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
    throw new AppError(404, "Major department not found");
  }

  return result;
};

export const MajorDepartmentServices = {
  createMajorDepartmentIntoDB,
  getAllMajorDepartmentsFromDB,
  getSingleMajorDepartmentFromDB,
  updateMajorDepartmentIntoDB,
  deleteMajorDepartmentFromDB,
};

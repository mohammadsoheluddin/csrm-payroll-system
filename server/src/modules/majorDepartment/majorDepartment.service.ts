import mongoose from "mongoose";
import {
  buildActiveFilter,
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import Department from "../department/department.model";
import Employee from "../employee/employee.model";
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
  company?: mongoose.Types.ObjectId;
  status?: TMajorDepartmentStatus;
};

type TSoftDeleteOptions = {
  userId?: string;
  deleteReason?: string | null;
};

type TRestoreOptions = {
  userId?: string;
  restoreReason?: string | null;
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

const buildMajorDepartmentFilterFromQuery = (query: Record<string, unknown>) => {
  const filter: TMajorDepartmentDBQuery = {};

  const company = getStringQueryValue(query, "company");
  const status = getStringQueryValue(query, "status");

  if (company) {
    filter.company = toObjectId(company, "company ID");
  }

  if (status) {
    filter.status = status as TMajorDepartmentStatus;
  }

  return filter;
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
  const filter = buildMajorDepartmentFilterFromQuery(query);

  const result = await MajorDepartment.find(
    buildActiveFilter<TMajorDepartment>(filter),
  )
    .populate("company")
    .sort({
      sortOrder: 1,
      name: 1,
    });

  return result;
};

const getDeletedMajorDepartmentsFromDB = async (
  query: Record<string, unknown>,
) => {
  const filter = buildMajorDepartmentFilterFromQuery(query);

  const result = await MajorDepartment.find(
    buildDeletedFilter<TMajorDepartment>(filter),
  )
    .populate("company")
    .sort({
      deletedAt: -1,
      name: 1,
    });

  return result;
};

const getSingleMajorDepartmentFromDB = async (id: string) => {
  toObjectId(id, "major department ID");

  const result = await MajorDepartment.findOne(
    buildActiveFilter<TMajorDepartment>({ _id: id }),
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Major department not found");
  }

  return result;
};

const getSingleDeletedMajorDepartmentFromDB = async (id: string) => {
  toObjectId(id, "major department ID");

  const result = await MajorDepartment.findOne(
    buildDeletedFilter<TMajorDepartment>({ _id: id }),
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Deleted major department not found");
  }

  return result;
};

const updateMajorDepartmentIntoDB = async (
  id: string,
  payload: TUpdateMajorDepartmentPayload,
) => {
  toObjectId(id, "major department ID");

  const existingMajorDepartment = await MajorDepartment.findOne(
    buildActiveFilter<TMajorDepartment>({ _id: id }),
  );

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
    buildActiveFilter<TMajorDepartment>({ _id: id }),
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

const deleteMajorDepartmentFromDB = async (
  id: string,
  options?: TSoftDeleteOptions,
) => {
  toObjectId(id, "major department ID");

  const activeDepartment = await Department.findOne({
    majorDepartment: id,
    isDeleted: false,
  }).select("_id name code");

  if (activeDepartment) {
    throw new AppError(
      409,
      "This major department has active departments. Delete or reassign them first.",
    );
  }

  const activeEmployee = await Employee.findOne({
    majorDepartment: id,
    isDeleted: false,
  }).select("_id employeeId");

  if (activeEmployee) {
    throw new AppError(
      409,
      "This major department is assigned to active employees. Reassign employees before deleting this major department.",
    );
  }

  const result = await MajorDepartment.findOneAndUpdate(
    buildActiveFilter<TMajorDepartment>({ _id: id }),
    buildSoftDeleteUpdate<TMajorDepartment>({
      userId: options?.userId,
      deleteReason: options?.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Major department not found or already deleted");
  }

  return result;
};

const restoreMajorDepartmentIntoDB = async (
  id: string,
  options?: TRestoreOptions,
) => {
  const deletedMajorDepartment =
    await getSingleDeletedMajorDepartmentFromDB(id);
  const companyObjectId = await ensureCompanyExists(
    deletedMajorDepartment.company,
  );

  await ensureUniqueMajorDepartment({
    company: companyObjectId,
    name: deletedMajorDepartment.name,
    code: deletedMajorDepartment.code,
    excludeMajorDepartmentId: id,
  });

  const result = await MajorDepartment.findOneAndUpdate(
    buildDeletedFilter<TMajorDepartment>({ _id: id }),
    buildRestoreUpdate<TMajorDepartment>({
      userId: options?.userId,
      restoreReason: options?.restoreReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Deleted major department not found");
  }

  return result;
};

export const MajorDepartmentServices = {
  createMajorDepartmentIntoDB,
  getAllMajorDepartmentsFromDB,
  getDeletedMajorDepartmentsFromDB,
  getSingleMajorDepartmentFromDB,
  getSingleDeletedMajorDepartmentFromDB,
  updateMajorDepartmentIntoDB,
  deleteMajorDepartmentFromDB,
  restoreMajorDepartmentIntoDB,
};

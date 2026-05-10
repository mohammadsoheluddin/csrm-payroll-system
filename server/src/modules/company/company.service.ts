import mongoose from "mongoose";
import {
  buildActiveFilter,
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Department from "../department/department.model";
import Designation from "../designation/designation.model";
import Employee from "../employee/employee.model";
import MajorDepartment from "../majorDepartment/majorDepartment.model";
import type {
  TCompany,
  TCompanyStatus,
  TCompanyType,
} from "./company.interface";
import Company from "./company.model";

type TCreateCompanyPayload = TCompany;
type TUpdateCompanyPayload = Partial<TCompany>;

type TCompanyDBQuery = {
  status?: TCompanyStatus;
  type?: TCompanyType;
  parentCompany?: mongoose.Types.ObjectId;
  isPrimary?: boolean;
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

const ensureParentCompanyExists = async (parentCompanyId?: unknown) => {
  if (!parentCompanyId) {
    return null;
  }

  const parentCompanyObjectId = toObjectId(
    parentCompanyId,
    "parent company ID",
  );

  const parentCompany = await Company.findOne(
    buildActiveFilter<TCompany>({ _id: parentCompanyObjectId }),
  );

  if (!parentCompany) {
    throw new AppError(404, "Parent company not found");
  }

  return parentCompany;
};

const ensureUniqueCompanyNameOrCode = async ({
  name,
  code,
  excludeCompanyId,
}: {
  name?: string;
  code?: string;
  excludeCompanyId?: string;
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

  const existingCompany = await Company.findOne({
    isDeleted: false,
    $or: conditions,
    ...(excludeCompanyId
      ? {
          _id: {
            $ne: toObjectId(excludeCompanyId, "company ID"),
          },
        }
      : {}),
  });

  if (existingCompany) {
    throw new AppError(409, "Company already exists with this name or code");
  }
};

const buildCompanyFilterFromQuery = (query: Record<string, unknown>) => {
  const filter: TCompanyDBQuery = {};

  const status = getStringQueryValue(query, "status");
  const type = getStringQueryValue(query, "type");
  const parentCompany = getStringQueryValue(query, "parentCompany");
  const isPrimary = getStringQueryValue(query, "isPrimary");

  if (status) {
    filter.status = status as TCompanyStatus;
  }

  if (type) {
    filter.type = type as TCompanyType;
  }

  if (parentCompany) {
    filter.parentCompany = toObjectId(parentCompany, "parent company ID");
  }

  if (isPrimary === "true") {
    filter.isPrimary = true;
  }

  if (isPrimary === "false") {
    filter.isPrimary = false;
  }

  return filter;
};

const createCompanyIntoDB = async (payload: TCreateCompanyPayload) => {
  await ensureUniqueCompanyNameOrCode({
    name: payload.name,
    code: payload.code,
  });

  await ensureParentCompanyExists(payload.parentCompany);

  const result = await Company.create(payload);

  const populatedResult = await Company.findById(result._id).populate(
    "parentCompany",
  );

  return populatedResult;
};

const getAllCompaniesFromDB = async (query: Record<string, unknown>) => {
  const filter = buildCompanyFilterFromQuery(query);

  const result = await Company.find(buildActiveFilter<TCompany>(filter))
    .populate("parentCompany")
    .sort({
      isPrimary: -1,
      name: 1,
    });

  return result;
};

const getDeletedCompaniesFromDB = async (query: Record<string, unknown>) => {
  const filter = buildCompanyFilterFromQuery(query);

  const result = await Company.find(buildDeletedFilter<TCompany>(filter))
    .populate("parentCompany")
    .sort({
      deletedAt: -1,
      name: 1,
    });

  return result;
};

const getSingleCompanyFromDB = async (id: string) => {
  toObjectId(id, "company ID");

  const result = await Company.findOne(
    buildActiveFilter<TCompany>({ _id: id }),
  ).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Company not found");
  }

  return result;
};

const getSingleDeletedCompanyFromDB = async (id: string) => {
  toObjectId(id, "company ID");

  const result = await Company.findOne(
    buildDeletedFilter<TCompany>({ _id: id }),
  ).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Deleted company not found");
  }

  return result;
};

const updateCompanyIntoDB = async (
  id: string,
  payload: TUpdateCompanyPayload,
) => {
  toObjectId(id, "company ID");

  const existingCompany = await Company.findOne(
    buildActiveFilter<TCompany>({ _id: id }),
  );

  if (!existingCompany) {
    throw new AppError(404, "Company not found");
  }

  await ensureUniqueCompanyNameOrCode({
    name: payload.name,
    code: payload.code,
    excludeCompanyId: id,
  });

  if (payload.parentCompany) {
    const parentCompanyObjectId = toObjectId(
      payload.parentCompany,
      "parent company ID",
    );

    if (String(parentCompanyObjectId) === id) {
      throw new AppError(400, "A company cannot be its own parent company");
    }

    await ensureParentCompanyExists(payload.parentCompany);
  }

  const result = await Company.findOneAndUpdate(
    buildActiveFilter<TCompany>({ _id: id }),
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Company not found");
  }

  return result;
};

const ensureCompanyCanBeDeleted = async (id: string) => {
  const childCompany = await Company.findOne({
    parentCompany: id,
    isDeleted: false,
  });

  if (childCompany) {
    throw new AppError(
      409,
      "This company has child concerns/units. Delete or reassign them first.",
    );
  }

  const activeMajorDepartment = await MajorDepartment.findOne({
    company: id,
    isDeleted: false,
  }).select("_id name code");

  if (activeMajorDepartment) {
    throw new AppError(
      409,
      "This company has active major departments. Delete or reassign them first.",
    );
  }

  const activeDepartment = await Department.findOne({
    company: id,
    isDeleted: false,
  }).select("_id name code");

  if (activeDepartment) {
    throw new AppError(
      409,
      "This company has active departments. Delete or reassign them first.",
    );
  }

  const activeDesignation = await Designation.findOne({
    company: id,
    isDeleted: false,
  }).select("_id name code");

  if (activeDesignation) {
    throw new AppError(
      409,
      "This company has active designations. Delete or reassign them first.",
    );
  }

  const activeEmployee = await Employee.findOne({
    company: id,
    isDeleted: false,
  }).select("_id employeeId");

  if (activeEmployee) {
    throw new AppError(
      409,
      "This company is assigned to active employees. Reassign employees before deleting this company.",
    );
  }
};

const deleteCompanyFromDB = async (id: string, options?: TSoftDeleteOptions) => {
  toObjectId(id, "company ID");

  await ensureCompanyCanBeDeleted(id);

  const result = await Company.findOneAndUpdate(
    buildActiveFilter<TCompany>({ _id: id }),
    buildSoftDeleteUpdate<TCompany>({
      userId: options?.userId,
      deleteReason: options?.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Company not found or already deleted");
  }

  return result;
};

const restoreCompanyIntoDB = async (id: string, options?: TRestoreOptions) => {
  const deletedCompany = await getSingleDeletedCompanyFromDB(id);

  await ensureUniqueCompanyNameOrCode({
    name: deletedCompany.name,
    code: deletedCompany.code,
    excludeCompanyId: id,
  });

  if (deletedCompany.parentCompany) {
    await ensureParentCompanyExists(deletedCompany.parentCompany);
  }

  const result = await Company.findOneAndUpdate(
    buildDeletedFilter<TCompany>({ _id: id }),
    buildRestoreUpdate<TCompany>({
      userId: options?.userId,
      restoreReason: options?.restoreReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Deleted company not found");
  }

  return result;
};

export const CompanyServices = {
  createCompanyIntoDB,
  getAllCompaniesFromDB,
  getDeletedCompaniesFromDB,
  getSingleCompanyFromDB,
  getSingleDeletedCompanyFromDB,
  updateCompanyIntoDB,
  deleteCompanyFromDB,
  restoreCompanyIntoDB,
};

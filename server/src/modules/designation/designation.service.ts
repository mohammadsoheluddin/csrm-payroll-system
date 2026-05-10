import mongoose from "mongoose";
import {
  buildActiveFilter,
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import Employee from "../employee/employee.model";
import type {
  TDesignation,
  TDesignationCategory,
  TDesignationStatus,
} from "./designation.interface";
import Designation from "./designation.model";

type TCreateDesignationPayload = Omit<TDesignation, "company"> & {
  company: string | mongoose.Types.ObjectId;
};

type TUpdateDesignationPayload = Partial<Omit<TDesignation, "company">> & {
  company?: string | mongoose.Types.ObjectId;
};

type TDesignationDBQuery = {
  company?: mongoose.Types.ObjectId;
  category?: TDesignationCategory;
  status?: TDesignationStatus;
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

const ensureUniqueDesignation = async ({
  company,
  name,
  code,
  excludeDesignationId,
}: {
  company: mongoose.Types.ObjectId;
  name?: string;
  code?: string;
  excludeDesignationId?: string;
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

  const existingDesignation = await Designation.findOne({
    company,
    isDeleted: false,
    $or: conditions,
    ...(excludeDesignationId
      ? {
          _id: {
            $ne: toObjectId(excludeDesignationId, "designation ID"),
          },
        }
      : {}),
  });

  if (existingDesignation) {
    throw new AppError(
      409,
      "Designation already exists with this name or code under this company",
    );
  }
};

const buildDesignationFilterFromQuery = (query: Record<string, unknown>) => {
  const filter: TDesignationDBQuery = {};

  const company = getStringQueryValue(query, "company");
  const category = getStringQueryValue(query, "category");
  const status = getStringQueryValue(query, "status");

  if (company) {
    filter.company = toObjectId(company, "company ID");
  }

  if (category) {
    filter.category = category as TDesignationCategory;
  }

  if (status) {
    filter.status = status as TDesignationStatus;
  }

  return filter;
};

const createDesignationIntoDB = async (payload: TCreateDesignationPayload) => {
  const companyObjectId = await ensureCompanyExists(payload.company);

  await ensureUniqueDesignation({
    company: companyObjectId,
    name: payload.name,
    code: payload.code,
  });

  const result = await Designation.create({
    ...payload,
    company: companyObjectId,
  });

  const populatedResult = await Designation.findById(result._id).populate(
    "company",
  );

  return populatedResult;
};

const getAllDesignationsFromDB = async (query: Record<string, unknown>) => {
  const filter = buildDesignationFilterFromQuery(query);

  const result = await Designation.find(buildActiveFilter<TDesignation>(filter))
    .populate("company")
    .sort({
      sortOrder: 1,
      name: 1,
    });

  return result;
};

const getDeletedDesignationsFromDB = async (query: Record<string, unknown>) => {
  const filter = buildDesignationFilterFromQuery(query);

  const result = await Designation.find(buildDeletedFilter<TDesignation>(filter))
    .populate("company")
    .sort({
      deletedAt: -1,
      name: 1,
    });

  return result;
};

const getSingleDesignationFromDB = async (id: string) => {
  toObjectId(id, "designation ID");

  const result = await Designation.findOne(
    buildActiveFilter<TDesignation>({ _id: id }),
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Designation not found");
  }

  return result;
};

const getSingleDeletedDesignationFromDB = async (id: string) => {
  toObjectId(id, "designation ID");

  const result = await Designation.findOne(
    buildDeletedFilter<TDesignation>({ _id: id }),
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Deleted designation not found");
  }

  return result;
};

const updateDesignationIntoDB = async (
  id: string,
  payload: TUpdateDesignationPayload,
) => {
  toObjectId(id, "designation ID");

  const existingDesignation = await Designation.findOne(
    buildActiveFilter<TDesignation>({ _id: id }),
  );

  if (!existingDesignation) {
    throw new AppError(404, "Designation not found");
  }

  const nextCompany = payload.company
    ? await ensureCompanyExists(payload.company)
    : existingDesignation.company;

  await ensureUniqueDesignation({
    company: nextCompany,
    name: payload.name,
    code: payload.code,
    excludeDesignationId: id,
  });

  const result = await Designation.findOneAndUpdate(
    buildActiveFilter<TDesignation>({ _id: id }),
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
    throw new AppError(404, "Designation not found");
  }

  return result;
};

const deleteDesignationFromDB = async (
  id: string,
  options?: TSoftDeleteOptions,
) => {
  toObjectId(id, "designation ID");

  const activeEmployee = await Employee.findOne({
    designation: id,
    isDeleted: false,
  }).select("_id employeeId");

  if (activeEmployee) {
    throw new AppError(
      409,
      "This designation is assigned to active employees. Reassign employees before deleting this designation.",
    );
  }

  const result = await Designation.findOneAndUpdate(
    buildActiveFilter<TDesignation>({ _id: id }),
    buildSoftDeleteUpdate<TDesignation>({
      userId: options?.userId,
      deleteReason: options?.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Designation not found or already deleted");
  }

  return result;
};

const restoreDesignationIntoDB = async (
  id: string,
  options?: TRestoreOptions,
) => {
  const deletedDesignation = await getSingleDeletedDesignationFromDB(id);
  const companyObjectId = await ensureCompanyExists(deletedDesignation.company);

  await ensureUniqueDesignation({
    company: companyObjectId,
    name: deletedDesignation.name,
    code: deletedDesignation.code,
    excludeDesignationId: id,
  });

  const result = await Designation.findOneAndUpdate(
    buildDeletedFilter<TDesignation>({ _id: id }),
    buildRestoreUpdate<TDesignation>({
      userId: options?.userId,
      restoreReason: options?.restoreReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Deleted designation not found");
  }

  return result;
};

export const DesignationServices = {
  createDesignationIntoDB,
  getAllDesignationsFromDB,
  getDeletedDesignationsFromDB,
  getSingleDesignationFromDB,
  getSingleDeletedDesignationFromDB,
  updateDesignationIntoDB,
  deleteDesignationFromDB,
  restoreDesignationIntoDB,
};

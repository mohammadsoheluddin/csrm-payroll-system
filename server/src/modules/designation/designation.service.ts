import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
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
  isDeleted: boolean;
  company?: mongoose.Types.ObjectId;
  category?: TDesignationCategory;
  status?: TDesignationStatus;
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
  const filter: TDesignationDBQuery = {
    isDeleted: false,
  };

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

  const result = await Designation.find(filter).populate("company").sort({
    sortOrder: 1,
    name: 1,
  });

  return result;
};

const getSingleDesignationFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid designation ID");
  }

  const result = await Designation.findOne({
    _id: id,
    isDeleted: false,
  }).populate("company");

  if (!result) {
    throw new AppError(404, "Designation not found");
  }

  return result;
};

const updateDesignationIntoDB = async (
  id: string,
  payload: TUpdateDesignationPayload,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid designation ID");
  }

  const existingDesignation = await Designation.findOne({
    _id: id,
    isDeleted: false,
  });

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
    throw new AppError(404, "Designation not found");
  }

  return result;
};

const deleteDesignationFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid designation ID");
  }

  const result = await Designation.findOneAndUpdate(
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
  ).populate("company");

  if (!result) {
    throw new AppError(404, "Designation not found");
  }

  return result;
};

export const DesignationServices = {
  createDesignationIntoDB,
  getAllDesignationsFromDB,
  getSingleDesignationFromDB,
  updateDesignationIntoDB,
  deleteDesignationFromDB,
};

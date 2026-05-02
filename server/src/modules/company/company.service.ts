import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import type {
  TCompany,
  TCompanyStatus,
  TCompanyType,
} from "./company.interface";
import Company from "./company.model";

type TCreateCompanyPayload = TCompany;
type TUpdateCompanyPayload = Partial<TCompany>;

type TCompanyDBQuery = {
  isDeleted: boolean;
  status?: TCompanyStatus;
  type?: TCompanyType;
  parentCompany?: mongoose.Types.ObjectId;
  isPrimary?: boolean;
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

  const parentCompany = await Company.findOne({
    _id: parentCompanyObjectId,
    isDeleted: false,
  });

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
  const filter: TCompanyDBQuery = {
    isDeleted: false,
  };

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

  const result = await Company.find(filter).populate("parentCompany").sort({
    isPrimary: -1,
    name: 1,
  });

  return result;
};

const getSingleCompanyFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid company ID");
  }

  const result = await Company.findOne({
    _id: id,
    isDeleted: false,
  }).populate("parentCompany");

  if (!result) {
    throw new AppError(404, "Company not found");
  }

  return result;
};

const updateCompanyIntoDB = async (
  id: string,
  payload: TUpdateCompanyPayload,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid company ID");
  }

  const existingCompany = await Company.findOne({
    _id: id,
    isDeleted: false,
  });

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
    {
      _id: id,
      isDeleted: false,
    },
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

const deleteCompanyFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid company ID");
  }

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

  const result = await Company.findOneAndUpdate(
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
    throw new AppError(404, "Company not found");
  }

  return result;
};

export const CompanyServices = {
  createCompanyIntoDB,
  getAllCompaniesFromDB,
  getSingleCompanyFromDB,
  updateCompanyIntoDB,
  deleteCompanyFromDB,
};

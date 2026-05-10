import mongoose from "mongoose";
import {
  buildActiveFilter,
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import type { TBranch, TBranchStatus } from "./branch.interface";
import Branch from "./branch.model";

type TBranchDBQuery = {
  status?: TBranchStatus;
};

type TSoftDeleteOptions = {
  userId?: string;
  deleteReason?: string | null;
};

type TRestoreOptions = {
  userId?: string;
  restoreReason?: string | null;
};

const toObjectId = (value: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(String(value));
};

const ensureUniqueBranchNameOrCode = async ({
  name,
  code,
  excludeBranchId,
}: {
  name?: string;
  code?: string;
  excludeBranchId?: string;
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

  const existingBranch = await Branch.findOne({
    isDeleted: false,
    $or: conditions,
    ...(excludeBranchId
      ? {
          _id: {
            $ne: toObjectId(excludeBranchId, "branch ID"),
          },
        }
      : {}),
  });

  if (existingBranch) {
    throw new AppError(409, "Branch already exists with this name or code");
  }
};

const createBranchIntoDB = async (payload: TBranch) => {
  await ensureUniqueBranchNameOrCode({
    name: payload.name,
    code: payload.code,
  });

  const result = await Branch.create(payload);
  return result;
};

const getAllBranchesFromDB = async (status?: string) => {
  const filter: TBranchDBQuery = {};

  if (status) {
    filter.status = status as TBranchStatus;
  }

  const result = await Branch.find(buildActiveFilter<TBranch>(filter)).sort({
    name: 1,
  });

  return result;
};

const getDeletedBranchesFromDB = async (status?: string) => {
  const filter: TBranchDBQuery = {};

  if (status) {
    filter.status = status as TBranchStatus;
  }

  const result = await Branch.find(buildDeletedFilter<TBranch>(filter)).sort({
    deletedAt: -1,
    name: 1,
  });

  return result;
};

const getSingleBranchFromDB = async (id: string) => {
  toObjectId(id, "branch ID");

  const result = await Branch.findOne(buildActiveFilter<TBranch>({ _id: id }));

  if (!result) {
    throw new AppError(404, "Branch not found");
  }

  return result;
};

const getSingleDeletedBranchFromDB = async (id: string) => {
  toObjectId(id, "branch ID");

  const result = await Branch.findOne(buildDeletedFilter<TBranch>({ _id: id }));

  if (!result) {
    throw new AppError(404, "Deleted branch not found");
  }

  return result;
};

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  toObjectId(id, "branch ID");

  const existingBranch = await Branch.findOne(
    buildActiveFilter<TBranch>({ _id: id }),
  );

  if (!existingBranch) {
    throw new AppError(404, "Branch not found");
  }

  await ensureUniqueBranchNameOrCode({
    name: payload.name,
    code: payload.code,
    excludeBranchId: id,
  });

  const result = await Branch.findOneAndUpdate(
    buildActiveFilter<TBranch>({ _id: id }),
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Branch not found");
  }

  return result;
};

const deleteBranchFromDB = async (id: string, options?: TSoftDeleteOptions) => {
  toObjectId(id, "branch ID");

  const activeEmployee = await Employee.findOne({
    branch: id,
    isDeleted: false,
  }).select("_id employeeId");

  if (activeEmployee) {
    throw new AppError(
      409,
      "This branch is assigned to active employees. Reassign employees before deleting this branch.",
    );
  }

  const result = await Branch.findOneAndUpdate(
    buildActiveFilter<TBranch>({ _id: id }),
    buildSoftDeleteUpdate<TBranch>({
      userId: options?.userId,
      deleteReason: options?.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Branch not found or already deleted");
  }

  return result;
};

const restoreBranchIntoDB = async (id: string, options?: TRestoreOptions) => {
  const deletedBranch = await getSingleDeletedBranchFromDB(id);

  await ensureUniqueBranchNameOrCode({
    name: deletedBranch.name,
    code: deletedBranch.code,
    excludeBranchId: id,
  });

  const result = await Branch.findOneAndUpdate(
    buildDeletedFilter<TBranch>({ _id: id }),
    buildRestoreUpdate<TBranch>({
      userId: options?.userId,
      restoreReason: options?.restoreReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Deleted branch not found");
  }

  return result;
};

export const BranchServices = {
  createBranchIntoDB,
  getAllBranchesFromDB,
  getDeletedBranchesFromDB,
  getSingleBranchFromDB,
  getSingleDeletedBranchFromDB,
  updateBranchIntoDB,
  deleteBranchFromDB,
  restoreBranchIntoDB,
};

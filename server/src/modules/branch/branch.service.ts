import AppError from "../../errors/AppError";
import type { TBranch, TBranchStatus } from "./branch.interface";
import Branch from "./branch.model";

type TBranchDBQuery = {
  isDeleted: boolean;
  status?: TBranchStatus;
};

const createBranchIntoDB = async (payload: TBranch) => {
  const existingBranch = await Branch.findOne({
    $or: [{ name: payload.name }, { code: payload.code }],
  });

  if (existingBranch) {
    throw new AppError(409, "Branch already exists with this name or code");
  }

  const result = await Branch.create(payload);
  return result;
};

const getAllBranchesFromDB = async (status?: string) => {
  const query: TBranchDBQuery = {
    isDeleted: false,
  };

  if (status) {
    query.status = status as TBranchStatus;
  }

  const result = await Branch.find(query);
  return result;
};

const getSingleBranchFromDB = async (id: string) => {
  const result = await Branch.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!result) {
    throw new AppError(404, "Branch not found");
  }

  return result;
};

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
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

const deleteBranchFromDB = async (id: string) => {
  const result = await Branch.findOneAndUpdate(
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
    throw new AppError(404, "Branch not found");
  }

  return result;
};

export const BranchServices = {
  createBranchIntoDB,
  getAllBranchesFromDB,
  getSingleBranchFromDB,
  updateBranchIntoDB,
  deleteBranchFromDB,
};

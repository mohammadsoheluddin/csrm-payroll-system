import AppError from "../../errors/AppError";
import { TBranch } from "./branch.interface";
import Branch from "./branch.model";

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
  /**
   * Fixed:
   * Added proper TypeScript type instead of raw Record.
   */
  const query: Record<string, unknown> = { isDeleted: false };

  if (status) {
    query.status = status;
  }

  const result = await Branch.find(query);

  return result;
};

const getSingleBranchFromDB = async (id: string) => {
  const result = await Branch.findOne({ _id: id, isDeleted: false });

  if (!result) {
    throw new AppError(404, "Branch not found");
  }

  return result;
};

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "Branch not found");
  }

  return result;
};

const deleteBranchFromDB = async (id: string) => {
  const result = await Branch.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
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

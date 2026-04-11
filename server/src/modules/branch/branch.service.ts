import AppError from "../../errors/AppError";
import Branch from "./branch.model";
import { TBranch } from "./branch.interface";

const createBranchIntoDB = async (payload: TBranch) => {
  const existing = await Branch.findOne({
    $or: [{ name: payload.name }, { code: payload.code }],
  });

  if (existing) {
    throw new AppError(409, "Branch already exists");
  }

  return await Branch.create(payload);
};

const getAllBranchesFromDB = async () => {
  return await Branch.find({ isDeleted: false });
};

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true },
  );

  if (!result) throw new AppError(404, "Branch not found");

  return result;
};

const deleteBranchFromDB = async (id: string) => {
  const result = await Branch.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );

  if (!result) throw new AppError(404, "Branch not found");

  return result;
};

export const BranchServices = {
  createBranchIntoDB,
  getAllBranchesFromDB,
  updateBranchIntoDB,
  deleteBranchFromDB,
};

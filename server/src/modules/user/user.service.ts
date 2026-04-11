import AppError from "../../errors/AppError";
import User from "./user.model";

const getMeFromDB = async (email: string) => {
  const result = await User.findOne({ email, isDeleted: false });
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await User.find({ isDeleted: false });
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findOne({ _id: id, isDeleted: false });

  if (!result) {
    throw new AppError(404, "User not found");
  }

  return result;
};

const updateUserIntoDB = async (
  id: string,
  payload: Partial<{
    name: string;
    email: string;
    role: "superAdmin" | "admin" | "hr" | "employee";
  }>,
) => {
  const result = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "User not found");
  }

  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "User not found");
  }

  return result;
};

export const UserServices = {
  getMeFromDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};

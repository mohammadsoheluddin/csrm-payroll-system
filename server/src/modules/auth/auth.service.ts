import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../app/config";
import AppError from "../../errors/AppError";
import createToken from "../../utils/createToken";
import Employee from "../employee/employee.model";
import { TUserRole } from "../user/user.constant";
import User from "../user/user.model";

const registerUserIntoDB = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: TUserRole;
}) => {
  const existingUser = await User.findOne({
    email: payload.email,
    isDeleted: false,
  });

  if (existingUser) {
    throw new AppError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const userPayload = {
    ...payload,
    password: hashedPassword,
  };

  const result = await User.create(userPayload);

  return {
    _id: result._id,
    name: result.name,
    email: result.email,
    role: result.role,
    isDeleted: result.isDeleted,
  };
};

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await User.findOne({
    email: payload.email,
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Password does not match");
  }

  const linkedEmployee = await Employee.findOne({
    user: user._id,
    isDeleted: false,
  }).select("_id");

  const jwtPayload = {
    userId: String(user._id),
    role: user.role,
    email: user.email,
    employeeId: linkedEmployee?._id ? String(linkedEmployee._id) : undefined,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "You are not authorized!");
  }

  let decoded: {
    userId: string;
    role: TUserRole;
    email: string;
    employeeId?: string;
  };

  try {
    decoded = jwt.verify(token, config.jwt_refresh_secret) as {
      userId: string;
      role: TUserRole;
      email: string;
      employeeId?: string;
    };
  } catch {
    throw new AppError(403, "Invalid refresh token!");
  }

  const newAccessToken = createToken(
    {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      employeeId: decoded.employeeId,
    },
    config.jwt_access_secret,
    config.jwt_access_expires,
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  registerUserIntoDB,
  loginUserFromDB,
  refreshToken,
};

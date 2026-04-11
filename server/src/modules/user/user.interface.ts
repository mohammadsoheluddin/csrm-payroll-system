import { Model } from "mongoose";

export type TUserRole = "superAdmin" | "admin" | "hr" | "employee";

export interface TUser {
  name: string;
  email: string;
  password: string;
  role: TUserRole;
  isDeleted?: boolean;
}

export interface UserModel extends Model<TUser> {}

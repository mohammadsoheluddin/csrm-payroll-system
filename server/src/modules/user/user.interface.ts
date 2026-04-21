import { Model } from "mongoose";

export type TUserRole =
  | "super_admin"
  | "admin"
  | "hr"
  | "accounts"
  | "manager"
  | "employee";

export interface TUser {
  name: string;
  email: string;
  password: string;
  role: TUserRole;
  isDeleted?: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;
}

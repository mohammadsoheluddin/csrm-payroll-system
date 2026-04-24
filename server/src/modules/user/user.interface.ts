import { Model } from "mongoose";
import { TUserRole } from "./user.constant";

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

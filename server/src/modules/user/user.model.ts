import { Schema, model } from "mongoose";
import { TUser, TUserRole, UserModel } from "./user.interface";

const userRoles: TUserRole[] = [
  "super_admin",
  "admin",
  "hr",
  "accounts",
  "manager",
  "employee",
];

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "employee",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({
    email,
    isDeleted: false,
  });
};

export const User = model<TUser, UserModel>("User", userSchema);

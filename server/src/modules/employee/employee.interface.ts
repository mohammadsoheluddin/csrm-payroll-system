import { Types } from "mongoose";

export type TGender = "male" | "female" | "other";
export type TEmployeeStatus = "active" | "inactive";

export interface TEmployeeName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TEmployee {
  employeeId: string;
  user?: Types.ObjectId;
  name: TEmployeeName;
  email: string;
  phone: string;
  gender: TGender;
  dateOfBirth?: string;
  joiningDate: string;
  designation: string;
  department: Types.ObjectId;
  branch: Types.ObjectId;
  basicSalary: number;
  status?: TEmployeeStatus;
  isDeleted?: boolean;
}

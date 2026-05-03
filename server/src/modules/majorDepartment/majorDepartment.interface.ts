import { Types } from "mongoose";

export type TMajorDepartmentStatus = "active" | "inactive";

export interface TMajorDepartment {
  company: Types.ObjectId;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  sortOrder?: number;
  status?: TMajorDepartmentStatus;
  isDeleted?: boolean;
}

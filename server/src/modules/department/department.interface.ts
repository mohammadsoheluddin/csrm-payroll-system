import { Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TDepartmentStatus = "active" | "inactive";

export interface TDepartment extends TSoftDeleteFields {
  company: Types.ObjectId;
  majorDepartment: Types.ObjectId;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  sortOrder?: number;
  status?: TDepartmentStatus;
}

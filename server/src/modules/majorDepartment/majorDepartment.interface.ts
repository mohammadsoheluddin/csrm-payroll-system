import { Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TMajorDepartmentStatus = "active" | "inactive";

export interface TMajorDepartment extends TSoftDeleteFields {
  company: Types.ObjectId;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  sortOrder?: number;
  status?: TMajorDepartmentStatus;
}

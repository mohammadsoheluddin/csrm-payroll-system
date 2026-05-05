import { Types } from "mongoose";

export type TDesignationStatus = "active" | "inactive";

export type TDesignationCategory =
  | "management"
  | "officer"
  | "staff"
  | "worker"
  | "technical"
  | "security"
  | "driver"
  | "sales"
  | "other";

export interface TDesignation {
  company: Types.ObjectId;
  name: string;
  code: string;
  shortName?: string;
  category?: TDesignationCategory;
  gradeLevel?: number;
  description?: string;
  sortOrder?: number;
  status?: TDesignationStatus;
  isDeleted?: boolean;
}

import { Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TCompanyStatus = "active" | "inactive";

export type TCompanyType =
  | "company"
  | "concern"
  | "sister_concern"
  | "unit"
  | "project";

export interface TCompany extends TSoftDeleteFields {
  name: string;
  code: string;
  shortName?: string;
  legalName?: string;
  type: TCompanyType;
  parentCompany?: Types.ObjectId;
  isPrimary?: boolean;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tin?: string;
  bin?: string;
  registrationNo?: string;
  logoUrl?: string;
  status?: TCompanyStatus;
  notes?: string;
}

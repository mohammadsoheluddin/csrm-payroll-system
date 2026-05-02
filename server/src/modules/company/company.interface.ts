import { Types } from "mongoose";

export type TCompanyStatus = "active" | "inactive";

export type TCompanyType =
  | "company"
  | "concern"
  | "sister_concern"
  | "unit"
  | "project";

export interface TCompany {
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
  isDeleted?: boolean;
}

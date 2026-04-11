export type TDepartmentStatus = "active" | "inactive";

export interface TDepartment {
  name: string;
  code: string;
  status: TDepartmentStatus;
  isDeleted?: boolean;
}

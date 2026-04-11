export type TBranchStatus = "active" | "inactive";

export interface TBranch {
  name: string;
  code: string;
  address: string;
  status: TBranchStatus;
  isDeleted?: boolean;
}

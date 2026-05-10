import type { TSoftDeleteFields } from "../../common/softDelete";

export type TBranchStatus = "active" | "inactive";

export interface TBranch extends TSoftDeleteFields {
  name: string;
  code: string;
  address: string;
  status: TBranchStatus;
}

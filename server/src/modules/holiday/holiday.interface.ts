import type { TSoftDeleteFields } from "../../common/softDelete";
export type THolidayType =
  | "weekly"
  | "public"
  | "festival"
  | "company"
  | "optional"
  | "eid";

export interface THoliday  extends TSoftDeleteFields {
  holidayName: string;
  holidayDate: string;
  holidayType: THolidayType;
  remarks?: string;
  isDeleted?: boolean;
}

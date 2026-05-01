export type THolidayType =
  | "weekly"
  | "public"
  | "festival"
  | "company"
  | "optional"
  | "eid";

export interface THoliday {
  holidayName: string;
  holidayDate: string;
  holidayType: THolidayType;
  remarks?: string;
  isDeleted?: boolean;
}

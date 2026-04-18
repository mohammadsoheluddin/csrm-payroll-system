export type THolidayType =
  | "weekly"
  | "public"
  | "festival"
  | "company"
  | "optional";

export interface THoliday {
  holidayName: string;
  holidayDate: string;
  holidayType: THolidayType;
  remarks?: string;
  isDeleted?: boolean;
}

import { Types } from "mongoose";

export type TAttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "leave"
  | "half-day"
  | "weekend"
  | "holiday";

export type TAttendanceSource = "manual" | "device" | "import";

export interface TAttendance {
  employee: Types.ObjectId;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: TAttendanceStatus;
  source?: TAttendanceSource;
  remarks?: string;
  deviceId?: string;
  isDeleted?: boolean;
}

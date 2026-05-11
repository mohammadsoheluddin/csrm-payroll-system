import { Types } from "mongoose";
import type { TSoftDeleteFields } from "../../common/softDelete";

export type TAttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "leave"
  | "half-day"
  | "weekend"
  | "holiday";

export type TAttendanceSource = "manual" | "device" | "import";

export interface TAttendance  extends TSoftDeleteFields {
  employee: Types.ObjectId;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: TAttendanceStatus;
  source?: TAttendanceSource;
  remarks?: string;
  deviceId?: string;
  importBatchNo?: string;
  isDeleted?: boolean;
}

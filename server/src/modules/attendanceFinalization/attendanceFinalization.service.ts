import { Types } from "mongoose";
import { buildDeletedFilter, buildRestoreUpdate, buildSoftDeleteUpdate, type TRestoreRequestBody, type TSoftDeleteRequestBody } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Attendance from "../attendance/attendance.model";
import Employee from "../employee/employee.model";
import Holiday from "../holiday/holiday.model";
import Leave from "../leave/leave.model";
import type { TLeaveType } from "../leave/leave.interface";
import type {
  TAttendanceFinalization,
  TAttendanceFinalizationActionPayload,
  TAttendanceFinalizationAuditAction,
  TAttendanceFinalizationBulkActionPayload,
  TAttendanceFinalizationBulkActionType,
  TAttendanceFinalizationOperationalSummaryQuery,
  TAttendanceFinalizationQuery,
  TAttendanceFinalizationStatus,
  TGenerateAttendanceFinalizationPayload,
} from "./attendanceFinalization.interface";
import AttendanceFinalization from "./attendanceFinalization.model";

type TAttendanceFinalizationDeleteRestoreOptions = TSoftDeleteRequestBody & TRestoreRequestBody & { userId?: string };

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const FINALIZATION_RULE_VERSION = "attendance-finalization-v1";

const NON_ACTIVE_EMPLOYMENT_STATUSES = [
  "resigned",
  "terminated",
  "retired",
  "suspended",
];

const PAY_DEDUCTIBLE_LEAVE_TYPES: TLeaveType[] = ["unpaid"];

const toObjectId = (value: string, fieldName: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid ${fieldName}.`);
  }

  return new Types.ObjectId(value);
};

const getOptionalObjectId = (value: string | undefined, fieldName: string) => {
  if (!value) {
    return undefined;
  }

  return toObjectId(value, fieldName);
};

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const parsePayrollMonth = (payrollMonth: string) => {
  const [yearText, monthText] = payrollMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  validateMonthYear(month, year);

  return { month, year };
};

const formatUTCDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const getMonthDateRange = (month: number, year: number) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));

  return {
    periodStartDate: formatUTCDate(startDate),
    periodEndDate: formatUTCDate(endDate),
    totalCalendarDays: endDate.getUTCDate(),
  };
};

const toUTCDate = (dateString: string) => {
  return new Date(`${dateString}T00:00:00.000Z`);
};

const enumerateDateRange = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const currentDate = toUTCDate(startDate);
  const lastDate = toUTCDate(endDate);

  while (currentDate.getTime() <= lastDate.getTime()) {
    dates.push(formatUTCDate(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

const calculateOverlapDates = (
  itemStartDate: string,
  itemEndDate: string,
  rangeStartDate: string,
  rangeEndDate: string,
) => {
  const itemStart = toUTCDate(itemStartDate).getTime();
  const itemEnd = toUTCDate(itemEndDate).getTime();
  const rangeStart = toUTCDate(rangeStartDate).getTime();
  const rangeEnd = toUTCDate(rangeEndDate).getTime();

  const overlapStart = Math.max(itemStart, rangeStart);
  const overlapEnd = Math.min(itemEnd, rangeEnd);

  if (overlapEnd < overlapStart) {
    return [];
  }

  return enumerateDateRange(
    formatUTCDate(new Date(overlapStart)),
    formatUTCDate(new Date(overlapEnd)),
  );
};

const roundToTwoDecimals = (value: number) => {
  return Math.round(value * 100) / 100;
};

const getObjectIdString = (value: unknown) => {
  if (!value) {
    return "";
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  const objectValue = value as {
    _id?: Types.ObjectId | string;
    toString?: () => string;
  };

  if (objectValue._id) {
    return getObjectIdString(objectValue._id);
  }

  if (typeof objectValue.toString === "function") {
    return objectValue.toString();
  }

  return "";
};

const getEntityName = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return "";
  }

  const entity = value as {
    name?: string;
    departmentName?: string;
    designationName?: string;
    branchName?: string;
    majorDepartmentName?: string;
    companyName?: string;
  };

  return (
    entity.name ||
    entity.companyName ||
    entity.majorDepartmentName ||
    entity.departmentName ||
    entity.designationName ||
    entity.branchName ||
    ""
  );
};

const getEmployeeFullName = (employee: any) => {
  const firstName = employee?.name?.firstName || "";
  const middleName = employee?.name?.middleName || "";
  const lastName = employee?.name?.lastName || "";

  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildEntitySnapshot = (value: unknown) => {
  if (!value) {
    return null;
  }

  return {
    id: getObjectIdString(value),
    name: getEntityName(value),
  };
};

const buildEmployeeSnapshot = (employee: any) => {
  return {
    employeeDbId: getObjectIdString(employee?._id),
    employeeId: employee?.employeeId || "",
    employeeName: getEmployeeFullName(employee),
    officeId: employee?.officeId || "",
    cardNo: employee?.cardNo || "",
    company: buildEntitySnapshot(employee?.company),
    majorDepartment: buildEntitySnapshot(employee?.majorDepartment),
    department: buildEntitySnapshot(employee?.department),
    designation: buildEntitySnapshot(employee?.designation),
    branch: buildEntitySnapshot(employee?.branch),
    serviceType: employee?.serviceType || "",
    payType: employee?.payType || "",
    employmentStatus: employee?.employmentStatus || "",
    joiningDate: employee?.joiningDate || "",
    dutyHourPerDay: Number(employee?.dutyHourPerDay || 0),
  };
};

const parseTimeToMinutes = (time?: string) => {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const [hourText, minuteText] = time.split(":");
  return Number(hourText) * 60 + Number(minuteText);
};

const calculatePotentialOtHours = ({
  checkInTime,
  checkOutTime,
  dutyHourPerDay,
}: {
  checkInTime?: string;
  checkOutTime?: string;
  dutyHourPerDay: number;
}) => {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const checkOutMinutes = parseTimeToMinutes(checkOutTime);

  if (checkInMinutes === null || checkOutMinutes === null) {
    return 0;
  }

  if (checkOutMinutes <= checkInMinutes) {
    return 0;
  }

  const workedHours = (checkOutMinutes - checkInMinutes) / 60;
  const otHours = workedHours - dutyHourPerDay;

  return roundToTwoDecimals(Math.max(otHours, 0));
};

const isDeductibleLeaveType = (leaveType?: TLeaveType) => {
  if (!leaveType) {
    return false;
  }

  return PAY_DEDUCTIBLE_LEAVE_TYPES.includes(leaveType);
};

const createAuditEntry = ({
  action,
  fromStatus,
  toStatus,
  actionBy,
  note,
}: {
  action: TAttendanceFinalizationAuditAction;
  fromStatus?: TAttendanceFinalizationStatus | null;
  toStatus?: TAttendanceFinalizationStatus | null;
  actionBy?: string;
  note?: string;
}) => {
  return {
    action,
    fromStatus: fromStatus || null,
    toStatus: toStatus || null,
    actionBy: actionBy && Types.ObjectId.isValid(actionBy) ? toObjectId(actionBy, "user id") : null,
    actionAt: new Date(),
    note: note || "",
  };
};

const validateMonthYear = (month: number, year: number) => {
  if (!month || month < 1 || month > 12) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Month must be between 1 and 12.",
    );
  }

  if (!year || year < 2000 || year > 2100) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Year must be between 2000 and 2100.",
    );
  }
};

const buildApprovedLeaveTypeByDate = async ({
  employeeId,
  periodStartDate,
  periodEndDate,
}: {
  employeeId: Types.ObjectId;
  periodStartDate: string;
  periodEndDate: string;
}) => {
  const leaves = await Leave.find({
    employee: employeeId,
    status: "approved",
    isDeleted: false,
    startDate: {
      $lte: periodEndDate,
    },
    endDate: {
      $gte: periodStartDate,
    },
  }).sort({ startDate: 1, createdAt: 1 });

  const leaveTypeByDate = new Map<string, TLeaveType>();

  for (const leave of leaves) {
    const overlapDates = calculateOverlapDates(
      leave.startDate,
      leave.endDate,
      periodStartDate,
      periodEndDate,
    );

    for (const date of overlapDates) {
      const existingLeaveType = leaveTypeByDate.get(date);

      if (!existingLeaveType || leave.leaveType === "unpaid") {
        leaveTypeByDate.set(date, leave.leaveType);
      }
    }
  }

  return {
    leaves,
    leaveTypeByDate,
  };
};

const buildHolidaySets = async ({
  periodStartDate,
  periodEndDate,
}: {
  periodStartDate: string;
  periodEndDate: string;
}) => {
  const holidays = await Holiday.find({
    holidayDate: {
      $gte: periodStartDate,
      $lte: periodEndDate,
    },
    isDeleted: false,
  }).sort({ holidayDate: 1 });

  const holidayDateSet = new Set<string>();
  const weeklyHolidayDateSet = new Set<string>();

  for (const holiday of holidays) {
    holidayDateSet.add(holiday.holidayDate);

    if (holiday.holidayType === "weekly") {
      weeklyHolidayDateSet.add(holiday.holidayDate);
    }
  }

  return {
    holidays,
    holidayDateSet,
    weeklyHolidayDateSet,
  };
};

const buildAttendanceByDate = async ({
  employeeId,
  periodStartDate,
  periodEndDate,
}: {
  employeeId: Types.ObjectId;
  periodStartDate: string;
  periodEndDate: string;
}) => {
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    attendanceDate: {
      $gte: periodStartDate,
      $lte: periodEndDate,
    },
    isDeleted: false,
  }).sort({ attendanceDate: 1, createdAt: -1 });

  const attendanceByDate = new Map<string, any>();

  for (const attendance of attendanceRecords) {
    if (!attendanceByDate.has(attendance.attendanceDate)) {
      attendanceByDate.set(attendance.attendanceDate, attendance);
    }
  }

  return {
    attendanceRecords,
    attendanceByDate,
  };
};

const calculateEmployeeFinalization = async ({
  employee,
  month,
  year,
  periodStartDate,
  periodEndDate,
  totalCalendarDays,
  actionBy,
  remarks,
}: {
  employee: any;
  month: number;
  year: number;
  periodStartDate: string;
  periodEndDate: string;
  totalCalendarDays: number;
  actionBy?: string;
  remarks?: string;
}): Promise<Partial<TAttendanceFinalization>> => {
  const payrollMonth = buildPayrollMonth(month, year);
  const employeeObjectId = employee._id as Types.ObjectId;
  const allDates = enumerateDateRange(periodStartDate, periodEndDate);
  const { attendanceRecords, attendanceByDate } = await buildAttendanceByDate({
    employeeId: employeeObjectId,
    periodStartDate,
    periodEndDate,
  });
  const { leaves, leaveTypeByDate } = await buildApprovedLeaveTypeByDate({
    employeeId: employeeObjectId,
    periodStartDate,
    periodEndDate,
  });
  const { holidays, holidayDateSet, weeklyHolidayDateSet } =
    await buildHolidaySets({
      periodStartDate,
      periodEndDate,
    });

  let totalPresentDays = 0;
  let totalLateDays = 0;
  let totalAbsentDays = 0;
  let totalLeaveDays = 0;
  let totalPaidLeaveDays = 0;
  let totalUnpaidLeaveDays = 0;
  let totalHolidayDays = 0;
  let totalWeekendDays = 0;
  let totalHalfDays = 0;
  let totalDutyDays = 0;
  let totalDeductionDays = 0;
  let totalOtHours = 0;
  let totalTiffinDays = 0;
  let totalHolidayDutyDays = 0;
  let missingAttendanceDays = 0;
  let missingApprovedLeaveDays = 0;

  for (const currentDate of allDates) {
    const attendance = attendanceByDate.get(currentDate);
    const approvedLeaveType = leaveTypeByDate.get(currentDate);
    const isHoliday = holidayDateSet.has(currentDate);
    const isWeeklyHoliday = weeklyHolidayDateSet.has(currentDate);
    const attendanceStatus = attendance?.status || "";
    const dutyHourPerDay = Number(employee?.dutyHourPerDay || 8);
    const otHoursForDay = calculatePotentialOtHours({
      checkInTime: attendance?.checkInTime,
      checkOutTime: attendance?.checkOutTime,
      dutyHourPerDay,
    });

    if (isHoliday) {
      totalHolidayDays += 1;
    }

    if (isWeeklyHoliday || attendanceStatus === "weekend") {
      totalWeekendDays += 1;
    }

    if (!attendance) {
      missingAttendanceDays += 1;
    }

    if (approvedLeaveType) {
      totalLeaveDays += 1;

      if (isDeductibleLeaveType(approvedLeaveType)) {
        totalUnpaidLeaveDays += 1;
        totalDeductionDays += 1;
      } else {
        totalPaidLeaveDays += 1;
      }

      continue;
    }

    if (attendanceStatus === "leave") {
      totalLeaveDays += 1;
      totalPaidLeaveDays += 1;
      missingApprovedLeaveDays += 1;
      continue;
    }

    if (attendanceStatus === "present" || attendanceStatus === "late") {
      totalPresentDays += 1;
      totalDutyDays += 1;
      totalTiffinDays += 1;
      totalOtHours += otHoursForDay;

      if (attendanceStatus === "late") {
        totalLateDays += 1;
      }

      if (isHoliday) {
        totalHolidayDutyDays += 1;
      }

      continue;
    }

    if (attendanceStatus === "half-day") {
      totalHalfDays += 1;
      totalPresentDays += 0.5;
      totalDutyDays += 0.5;
      totalTiffinDays += 0.5;
      totalDeductionDays += 0.5;
      totalOtHours += otHoursForDay;

      if (isHoliday) {
        totalHolidayDutyDays += 0.5;
      }

      continue;
    }

    if (attendanceStatus === "holiday") {
      if (!isHoliday) {
        totalHolidayDays += 1;
      }
      continue;
    }

    if (attendanceStatus === "weekend") {
      continue;
    }

    if (isHoliday) {
      continue;
    }

    totalAbsentDays += 1;
    totalDeductionDays += 1;
  }

  const totalPayableDays = Math.max(totalCalendarDays - totalDeductionDays, 0);

  return {
    employee: employee._id,
    company: new Types.ObjectId(getObjectIdString(employee.company)),
    majorDepartment: new Types.ObjectId(getObjectIdString(employee.majorDepartment)),
    department: new Types.ObjectId(getObjectIdString(employee.department)),
    designation: new Types.ObjectId(getObjectIdString(employee.designation)),
    branch: new Types.ObjectId(getObjectIdString(employee.branch)),
    payrollMonth,
    month,
    year,
    periodStartDate,
    periodEndDate,
    totalCalendarDays,
    totalPresentDays: roundToTwoDecimals(totalPresentDays),
    totalLateDays,
    totalAbsentDays,
    totalLeaveDays,
    totalPaidLeaveDays,
    totalUnpaidLeaveDays,
    totalHolidayDays,
    totalWeekendDays,
    totalHalfDays,
    totalDutyDays: roundToTwoDecimals(totalDutyDays),
    totalPayableDays: roundToTwoDecimals(totalPayableDays),
    totalDeductionDays: roundToTwoDecimals(totalDeductionDays),
    totalOtHours: roundToTwoDecimals(totalOtHours),
    totalTiffinDays: roundToTwoDecimals(totalTiffinDays),
    totalHolidayDutyDays: roundToTwoDecimals(totalHolidayDutyDays),
    status: "draft",
    isLocked: false,
    generatedBy:
      actionBy && Types.ObjectId.isValid(actionBy)
        ? toObjectId(actionBy, "user id")
        : null,
    generatedAt: new Date(),
    finalizedBy: null,
    finalizedAt: null,
    approvedBy: null,
    approvedAt: null,
    lockedBy: null,
    lockedAt: null,
    employeeSnapshot: buildEmployeeSnapshot(employee),
    sourceSummary: {
      rawAttendanceCount: attendanceRecords.length,
      approvedLeaveCount: leaves.length,
      holidayCount: holidays.length,
      missingAttendanceDays,
      missingApprovedLeaveDays,
      generatedRuleVersion: FINALIZATION_RULE_VERSION,
    },
    auditLogs: [
      createAuditEntry({
        action: "generated",
        fromStatus: null,
        toStatus: "draft",
        actionBy,
        note: remarks || "Attendance finalization generated",
      }),
    ],
    remarks: remarks || "",
    isDeleted: false,
  };
};

const generateMonthlyAttendanceFinalizationIntoDB = async (
  payload: TGenerateAttendanceFinalizationPayload,
  actionBy?: string,
) => {
  validateMonthYear(payload.month, payload.year);

  const companyId = toObjectId(payload.company, "company id");
  const majorDepartmentId = getOptionalObjectId(
    payload.majorDepartment,
    "major department id",
  );
  const departmentId = getOptionalObjectId(payload.department, "department id");
  const branchId = getOptionalObjectId(payload.branch, "branch id");
  const employeeId = getOptionalObjectId(payload.employee, "employee id");
  const payrollMonth = buildPayrollMonth(payload.month, payload.year);
  const { periodStartDate, periodEndDate, totalCalendarDays } =
    getMonthDateRange(payload.month, payload.year);

  const employeeFilter: Record<string, unknown> = {
    company: companyId,
    status: "active",
    isDeleted: false,
    joiningDate: {
      $lte: periodEndDate,
    },
    employmentStatus: {
      $nin: NON_ACTIVE_EMPLOYMENT_STATUSES,
    },
  };

  if (majorDepartmentId) {
    employeeFilter.majorDepartment = majorDepartmentId;
  }

  if (departmentId) {
    employeeFilter.department = departmentId;
  }

  if (branchId) {
    employeeFilter.branch = branchId;
  }

  if (employeeId) {
    employeeFilter._id = employeeId;
  }

  const employees = await Employee.find(employeeFilter)
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ employeeId: 1 });

  if (!employees.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No active employee found for attendance finalization.",
    );
  }

  const generatedRecords = [];
  const updatedRecords = [];
  const skippedEmployees = [];

  for (const employee of employees) {
    const existingFinalization = await AttendanceFinalization.findOne({
      employee: employee._id,
      payrollMonth,
      isDeleted: false,
    });

    if (existingFinalization) {
      if (existingFinalization.isLocked || existingFinalization.status === "locked") {
        skippedEmployees.push({
          employeeId: employee.employeeId,
          employeeName: getEmployeeFullName(employee),
          reason: "Attendance finalization is locked.",
        });
        continue;
      }

      if (existingFinalization.status === "approved") {
        skippedEmployees.push({
          employeeId: employee.employeeId,
          employeeName: getEmployeeFullName(employee),
          reason: "Attendance finalization is already approved.",
        });
        continue;
      }

      if (!payload.overwrite) {
        skippedEmployees.push({
          employeeId: employee.employeeId,
          employeeName: getEmployeeFullName(employee),
          reason: "Attendance finalization already exists. Use overwrite=true to regenerate draft/finalized records.",
        });
        continue;
      }
    }

    const calculatedFinalization = await calculateEmployeeFinalization({
      employee,
      month: payload.month,
      year: payload.year,
      periodStartDate,
      periodEndDate,
      totalCalendarDays,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingFinalization) {
      const previousStatus = existingFinalization.status;

      const updatedFinalization = await AttendanceFinalization.findOneAndUpdate(
        {
          _id: existingFinalization._id,
          isDeleted: false,
        },
        {
          ...calculatedFinalization,
          auditLogs: [
            ...existingFinalization.auditLogs,
            createAuditEntry({
              action: "regenerated",
              fromStatus: previousStatus,
              toStatus: "draft",
              actionBy,
              note: payload.remarks || "Attendance finalization regenerated",
            }),
          ],
        },
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("employee")
        .populate("company")
        .populate("majorDepartment")
        .populate("department")
        .populate("designation")
        .populate("branch");

      if (updatedFinalization) {
        updatedRecords.push(updatedFinalization);
      }

      continue;
    }

    const createdFinalization = await AttendanceFinalization.create(
      calculatedFinalization,
    );

    const populatedFinalization = await AttendanceFinalization.findById(
      createdFinalization._id,
    )
      .populate("employee")
      .populate("company")
      .populate("majorDepartment")
      .populate("department")
      .populate("designation")
      .populate("branch");

    if (populatedFinalization) {
      generatedRecords.push(populatedFinalization);
    }
  }

  return {
    payrollMonth,
    periodStartDate,
    periodEndDate,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    summary: {
      totalEmployeesFound: employees.length,
      totalGenerated: generatedRecords.length,
      totalUpdated: updatedRecords.length,
      totalSkipped: skippedEmployees.length,
      totalRecordsReady: generatedRecords.length + updatedRecords.length,
    },
    generatedRecords,
    updatedRecords,
    skippedEmployees,
  };
};

const getAllAttendanceFinalizationFromDB = async (
  query: TAttendanceFinalizationQuery,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.payrollMonth) {
    filter.payrollMonth = query.payrollMonth;
  }

  if (query.month && query.year && !query.payrollMonth) {
    const month = Number(query.month);
    const year = Number(query.year);
    validateMonthYear(month, year);
    filter.payrollMonth = buildPayrollMonth(month, year);
  }

  if (query.company) {
    filter.company = toObjectId(query.company, "company id");
  }

  if (query.majorDepartment) {
    filter.majorDepartment = toObjectId(
      query.majorDepartment,
      "major department id",
    );
  }

  if (query.department) {
    filter.department = toObjectId(query.department, "department id");
  }

  if (query.branch) {
    filter.branch = toObjectId(query.branch, "branch id");
  }

  if (query.employee) {
    filter.employee = toObjectId(query.employee, "employee id");
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.isLocked === "true") {
    filter.isLocked = true;
  }

  if (query.isLocked === "false") {
    filter.isLocked = false;
  }

  const result = await AttendanceFinalization.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ payrollMonth: -1, "employeeSnapshot.employeeId": 1, createdAt: -1 });

  return result;
};

const getDeletedAttendanceFinalizationFromDB = async (
  query: TAttendanceFinalizationQuery,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: true,
  };

  if (query.payrollMonth) {
    filter.payrollMonth = query.payrollMonth;
  }

  if (query.month && query.year && !query.payrollMonth) {
    const month = Number(query.month);
    const year = Number(query.year);
    validateMonthYear(month, year);
    filter.payrollMonth = buildPayrollMonth(month, year);
  }

  if (query.company) {
    filter.company = toObjectId(query.company, "company id");
  }

  if (query.majorDepartment) {
    filter.majorDepartment = toObjectId(
      query.majorDepartment,
      "major department id",
    );
  }

  if (query.department) {
    filter.department = toObjectId(query.department, "department id");
  }

  if (query.branch) {
    filter.branch = toObjectId(query.branch, "branch id");
  }

  if (query.employee) {
    filter.employee = toObjectId(query.employee, "employee id");
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.isLocked === "true") {
    filter.isLocked = true;
  }

  if (query.isLocked === "false") {
    filter.isLocked = false;
  }

  const result = await AttendanceFinalization.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ deletedAt: -1, payrollMonth: -1, "employeeSnapshot.employeeId": 1, createdAt: -1 });

  return result;
};

const getSingleAttendanceFinalizationFromDB = async (id: string) => {
  const finalizationId = toObjectId(id, "attendance finalization id");

  const result = await AttendanceFinalization.findOne({
    _id: finalizationId,
    isDeleted: false,
  })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch");

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Attendance finalization not found.",
    );
  }

  return result;
};


const getPayrollMonthFromBulkPayload = (
  payload: TAttendanceFinalizationBulkActionPayload,
) => {
  if (payload.payrollMonth) {
    parsePayrollMonth(payload.payrollMonth);
    return payload.payrollMonth;
  }

  if (!payload.month || !payload.year) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  validateMonthYear(payload.month, payload.year);
  return buildPayrollMonth(payload.month, payload.year);
};

const buildBulkActionFilter = (
  payload: TAttendanceFinalizationBulkActionPayload,
) => {
  const payrollMonth = getPayrollMonthFromBulkPayload(payload);
  const filter: Record<string, unknown> = {
    payrollMonth,
    company: toObjectId(payload.company, "company id"),
    isDeleted: false,
  };

  if (payload.majorDepartment) {
    filter.majorDepartment = toObjectId(
      payload.majorDepartment,
      "major department id",
    );
  }

  if (payload.department) {
    filter.department = toObjectId(payload.department, "department id");
  }

  if (payload.branch) {
    filter.branch = toObjectId(payload.branch, "branch id");
  }

  if (payload.employee) {
    filter.employee = toObjectId(payload.employee, "employee id");
  }

  return {
    payrollMonth,
    filter,
  };
};

const buildStatusSummary = (records: TAttendanceFinalization[]) => {
  const summary: Record<TAttendanceFinalizationStatus, number> = {
    draft: 0,
    finalized: 0,
    approved: 0,
    locked: 0,
  };

  for (const record of records) {
    summary[record.status] += 1;
  }

  return summary;
};

const getBulkActionConfig = (action: TAttendanceFinalizationBulkActionType) => {
  const config: Record<
    TAttendanceFinalizationBulkActionType,
    {
      auditAction: TAttendanceFinalizationAuditAction;
      allowedStatus: TAttendanceFinalizationStatus;
      targetStatus: TAttendanceFinalizationStatus;
      statusField: "finalized" | "approved" | "locked" | "unlocked";
      description: string;
    }
  > = {
    finalize: {
      auditAction: "finalized",
      allowedStatus: "draft",
      targetStatus: "finalized",
      statusField: "finalized",
      description: "Bulk finalized",
    },
    approve: {
      auditAction: "approved",
      allowedStatus: "finalized",
      targetStatus: "approved",
      statusField: "approved",
      description: "Bulk approved",
    },
    lock: {
      auditAction: "locked",
      allowedStatus: "approved",
      targetStatus: "locked",
      statusField: "locked",
      description: "Bulk locked",
    },
    unlock: {
      auditAction: "unlocked",
      allowedStatus: "locked",
      targetStatus: "approved",
      statusField: "unlocked",
      description: "Bulk unlocked",
    },
  };

  return config[action];
};

const isRecordEligibleForBulkAction = (
  record: TAttendanceFinalization,
  action: TAttendanceFinalizationBulkActionType,
) => {
  const config = getBulkActionConfig(action);

  if (action === "unlock") {
    return record.status === "locked" && record.isLocked;
  }

  if (record.isLocked) {
    return false;
  }

  return record.status === config.allowedStatus;
};

const buildBulkSkippedReason = (
  record: TAttendanceFinalization,
  action: TAttendanceFinalizationBulkActionType,
) => {
  if (action !== "unlock" && record.isLocked) {
    return "Record is locked.";
  }

  if (action === "unlock") {
    return "Only locked records can be unlocked.";
  }

  const config = getBulkActionConfig(action);
  return `Only ${config.allowedStatus} records can be ${config.description.toLowerCase()}.`;
};

const buildStatusUpdatePayload = ({
  record,
  action,
  actionBy,
  note,
}: {
  record: TAttendanceFinalization;
  action: TAttendanceFinalizationBulkActionType;
  actionBy?: string;
  note?: string;
}): Partial<TAttendanceFinalization> => {
  const config = getBulkActionConfig(action);
  const actionByObjectId =
    actionBy && Types.ObjectId.isValid(actionBy)
      ? toObjectId(actionBy, "user id")
      : null;

  const updatePayload: Partial<TAttendanceFinalization> = {
    status: config.targetStatus,
    isLocked: action === "lock" ? true : action === "unlock" ? false : record.isLocked,
    auditLogs: [
      ...record.auditLogs,
      createAuditEntry({
        action: config.auditAction,
        fromStatus: record.status,
        toStatus: config.targetStatus,
        actionBy,
        note: note || config.description,
      }),
    ],
  };

  if (action === "finalize") {
    updatePayload.finalizedBy = actionByObjectId;
    updatePayload.finalizedAt = new Date();
  }

  if (action === "approve") {
    updatePayload.approvedBy = actionByObjectId;
    updatePayload.approvedAt = new Date();
  }

  if (action === "lock") {
    updatePayload.lockedBy = actionByObjectId;
    updatePayload.lockedAt = new Date();
  }

  if (action === "unlock") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
  }

  return updatePayload;
};

const bulkChangeAttendanceFinalizationStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TAttendanceFinalizationBulkActionType;
  payload: TAttendanceFinalizationBulkActionPayload;
  actionBy?: string;
}) => {
  const { payrollMonth, filter } = buildBulkActionFilter(payload);
  const records = await AttendanceFinalization.find(filter).sort({
    "employeeSnapshot.employeeId": 1,
    createdAt: 1,
  });

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No attendance finalization records found for the selected month and filters.",
    );
  }

  const statusSummaryBefore = buildStatusSummary(records);

  if (action === "lock" && payload.strict !== false) {
    const blockers = records.filter(
      (record) => record.status !== "approved" || record.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Month-level lock rejected. ${blockers.length} record(s) are not ready for lock. Finalize and approve every selected record first, or pass strict=false for a partial lock.`,
      );
    }
  }

  const processedRecords = [];
  const skippedRecords = [];

  for (const record of records) {
    if (!isRecordEligibleForBulkAction(record, action)) {
      skippedRecords.push({
        id: getObjectIdString(record._id),
        employee: getObjectIdString(record.employee),
        employeeId: record.employeeSnapshot?.employeeId || "",
        employeeName: record.employeeSnapshot?.employeeName || "",
        currentStatus: record.status,
        isLocked: record.isLocked,
        reason: buildBulkSkippedReason(record, action),
      });
      continue;
    }

    const updatedRecord = await AttendanceFinalization.findOneAndUpdate(
      {
        _id: record._id,
        isDeleted: false,
      },
      buildStatusUpdatePayload({
        record,
        action,
        actionBy,
        note: payload.note,
      }),
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("employee")
      .populate("company")
      .populate("majorDepartment")
      .populate("department")
      .populate("designation")
      .populate("branch");

    if (updatedRecord) {
      processedRecords.push(updatedRecord);
    }
  }

  const refreshedRecords = await AttendanceFinalization.find(filter).sort({
    "employeeSnapshot.employeeId": 1,
    createdAt: 1,
  });

  return {
    payrollMonth,
    action,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    summary: {
      totalMatched: records.length,
      totalProcessed: processedRecords.length,
      totalSkipped: skippedRecords.length,
      statusSummaryBefore,
      statusSummaryAfter: buildStatusSummary(refreshedRecords),
      strictLock: action === "lock" ? payload.strict !== false : null,
    },
    processedRecords,
    skippedRecords,
  };
};

const changeAttendanceFinalizationStatusIntoDB = async ({
  id,
  action,
  targetStatus,
  actionBy,
  payload,
}: {
  id: string;
  action: TAttendanceFinalizationAuditAction;
  targetStatus: TAttendanceFinalizationStatus;
  actionBy?: string;
  payload?: TAttendanceFinalizationActionPayload;
}) => {
  const existingFinalization = await getSingleAttendanceFinalizationFromDB(id);
  const previousStatus = existingFinalization.status;

  if (existingFinalization.isLocked && action !== "unlocked") {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked attendance finalization cannot be changed.",
    );
  }

  if (action === "finalized" && previousStatus !== "draft") {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Only draft attendance finalization can be finalized.",
    );
  }

  if (action === "approved" && previousStatus !== "finalized") {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Only finalized attendance finalization can be approved.",
    );
  }

  if (action === "locked" && previousStatus !== "approved") {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Only approved attendance finalization can be locked.",
    );
  }

  if (action === "unlocked" && !existingFinalization.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Attendance finalization is not locked.",
    );
  }

  const updatePayload: Partial<TAttendanceFinalization> = {
    status: targetStatus,
    isLocked: action === "locked" ? true : action === "unlocked" ? false : existingFinalization.isLocked,
    auditLogs: [
      ...existingFinalization.auditLogs,
      createAuditEntry({
        action,
        fromStatus: previousStatus,
        toStatus: targetStatus,
        actionBy,
        note: payload?.note,
      }),
    ],
  };

  const actionByObjectId =
    actionBy && Types.ObjectId.isValid(actionBy)
      ? toObjectId(actionBy, "user id")
      : null;

  if (action === "finalized") {
    updatePayload.finalizedBy = actionByObjectId;
    updatePayload.finalizedAt = new Date();
  }

  if (action === "approved") {
    updatePayload.approvedBy = actionByObjectId;
    updatePayload.approvedAt = new Date();
  }

  if (action === "locked") {
    updatePayload.lockedBy = actionByObjectId;
    updatePayload.lockedAt = new Date();
  }

  if (action === "unlocked") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
  }

  const result = await AttendanceFinalization.findOneAndUpdate(
    {
      _id: existingFinalization._id,
      isDeleted: false,
    },
    updatePayload,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch");

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Attendance finalization not found.",
    );
  }

  return result;
};

const finalizeAttendanceFinalizationIntoDB = async (
  id: string,
  payload: TAttendanceFinalizationActionPayload,
  actionBy?: string,
) => {
  return changeAttendanceFinalizationStatusIntoDB({
    id,
    action: "finalized",
    targetStatus: "finalized",
    actionBy,
    payload,
  });
};

const approveAttendanceFinalizationIntoDB = async (
  id: string,
  payload: TAttendanceFinalizationActionPayload,
  actionBy?: string,
) => {
  return changeAttendanceFinalizationStatusIntoDB({
    id,
    action: "approved",
    targetStatus: "approved",
    actionBy,
    payload,
  });
};

const lockAttendanceFinalizationIntoDB = async (
  id: string,
  payload: TAttendanceFinalizationActionPayload,
  actionBy?: string,
) => {
  return changeAttendanceFinalizationStatusIntoDB({
    id,
    action: "locked",
    targetStatus: "locked",
    actionBy,
    payload,
  });
};

const unlockAttendanceFinalizationIntoDB = async (
  id: string,
  payload: TAttendanceFinalizationActionPayload,
  actionBy?: string,
) => {
  return changeAttendanceFinalizationStatusIntoDB({
    id,
    action: "unlocked",
    targetStatus: "approved",
    actionBy,
    payload,
  });
};



const getPayrollMonthFromSummaryQuery = (
  query: TAttendanceFinalizationOperationalSummaryQuery,
) => {
  if (query.payrollMonth) {
    parsePayrollMonth(query.payrollMonth);
    return query.payrollMonth;
  }

  if (!query.month || !query.year) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  const month = Number(query.month);
  const year = Number(query.year);
  validateMonthYear(month, year);

  return buildPayrollMonth(month, year);
};

const buildOperationalSummaryFilter = (
  query: TAttendanceFinalizationOperationalSummaryQuery,
) => {
  const payrollMonth = getPayrollMonthFromSummaryQuery(query);
  const filter: Record<string, unknown> = {
    payrollMonth,
    company: toObjectId(query.company, "company id"),
    isDeleted: false,
  };

  if (query.majorDepartment) {
    filter.majorDepartment = toObjectId(
      query.majorDepartment,
      "major department id",
    );
  }

  if (query.department) {
    filter.department = toObjectId(query.department, "department id");
  }

  if (query.branch) {
    filter.branch = toObjectId(query.branch, "branch id");
  }

  if (query.employee) {
    filter.employee = toObjectId(query.employee, "employee id");
  }

  return {
    payrollMonth,
    filter,
  };
};

type TAttendanceFinalizationNumericTotals = {
  totalCalendarDays: number;
  totalPresentDays: number;
  totalLateDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalHolidayDays: number;
  totalWeekendDays: number;
  totalHalfDays: number;
  totalDutyDays: number;
  totalPayableDays: number;
  totalDeductionDays: number;
  totalOtHours: number;
  totalTiffinDays: number;
  totalHolidayDutyDays: number;
  rawAttendanceCount: number;
  approvedLeaveCount: number;
  holidayCount: number;
  missingAttendanceDays: number;
  missingApprovedLeaveDays: number;
};

const createEmptyNumericTotals = (): TAttendanceFinalizationNumericTotals => ({
  totalCalendarDays: 0,
  totalPresentDays: 0,
  totalLateDays: 0,
  totalAbsentDays: 0,
  totalLeaveDays: 0,
  totalPaidLeaveDays: 0,
  totalUnpaidLeaveDays: 0,
  totalHolidayDays: 0,
  totalWeekendDays: 0,
  totalHalfDays: 0,
  totalDutyDays: 0,
  totalPayableDays: 0,
  totalDeductionDays: 0,
  totalOtHours: 0,
  totalTiffinDays: 0,
  totalHolidayDutyDays: 0,
  rawAttendanceCount: 0,
  approvedLeaveCount: 0,
  holidayCount: 0,
  missingAttendanceDays: 0,
  missingApprovedLeaveDays: 0,
});

const addRecordToNumericTotals = (
  totals: TAttendanceFinalizationNumericTotals,
  record: TAttendanceFinalization,
) => {
  totals.totalCalendarDays += record.totalCalendarDays || 0;
  totals.totalPresentDays += record.totalPresentDays || 0;
  totals.totalLateDays += record.totalLateDays || 0;
  totals.totalAbsentDays += record.totalAbsentDays || 0;
  totals.totalLeaveDays += record.totalLeaveDays || 0;
  totals.totalPaidLeaveDays += record.totalPaidLeaveDays || 0;
  totals.totalUnpaidLeaveDays += record.totalUnpaidLeaveDays || 0;
  totals.totalHolidayDays += record.totalHolidayDays || 0;
  totals.totalWeekendDays += record.totalWeekendDays || 0;
  totals.totalHalfDays += record.totalHalfDays || 0;
  totals.totalDutyDays += record.totalDutyDays || 0;
  totals.totalPayableDays += record.totalPayableDays || 0;
  totals.totalDeductionDays += record.totalDeductionDays || 0;
  totals.totalOtHours += record.totalOtHours || 0;
  totals.totalTiffinDays += record.totalTiffinDays || 0;
  totals.totalHolidayDutyDays += record.totalHolidayDutyDays || 0;
  totals.rawAttendanceCount += record.sourceSummary?.rawAttendanceCount || 0;
  totals.approvedLeaveCount += record.sourceSummary?.approvedLeaveCount || 0;
  totals.holidayCount += record.sourceSummary?.holidayCount || 0;
  totals.missingAttendanceDays += record.sourceSummary?.missingAttendanceDays || 0;
  totals.missingApprovedLeaveDays +=
    record.sourceSummary?.missingApprovedLeaveDays || 0;
};

const normalizeNumericTotals = (totals: TAttendanceFinalizationNumericTotals) => {
  return {
    totalCalendarDays: roundToTwoDecimals(totals.totalCalendarDays),
    totalPresentDays: roundToTwoDecimals(totals.totalPresentDays),
    totalLateDays: roundToTwoDecimals(totals.totalLateDays),
    totalAbsentDays: roundToTwoDecimals(totals.totalAbsentDays),
    totalLeaveDays: roundToTwoDecimals(totals.totalLeaveDays),
    totalPaidLeaveDays: roundToTwoDecimals(totals.totalPaidLeaveDays),
    totalUnpaidLeaveDays: roundToTwoDecimals(totals.totalUnpaidLeaveDays),
    totalHolidayDays: roundToTwoDecimals(totals.totalHolidayDays),
    totalWeekendDays: roundToTwoDecimals(totals.totalWeekendDays),
    totalHalfDays: roundToTwoDecimals(totals.totalHalfDays),
    totalDutyDays: roundToTwoDecimals(totals.totalDutyDays),
    totalPayableDays: roundToTwoDecimals(totals.totalPayableDays),
    totalDeductionDays: roundToTwoDecimals(totals.totalDeductionDays),
    totalOtHours: roundToTwoDecimals(totals.totalOtHours),
    totalTiffinDays: roundToTwoDecimals(totals.totalTiffinDays),
    totalHolidayDutyDays: roundToTwoDecimals(totals.totalHolidayDutyDays),
    rawAttendanceCount: roundToTwoDecimals(totals.rawAttendanceCount),
    approvedLeaveCount: roundToTwoDecimals(totals.approvedLeaveCount),
    holidayCount: roundToTwoDecimals(totals.holidayCount),
    missingAttendanceDays: roundToTwoDecimals(totals.missingAttendanceDays),
    missingApprovedLeaveDays: roundToTwoDecimals(
      totals.missingApprovedLeaveDays,
    ),
  };
};

const buildLockSummary = (records: TAttendanceFinalization[]) => {
  let locked = 0;
  let unlocked = 0;

  for (const record of records) {
    if (record.isLocked) {
      locked += 1;
    } else {
      unlocked += 1;
    }
  }

  return {
    locked,
    unlocked,
  };
};

const buildReadinessSummary = (records: TAttendanceFinalization[]) => {
  const totalRecords = records.length;
  const draftCount = records.filter((record) => record.status === "draft").length;
  const finalizedCount = records.filter(
    (record) => record.status === "finalized",
  ).length;
  const approvedCount = records.filter(
    (record) => record.status === "approved",
  ).length;
  const lockedCount = records.filter(
    (record) => record.status === "locked" && record.isLocked,
  ).length;
  const unlockedCount = totalRecords - lockedCount;
  const recordsWithMissingAttendance = records.filter(
    (record) => (record.sourceSummary?.missingAttendanceDays || 0) > 0,
  ).length;
  const recordsWithMissingApprovedLeave = records.filter(
    (record) => (record.sourceSummary?.missingApprovedLeaveDays || 0) > 0,
  ).length;

  const blockers: string[] = [];

  if (!totalRecords) {
    blockers.push("Attendance finalization has not been generated for this selection.");
  }

  if (draftCount) {
    blockers.push(`${draftCount} record(s) are still in draft status.`);
  }

  if (finalizedCount) {
    blockers.push(`${finalizedCount} record(s) are finalized but not approved.`);
  }

  if (approvedCount) {
    blockers.push(`${approvedCount} record(s) are approved but not locked.`);
  }

  if (unlockedCount && totalRecords) {
    blockers.push(`${unlockedCount} record(s) are not locked.`);
  }

  if (recordsWithMissingAttendance) {
    blockers.push(
      `${recordsWithMissingAttendance} record(s) have missing raw attendance days.`,
    );
  }

  if (recordsWithMissingApprovedLeave) {
    blockers.push(
      `${recordsWithMissingApprovedLeave} record(s) have leave status without approved leave record.`,
    );
  }

  const isFullyLocked = totalRecords > 0 && lockedCount === totalRecords;

  return {
    totalRecords,
    isGenerated: totalRecords > 0,
    isFullyFinalized: totalRecords > 0 && draftCount === 0,
    isFullyApproved:
      totalRecords > 0 && draftCount === 0 && finalizedCount === 0,
    isFullyLocked,
    canProcessSalarySheet: isFullyLocked,
    canProcessTimeBill: isFullyLocked,
    blockers,
  };
};

const getSnapshotGroupValue = (
  record: TAttendanceFinalization,
  groupBy: "majorDepartment" | "department" | "branch",
) => {
  const snapshotValue = record.employeeSnapshot?.[groupBy];

  return {
    id: snapshotValue?.id || getObjectIdString(record[groupBy]),
    name: snapshotValue?.name || "Unassigned",
  };
};

const buildGroupedOperationalSummary = (
  records: TAttendanceFinalization[],
  groupBy: "majorDepartment" | "department" | "branch",
) => {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      totalEmployees: number;
      statusSummary: Record<TAttendanceFinalizationStatus, number>;
      lockSummary: {
        locked: number;
        unlocked: number;
      };
      totals: TAttendanceFinalizationNumericTotals;
    }
  >();

  for (const record of records) {
    const groupValue = getSnapshotGroupValue(record, groupBy);
    const groupKey = groupValue.id || "unassigned";
    const existingGroup = groups.get(groupKey) || {
      id: groupValue.id,
      name: groupValue.name,
      totalEmployees: 0,
      statusSummary: {
        draft: 0,
        finalized: 0,
        approved: 0,
        locked: 0,
      },
      lockSummary: {
        locked: 0,
        unlocked: 0,
      },
      totals: createEmptyNumericTotals(),
    };

    existingGroup.totalEmployees += 1;
    existingGroup.statusSummary[record.status] += 1;

    if (record.isLocked) {
      existingGroup.lockSummary.locked += 1;
    } else {
      existingGroup.lockSummary.unlocked += 1;
    }

    addRecordToNumericTotals(existingGroup.totals, record);
    groups.set(groupKey, existingGroup);
  }

  return Array.from(groups.values())
    .map((group) => ({
      id: group.id,
      name: group.name,
      totalEmployees: group.totalEmployees,
      statusSummary: group.statusSummary,
      lockSummary: group.lockSummary,
      totals: normalizeNumericTotals(group.totals),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const getAttendanceFinalizationOperationalSummaryFromDB = async (
  query: TAttendanceFinalizationOperationalSummaryQuery,
) => {
  const { payrollMonth, filter } = buildOperationalSummaryFilter(query);
  const records = await AttendanceFinalization.find(filter)
    .sort({ "employeeSnapshot.employeeId": 1, createdAt: 1 })
    .lean<TAttendanceFinalization[]>();

  const totals = createEmptyNumericTotals();

  for (const record of records) {
    addRecordToNumericTotals(totals, record);
  }

  return {
    payrollMonth,
    filters: {
      company: query.company,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
    },
    readiness: buildReadinessSummary(records),
    statusSummary: buildStatusSummary(records),
    lockSummary: buildLockSummary(records),
    totals: normalizeNumericTotals(totals),
    groupedSummary: {
      byMajorDepartment: buildGroupedOperationalSummary(records, "majorDepartment"),
      byDepartment: buildGroupedOperationalSummary(records, "department"),
      byBranch: buildGroupedOperationalSummary(records, "branch"),
    },
  };
};

const deleteAttendanceFinalizationFromDB = async (
  id: string,
  options: TAttendanceFinalizationDeleteRestoreOptions = {},
) => {
  const finalizationId = toObjectId(id, "attendance finalization id");
  const existingFinalization = await getSingleAttendanceFinalizationFromDB(id);

  if (existingFinalization.isLocked || existingFinalization.status === "locked") {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked attendance finalization cannot be deleted.",
    );
  }

  const actionByObjectId =
    options.userId && Types.ObjectId.isValid(options.userId)
      ? toObjectId(options.userId, "user id")
      : null;

  const result = await AttendanceFinalization.findOneAndUpdate(
    { _id: finalizationId, isDeleted: false },
    {
      ...buildSoftDeleteUpdate({
        userId: options.userId,
        deleteReason: options.deleteReason,
      }),
      $push: {
        auditLogs: createAuditEntry({
          action: "soft_deleted",
          fromStatus: existingFinalization.status,
          toStatus: existingFinalization.status,
          actionBy: actionByObjectId?.toString(),
          note: options.deleteReason || "Soft deleted",
        }),
      },
    },
    { new: true, runValidators: true },
  )
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Attendance finalization not found.");
  }

  return result;
};

const restoreAttendanceFinalizationIntoDB = async (
  id: string,
  options: TAttendanceFinalizationDeleteRestoreOptions = {},
) => {
  const finalizationId = toObjectId(id, "attendance finalization id");
  const existingFinalization = await AttendanceFinalization.findOne(
    buildDeletedFilter({ _id: finalizationId }),
  );

  if (!existingFinalization) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Deleted attendance finalization not found.");
  }

  const duplicateFinalization = await AttendanceFinalization.findOne({
    employee: existingFinalization.employee,
    payrollMonth: existingFinalization.payrollMonth,
    isDeleted: false,
    _id: { $ne: finalizationId },
  });

  if (duplicateFinalization) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Cannot restore attendance finalization because an active record already exists for this employee and payroll month.",
    );
  }

  const actionByObjectId =
    options.userId && Types.ObjectId.isValid(options.userId)
      ? toObjectId(options.userId, "user id")
      : null;

  const result = await AttendanceFinalization.findOneAndUpdate(
    buildDeletedFilter({ _id: finalizationId }),
    {
      ...buildRestoreUpdate({
        userId: options.userId,
        restoreReason: options.restoreReason,
      }),
      $push: {
        auditLogs: createAuditEntry({
          action: "restored",
          fromStatus: existingFinalization.status,
          toStatus: existingFinalization.status,
          actionBy: actionByObjectId?.toString(),
          note: options.restoreReason || "Restored",
        }),
      },
    },
    { new: true, runValidators: true },
  )
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Deleted attendance finalization not found.");
  }

  return result;
};

const bulkFinalizeAttendanceFinalizationsIntoDB = async (
  payload: TAttendanceFinalizationBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeAttendanceFinalizationStatusIntoDB({
    action: "finalize",
    payload,
    actionBy,
  });
};

const bulkApproveAttendanceFinalizationsIntoDB = async (
  payload: TAttendanceFinalizationBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeAttendanceFinalizationStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockAttendanceFinalizationsIntoDB = async (
  payload: TAttendanceFinalizationBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeAttendanceFinalizationStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockAttendanceFinalizationsIntoDB = async (
  payload: TAttendanceFinalizationBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeAttendanceFinalizationStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};

export const AttendanceFinalizationServices = {
  generateMonthlyAttendanceFinalizationIntoDB,
  getAllAttendanceFinalizationFromDB,
  getDeletedAttendanceFinalizationFromDB,
  getSingleAttendanceFinalizationFromDB,
  getAttendanceFinalizationOperationalSummaryFromDB,
  finalizeAttendanceFinalizationIntoDB,
  approveAttendanceFinalizationIntoDB,
  lockAttendanceFinalizationIntoDB,
  unlockAttendanceFinalizationIntoDB,
  bulkFinalizeAttendanceFinalizationsIntoDB,
  bulkApproveAttendanceFinalizationsIntoDB,
  bulkLockAttendanceFinalizationsIntoDB,
  bulkUnlockAttendanceFinalizationsIntoDB,
  deleteAttendanceFinalizationFromDB,
  restoreAttendanceFinalizationIntoDB,
};

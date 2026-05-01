import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Attendance from "../attendance/attendance.model";
import Employee from "../employee/employee.model";
import Holiday from "../holiday/holiday.model";
import {
  ACTIVE_LEAVE_STATUSES,
  LIMITED_LEAVE_POLICIES,
  MANAGEMENT_CONTROLLED_LEAVE_TYPES,
  REPLACEMENT_LEAVE_TYPE,
} from "./leave.constant";
import type { TLeave, TLeaveStatus, TLeaveType } from "./leave.interface";
import Leave from "./leave.model";

type TCreateLeavePayload = Omit<TLeave, "totalDays" | "status"> & {
  totalDays?: number;
  status?: "pending";
};

type TUpdateLeavePayload = Partial<Omit<TLeave, "totalDays">> & {
  totalDays?: number;
};

type TLeaveDateFilter = {
  $gte?: string;
  $lte?: string;
};

type TLeaveDBFilter = {
  isDeleted: boolean;
  employee?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  managementConcernBy?: mongoose.Types.ObjectId;
  leaveType?: TLeaveType;
  status?: TLeaveStatus;
  startDate?: string | TLeaveDateFilter;
  endDate?: string | TLeaveDateFilter;
  replacementForDate?: string;
  managementConcern?: boolean;
};

type TLeaveOverlapFilter = {
  isDeleted: boolean;
  employee: mongoose.Types.ObjectId;
  status: {
    $in: TLeaveStatus[];
  };
  startDate: {
    $lte: string;
  };
  endDate: {
    $gte: string;
  };
  _id?: {
    $ne: mongoose.Types.ObjectId;
  };
};

const getStringQueryValue = (
  query: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = query[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
};

const toObjectId = (value: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(String(value));
};

const isManagementControlledLeaveType = (leaveType: TLeaveType) => {
  return (MANAGEMENT_CONTROLLED_LEAVE_TYPES as readonly string[]).includes(
    leaveType,
  );
};

const toUTCDate = (dateString: string) => {
  return new Date(`${dateString}T00:00:00.000Z`);
};

const calculateTotalLeaveDays = (startDate: string, endDate: string) => {
  const start = toUTCDate(startDate);
  const end = toUTCDate(endDate);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(
    (end.getTime() - start.getTime()) / millisecondsPerDay,
  );

  return diffDays + 1;
};

const getYearsInRange = (startDate: string, endDate: string) => {
  const startYear = toUTCDate(startDate).getUTCFullYear();
  const endYear = toUTCDate(endDate).getUTCFullYear();

  const years: number[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
};

const getYearStartDate = (year: number) => `${year}-01-01`;
const getYearEndDate = (year: number) => `${year}-12-31`;

const calculateOverlapDays = (
  leaveStartDate: string,
  leaveEndDate: string,
  rangeStartDate: string,
  rangeEndDate: string,
) => {
  const leaveStart = toUTCDate(leaveStartDate).getTime();
  const leaveEnd = toUTCDate(leaveEndDate).getTime();
  const rangeStart = toUTCDate(rangeStartDate).getTime();
  const rangeEnd = toUTCDate(rangeEndDate).getTime();

  const overlapStart = Math.max(leaveStart, rangeStart);
  const overlapEnd = Math.min(leaveEnd, rangeEnd);

  if (overlapEnd < overlapStart) {
    return 0;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((overlapEnd - overlapStart) / millisecondsPerDay) + 1;
};

const ensureEmployeeExists = async (employeeId: unknown) => {
  const employeeObjectId = toObjectId(employeeId, "employee ID");

  const employee = await Employee.findOne({
    _id: employeeObjectId,
    isDeleted: false,
  });

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  return employee;
};

const validateLeaveDateRange = (startDate: string, endDate: string) => {
  if (endDate < startDate) {
    throw new AppError(400, "End date cannot be earlier than start date");
  }
};

const ensureManagementConcernIfNeeded = ({
  leaveType,
  managementConcern,
  managementConcernNote,
  managementConcernBy,
}: {
  leaveType: TLeaveType;
  managementConcern?: boolean;
  managementConcernNote?: string;
  managementConcernBy?: unknown;
}) => {
  if (!isManagementControlledLeaveType(leaveType)) {
    return;
  }

  if (managementConcern !== true) {
    throw new AppError(
      400,
      "Management concern is required for paid, unpaid or others leave",
    );
  }

  if (!managementConcernNote?.trim()) {
    throw new AppError(
      400,
      "Management concern note is required for paid, unpaid or others leave",
    );
  }

  if (managementConcernBy && !mongoose.isValidObjectId(managementConcernBy)) {
    throw new AppError(400, "Invalid management concern by user ID");
  }
};

const ensureNoOverlappingLeave = async ({
  employeeId,
  startDate,
  endDate,
  excludeLeaveId,
  currentStatus,
}: {
  employeeId: unknown;
  startDate: string;
  endDate: string;
  excludeLeaveId?: string;
  currentStatus?: TLeaveStatus;
}) => {
  const effectiveStatus = currentStatus || "pending";

  if (!ACTIVE_LEAVE_STATUSES.includes(effectiveStatus)) {
    return;
  }

  const employeeObjectId = toObjectId(employeeId, "employee ID");

  const overlapFilter: TLeaveOverlapFilter = {
    employee: employeeObjectId,
    isDeleted: false,
    status: {
      $in: ACTIVE_LEAVE_STATUSES,
    },
    startDate: {
      $lte: endDate,
    },
    endDate: {
      $gte: startDate,
    },
  };

  if (excludeLeaveId) {
    overlapFilter._id = {
      $ne: toObjectId(excludeLeaveId, "leave ID"),
    };
  }

  const overlappingLeave = await Leave.findOne(overlapFilter);

  if (overlappingLeave) {
    throw new AppError(
      409,
      "Leave already exists for this employee within the selected date range",
    );
  }
};

const ensureLimitedLeaveBalance = async ({
  employeeId,
  leaveType,
  startDate,
  endDate,
  currentStatus,
  excludeLeaveId,
}: {
  employeeId: unknown;
  leaveType: TLeaveType;
  startDate: string;
  endDate: string;
  currentStatus?: TLeaveStatus;
  excludeLeaveId?: string;
}) => {
  const effectiveStatus = currentStatus || "pending";

  if (!ACTIVE_LEAVE_STATUSES.includes(effectiveStatus)) {
    return;
  }

  const policy =
    LIMITED_LEAVE_POLICIES[leaveType as keyof typeof LIMITED_LEAVE_POLICIES];

  if (!policy) {
    return;
  }

  const employeeObjectId = toObjectId(employeeId, "employee ID");
  const years = getYearsInRange(startDate, endDate);

  for (const year of years) {
    const yearStartDate = getYearStartDate(year);
    const yearEndDate = getYearEndDate(year);

    const requestedDaysInYear = calculateOverlapDays(
      startDate,
      endDate,
      yearStartDate,
      yearEndDate,
    );

    const usedLeaves = await Leave.find({
      employee: employeeObjectId,
      leaveType,
      isDeleted: false,
      status: {
        $in: ACTIVE_LEAVE_STATUSES,
      },
      startDate: {
        $lte: yearEndDate,
      },
      endDate: {
        $gte: yearStartDate,
      },
      ...(excludeLeaveId
        ? {
            _id: {
              $ne: toObjectId(excludeLeaveId, "leave ID"),
            },
          }
        : {}),
    });

    const usedDays = usedLeaves.reduce((total, leave) => {
      return (
        total +
        calculateOverlapDays(
          leave.startDate,
          leave.endDate,
          yearStartDate,
          yearEndDate,
        )
      );
    }, 0);

    const remainingDays = policy.annualLimit - usedDays;

    if (requestedDaysInYear > remainingDays) {
      throw new AppError(
        409,
        `${policy.label} limit exceeded for ${year}. Annual limit: ${policy.annualLimit} days, used: ${usedDays} days, remaining: ${Math.max(
          remainingDays,
          0,
        )} days`,
      );
    }
  }
};

const ensureReplacementLeaveEligibility = async ({
  employeeId,
  leaveType,
  startDate,
  endDate,
  replacementForDate,
  excludeLeaveId,
}: {
  employeeId: unknown;
  leaveType: TLeaveType;
  startDate: string;
  endDate: string;
  replacementForDate?: string;
  excludeLeaveId?: string;
}) => {
  if (leaveType !== REPLACEMENT_LEAVE_TYPE) {
    return;
  }

  if (!replacementForDate) {
    throw new AppError(
      400,
      "Replacement for date is required for replacement leave",
    );
  }

  const totalDays = calculateTotalLeaveDays(startDate, endDate);

  if (totalDays !== 1) {
    throw new AppError(
      400,
      "Replacement leave must be created for one day at a time",
    );
  }

  if (startDate <= replacementForDate) {
    throw new AppError(
      400,
      "Replacement leave cannot be taken before or on the worked holiday date",
    );
  }

  const employeeObjectId = toObjectId(employeeId, "employee ID");

  const holiday = await Holiday.findOne({
    holidayDate: replacementForDate,
    isDeleted: false,
  });

  if (!holiday) {
    throw new AppError(
      400,
      "Replacement leave is allowed only against an existing holiday record",
    );
  }

  const holidayDutyAttendance = await Attendance.findOne({
    employee: employeeObjectId,
    attendanceDate: replacementForDate,
    isDeleted: false,
    status: {
      $in: ["present", "late"],
    },
  });

  if (!holidayDutyAttendance) {
    throw new AppError(
      400,
      "Replacement leave requires employee attendance on the holiday date",
    );
  }

  const replacementLeaveFilter = {
    employee: employeeObjectId,
    leaveType: REPLACEMENT_LEAVE_TYPE,
    replacementForDate,
    isDeleted: false,
    status: {
      $in: ACTIVE_LEAVE_STATUSES,
    },
    ...(excludeLeaveId
      ? {
          _id: {
            $ne: toObjectId(excludeLeaveId, "leave ID"),
          },
        }
      : {}),
  };

  const alreadyUsedReplacementLeave = await Leave.findOne(
    replacementLeaveFilter,
  );

  if (alreadyUsedReplacementLeave) {
    throw new AppError(
      409,
      "Replacement leave has already been used for this holiday duty date",
    );
  }
};

const createLeaveIntoDB = async (payload: TCreateLeavePayload) => {
  await ensureEmployeeExists(payload.employee);

  validateLeaveDateRange(payload.startDate, payload.endDate);

  const currentStatus: TLeaveStatus = "pending";

  ensureManagementConcernIfNeeded({
    leaveType: payload.leaveType,
    managementConcern: payload.managementConcern,
    managementConcernNote: payload.managementConcernNote,
    managementConcernBy: payload.managementConcernBy,
  });

  await ensureReplacementLeaveEligibility({
    employeeId: payload.employee,
    leaveType: payload.leaveType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    replacementForDate: payload.replacementForDate,
  });

  await ensureNoOverlappingLeave({
    employeeId: payload.employee,
    startDate: payload.startDate,
    endDate: payload.endDate,
    currentStatus,
  });

  await ensureLimitedLeaveBalance({
    employeeId: payload.employee,
    leaveType: payload.leaveType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    currentStatus,
  });

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  const calculatedTotalDays = calculateTotalLeaveDays(
    payload.startDate,
    payload.endDate,
  );

  const result = await Leave.create({
    ...payload,
    status: currentStatus,
    totalDays: calculatedTotalDays,
  });

  const populatedResult = await Leave.findById(result._id)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .populate("managementConcernBy");

  return populatedResult;
};

const getAllLeaveFromDB = async (query: Record<string, unknown>) => {
  const filter: TLeaveDBFilter = {
    isDeleted: false,
  };

  const employee = getStringQueryValue(query, "employee");
  const approvedBy = getStringQueryValue(query, "approvedBy");
  const managementConcernBy = getStringQueryValue(query, "managementConcernBy");
  const leaveType = getStringQueryValue(query, "leaveType");
  const status = getStringQueryValue(query, "status");
  const startDate = getStringQueryValue(query, "startDate");
  const endDate = getStringQueryValue(query, "endDate");
  const fromDate = getStringQueryValue(query, "fromDate");
  const toDate = getStringQueryValue(query, "toDate");
  const replacementForDate = getStringQueryValue(query, "replacementForDate");
  const managementConcern = getStringQueryValue(query, "managementConcern");

  if (employee) {
    filter.employee = toObjectId(employee, "employee ID");
  }

  if (approvedBy) {
    filter.approvedBy = toObjectId(approvedBy, "approved by user ID");
  }

  if (managementConcernBy) {
    filter.managementConcernBy = toObjectId(
      managementConcernBy,
      "management concern by user ID",
    );
  }

  if (leaveType) {
    filter.leaveType = leaveType as TLeaveType;
  }

  if (status) {
    filter.status = status as TLeaveStatus;
  }

  if (fromDate || toDate) {
    filter.startDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  } else if (startDate) {
    filter.startDate = startDate;
  }

  if (endDate) {
    filter.endDate = endDate;
  }

  if (replacementForDate) {
    filter.replacementForDate = replacementForDate;
  }

  if (managementConcern === "true") {
    filter.managementConcern = true;
  }

  if (managementConcern === "false") {
    filter.managementConcern = false;
  }

  const result = await Leave.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .populate("managementConcernBy")
    .sort({
      createdAt: -1,
    });

  return result;
};

const getLeaveBalanceFromDB = async (employeeId: string, year: number) => {
  await ensureEmployeeExists(employeeId);

  const employeeObjectId = toObjectId(employeeId, "employee ID");
  const yearStartDate = getYearStartDate(year);
  const yearEndDate = getYearEndDate(year);

  const policies = Object.entries(LIMITED_LEAVE_POLICIES);

  const balances = await Promise.all(
    policies.map(async ([leaveType, policy]) => {
      const usedLeaves = await Leave.find({
        employee: employeeObjectId,
        leaveType,
        isDeleted: false,
        status: {
          $in: ACTIVE_LEAVE_STATUSES,
        },
        startDate: {
          $lte: yearEndDate,
        },
        endDate: {
          $gte: yearStartDate,
        },
      });

      const usedDays = usedLeaves.reduce((total, leave) => {
        return (
          total +
          calculateOverlapDays(
            leave.startDate,
            leave.endDate,
            yearStartDate,
            yearEndDate,
          )
        );
      }, 0);

      return {
        leaveType,
        label: policy.label,
        annualLimit: policy.annualLimit,
        usedDays,
        remainingDays: Math.max(policy.annualLimit - usedDays, 0),
      };
    }),
  );

  return {
    employee: employeeId,
    year,
    activeStatusesCounted: ACTIVE_LEAVE_STATUSES,
    balances,
  };
};

const getSingleLeaveFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const result = await Leave.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .populate("managementConcernBy");

  if (!result) {
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

const updateLeaveIntoDB = async (id: string, payload: TUpdateLeavePayload) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const existingLeave = await Leave.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingLeave) {
    throw new AppError(404, "Leave record not found");
  }

  if (payload.employee) {
    await ensureEmployeeExists(payload.employee);
  }

  if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) {
    throw new AppError(400, "Invalid approved by user ID");
  }

  if (
    payload.managementConcernBy &&
    !mongoose.isValidObjectId(payload.managementConcernBy)
  ) {
    throw new AppError(400, "Invalid management concern by user ID");
  }

  const nextEmployee = payload.employee || existingLeave.employee;
  const nextLeaveType = payload.leaveType || existingLeave.leaveType;
  const nextStartDate = payload.startDate || existingLeave.startDate;
  const nextEndDate = payload.endDate || existingLeave.endDate;
  const nextStatus = payload.status || existingLeave.status || "pending";
  const nextReplacementForDate =
    payload.replacementForDate || existingLeave.replacementForDate;
  const nextManagementConcern =
    payload.managementConcern ?? existingLeave.managementConcern;
  const nextManagementConcernNote =
    payload.managementConcernNote || existingLeave.managementConcernNote;
  const nextManagementConcernBy =
    payload.managementConcernBy || existingLeave.managementConcernBy;

  validateLeaveDateRange(nextStartDate, nextEndDate);

  ensureManagementConcernIfNeeded({
    leaveType: nextLeaveType,
    managementConcern: nextManagementConcern,
    managementConcernNote: nextManagementConcernNote,
    managementConcernBy: nextManagementConcernBy,
  });

  await ensureReplacementLeaveEligibility({
    employeeId: nextEmployee,
    leaveType: nextLeaveType,
    startDate: nextStartDate,
    endDate: nextEndDate,
    replacementForDate: nextReplacementForDate,
    excludeLeaveId: id,
  });

  await ensureNoOverlappingLeave({
    employeeId: nextEmployee,
    startDate: nextStartDate,
    endDate: nextEndDate,
    excludeLeaveId: id,
    currentStatus: nextStatus,
  });

  await ensureLimitedLeaveBalance({
    employeeId: nextEmployee,
    leaveType: nextLeaveType,
    startDate: nextStartDate,
    endDate: nextEndDate,
    excludeLeaveId: id,
    currentStatus: nextStatus,
  });

  const calculatedTotalDays = calculateTotalLeaveDays(
    nextStartDate,
    nextEndDate,
  );

  const setPayload: Record<string, unknown> = {
    ...payload,
    totalDays: calculatedTotalDays,
  };

  const unsetPayload: Record<string, string> = {};

  if (nextLeaveType !== REPLACEMENT_LEAVE_TYPE) {
    unsetPayload.replacementForDate = "";
  }

  if (!isManagementControlledLeaveType(nextLeaveType)) {
    unsetPayload.managementConcern = "";
    unsetPayload.managementConcernNote = "";
    unsetPayload.managementConcernBy = "";
  }

  const updateQuery: Record<string, unknown> = {
    $set: setPayload,
  };

  if (Object.keys(unsetPayload).length > 0) {
    updateQuery.$unset = unsetPayload;
  }

  const result = await Leave.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    updateQuery,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .populate("approvedBy")
    .populate("managementConcernBy");

  if (!result) {
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

const deleteLeaveFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid leave ID");
  }

  const result = await Leave.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Leave record not found");
  }

  return result;
};

export const LeaveServices = {
  createLeaveIntoDB,
  getAllLeaveFromDB,
  getLeaveBalanceFromDB,
  getSingleLeaveFromDB,
  updateLeaveIntoDB,
  deleteLeaveFromDB,
};

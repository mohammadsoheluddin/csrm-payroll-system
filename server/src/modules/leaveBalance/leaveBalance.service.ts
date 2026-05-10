import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import Attendance from "../attendance/attendance.model";
import Employee from "../employee/employee.model";
import Holiday from "../holiday/holiday.model";
import {
  LEAVE_TYPES,
  LIMITED_LEAVE_POLICIES,
  REPLACEMENT_LEAVE_TYPE,
  type TLeaveStatus,
  type TLeaveType,
} from "../leave/leave.constant";
import Leave from "../leave/leave.model";
import type {
  TGenerateLeaveBalancePayload,
  TLeaveBalance,
  TLeaveBalanceActionPayload,
  TLeaveBalanceAdjustmentPayload,
  TLeaveBalanceBulkActionPayload,
  TLeaveBalanceOpeningBalancePayload,
  TLeaveBalanceQuery,
  TLeaveBalanceSourceSummary,
  TLeaveBalanceSummaryQuery,
} from "./leaveBalance.interface";
import LeaveBalance from "./leaveBalance.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const PAID_LEAVE_TYPES = new Set<TLeaveType>([
  "casual",
  "sick",
  "earned",
  "paid",
  "maternity",
  "paternity",
  "official",
  "replacement",
]);

const LEAVE_LABELS: Record<TLeaveType, string> = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  paid: "Paid Leave",
  unpaid: "Unpaid Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  official: "Official Leave",
  replacement: "Replacement Leave",
  others: "Others Leave",
};

const assertObjectId = (value: string | undefined, fieldName: string) => {
  if (!value) {
    return;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }
};

const toObjectId = (value: string) => new Types.ObjectId(value);

const buildYearDateRange = (year: number) => {
  return {
    yearStartDate: `${year}-01-01`,
    yearEndDate: `${year}-12-31`,
  };
};

const toUTCDate = (dateString: string) => new Date(`${dateString}T00:00:00.000Z`);

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

const buildActionBy = (value?: string) => {
  if (value && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }

  return null;
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

const buildEmployeeFilter = ({
  yearEndDate,
  company,
  majorDepartment,
  department,
  branch,
  employee,
}: {
  yearEndDate: string;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}) => {
  const filter: Record<string, unknown> = {
    company: toObjectId(company),
    status: "active",
    isDeleted: false,
    employmentStatus: {
      $nin: ["resigned", "terminated", "retired", "suspended"],
    },
    joiningDate: {
      $lte: yearEndDate,
    },
  };

  if (majorDepartment) {
    filter.majorDepartment = toObjectId(majorDepartment);
  }

  if (department) {
    filter.department = toObjectId(department);
  }

  if (branch) {
    filter.branch = toObjectId(branch);
  }

  if (employee) {
    filter._id = toObjectId(employee);
  }

  return filter;
};

const buildLeaveBalanceFilter = (
  query: TLeaveBalanceQuery | TLeaveBalanceSummaryQuery | TLeaveBalanceBulkActionPayload,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.year) {
    filter.year = Number(query.year);
  }

  if (query.company) {
    assertObjectId(query.company, "Company");
    filter.company = toObjectId(query.company);
  }

  if (query.majorDepartment) {
    assertObjectId(query.majorDepartment, "Major department");
    filter.majorDepartment = toObjectId(query.majorDepartment);
  }

  if (query.department) {
    assertObjectId(query.department, "Department");
    filter.department = toObjectId(query.department);
  }

  if (query.branch) {
    assertObjectId(query.branch, "Branch");
    filter.branch = toObjectId(query.branch);
  }

  if (query.employee) {
    assertObjectId(query.employee, "Employee");
    filter.employee = toObjectId(query.employee);
  }

  if ("leaveType" in query && query.leaveType) {
    filter.leaveType = query.leaveType;
  }

  if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if ("isLocked" in query && query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  return filter;
};

const groupLeaveUsageByStatus = async ({
  employeeId,
  leaveType,
  yearStartDate,
  yearEndDate,
}: {
  employeeId: Types.ObjectId;
  leaveType: TLeaveType;
  yearStartDate: string;
  yearEndDate: string;
}) => {
  const leaves = await Leave.find({
    employee: employeeId,
    leaveType,
    isDeleted: false,
    startDate: { $lte: yearEndDate },
    endDate: { $gte: yearStartDate },
  });

  const usage = {
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  } satisfies Record<TLeaveStatus, number>;

  const sourceSummary: Pick<
    TLeaveBalanceSourceSummary,
    "approvedLeaveIds" | "pendingLeaveIds" | "rejectedLeaveIds" | "cancelledLeaveIds"
  > = {
    approvedLeaveIds: [],
    pendingLeaveIds: [],
    rejectedLeaveIds: [],
    cancelledLeaveIds: [],
  };

  leaves.forEach((leave) => {
    const status = (leave.status || "pending") as TLeaveStatus;
    const overlapDays = calculateOverlapDays(
      leave.startDate,
      leave.endDate,
      yearStartDate,
      yearEndDate,
    );
    const leaveId = getObjectIdString(leave._id);

    usage[status] += overlapDays;

    if (status === "approved") {
      sourceSummary.approvedLeaveIds.push(leaveId);
    }

    if (status === "pending") {
      sourceSummary.pendingLeaveIds.push(leaveId);
    }

    if (status === "rejected") {
      sourceSummary.rejectedLeaveIds.push(leaveId);
    }

    if (status === "cancelled") {
      sourceSummary.cancelledLeaveIds.push(leaveId);
    }
  });

  return {
    usage,
    sourceSummary,
  };
};

const getReplacementLeaveEarnedSummary = async ({
  employeeId,
  yearStartDate,
  yearEndDate,
}: {
  employeeId: Types.ObjectId;
  yearStartDate: string;
  yearEndDate: string;
}) => {
  const holidays = await Holiday.find({
    holidayDate: { $gte: yearStartDate, $lte: yearEndDate },
    isDeleted: false,
  }).select("holidayDate");

  const holidayDates = holidays.map((holiday) => holiday.holidayDate);

  if (holidayDates.length === 0) {
    return {
      earnedDays: 0,
      attendanceIds: [] as string[],
      holidayDates: [] as string[],
    };
  }

  const attendances = await Attendance.find({
    employee: employeeId,
    attendanceDate: { $in: holidayDates },
    status: { $in: ["present", "late"] },
    isDeleted: false,
  }).select("_id attendanceDate");

  const earnedHolidayDates = Array.from(
    new Set(attendances.map((attendance) => attendance.attendanceDate)),
  );

  return {
    earnedDays: earnedHolidayDates.length,
    attendanceIds: attendances.map((attendance) => getObjectIdString(attendance._id)),
    holidayDates: earnedHolidayDates,
  };
};

const getLeavePolicy = (leaveType: TLeaveType) => {
  const limitedPolicy =
    LIMITED_LEAVE_POLICIES[
      leaveType as keyof typeof LIMITED_LEAVE_POLICIES
    ];

  if (limitedPolicy) {
    return {
      label: limitedPolicy.label,
      entitlement: limitedPolicy.annualLimit,
      isLimited: true,
    };
  }

  if (leaveType === REPLACEMENT_LEAVE_TYPE) {
    return {
      label: LEAVE_LABELS[leaveType],
      entitlement: 0,
      isLimited: true,
    };
  }

  return {
    label: LEAVE_LABELS[leaveType],
    entitlement: 0,
    isLimited: false,
  };
};

const recalculateLeaveBalanceValues = (record: TLeaveBalance) => {
  record.carryForwardPolicy = "no_carry_forward";
  record.carryForwardFromPreviousYear = 0;
  record.totalCreditDays =
    record.openingBalance +
    record.yearlyEntitlement +
    record.earnedDays +
    record.adjustedDays +
    record.carryForwardFromPreviousYear;

  record.remainingDays = record.isLimited
    ? record.totalCreditDays - record.approvedConsumedDays
    : 0;
  record.availableDays = record.isLimited
    ? record.remainingDays - record.pendingDays
    : 0;
  record.overConsumedDays = record.isLimited
    ? Math.max(record.remainingDays * -1, 0)
    : 0;

  return record;
};

const buildLeaveBalanceRecord = async ({
  employee,
  leaveType,
  year,
  yearStartDate,
  yearEndDate,
  generatedBy,
  remarks,
}: {
  employee: any;
  leaveType: TLeaveType;
  year: number;
  yearStartDate: string;
  yearEndDate: string;
  generatedBy?: string;
  remarks?: string;
}): Promise<TLeaveBalance> => {
  const policy = getLeavePolicy(leaveType);
  const employeeObjectId = employee._id as Types.ObjectId;
  const leaveUsage = await groupLeaveUsageByStatus({
    employeeId: employeeObjectId,
    leaveType,
    yearStartDate,
    yearEndDate,
  });

  const replacementEarnedSummary =
    leaveType === REPLACEMENT_LEAVE_TYPE
      ? await getReplacementLeaveEarnedSummary({
          employeeId: employeeObjectId,
          yearStartDate,
          yearEndDate,
        })
      : {
          earnedDays: 0,
          attendanceIds: [] as string[],
          holidayDates: [] as string[],
        };

  const previousYearBalance = await LeaveBalance.findOne({
    employee: employeeObjectId,
    year: year - 1,
    leaveType,
    isDeleted: false,
  }).select("_id remainingDays");

  // CSRM policy: unused yearly leave is not carried forward.
  // Previous year remaining balance is tracked as expired for audit only.
  const openingBalance = 0;
  const adjustedDays = 0;
  const yearlyEntitlement = policy.entitlement;
  const earnedDays = replacementEarnedSummary.earnedDays;
  const carryForwardPolicy = "no_carry_forward" as const;
  const carryForwardFromPreviousYear = 0;
  const expiredPreviousYearRemainingDays = previousYearBalance
    ? Math.max(Number(previousYearBalance.remainingDays || 0), 0)
    : 0;
  const totalCreditDays =
    openingBalance +
    yearlyEntitlement +
    earnedDays +
    adjustedDays +
    carryForwardFromPreviousYear;
  const remainingDays = policy.isLimited
    ? totalCreditDays - leaveUsage.usage.approved
    : 0;
  const availableDays = policy.isLimited
    ? remainingDays - leaveUsage.usage.pending
    : 0;
  const overConsumedDays = policy.isLimited ? Math.max(remainingDays * -1, 0) : 0;
  const now = new Date();
  const generatedByObjectId = buildActionBy(generatedBy);

  return {
    employee: employeeObjectId,
    company: employee.company,
    majorDepartment: employee.majorDepartment,
    department: employee.department,
    designation: employee.designation,
    branch: employee.branch,
    employeeSnapshot: {
      employeeId: employee.employeeId,
      officeId: employee.officeId,
      cardNo: employee.cardNo,
      name: getEmployeeFullName(employee),
      joiningDate: employee.joiningDate,
      employmentStatus: employee.employmentStatus,
      serviceType: employee.serviceType,
      payType: employee.payType,
    },
    year,
    yearStartDate,
    yearEndDate,
    leaveType,
    leaveLabel: policy.label,
    isLimited: policy.isLimited,
    isPaidLeave: PAID_LEAVE_TYPES.has(leaveType),
    carryForwardPolicy,
    carryForwardFromPreviousYear,
    expiredPreviousYearRemainingDays,
    openingBalance,
    yearlyEntitlement,
    earnedDays,
    adjustedDays,
    approvedConsumedDays: leaveUsage.usage.approved,
    pendingDays: leaveUsage.usage.pending,
    rejectedDays: leaveUsage.usage.rejected,
    cancelledDays: leaveUsage.usage.cancelled,
    totalCreditDays,
    remainingDays,
    availableDays,
    overConsumedDays,
    sourceSummary: {
      ...leaveUsage.sourceSummary,
      replacementEarnedAttendanceIds: replacementEarnedSummary.attendanceIds,
      replacementEarnedHolidayDates: replacementEarnedSummary.holidayDates,
      previousYearLeaveBalanceId: previousYearBalance
        ? getObjectIdString(previousYearBalance._id)
        : undefined,
    },
    status: "generated",
    isLocked: false,
    generatedBy: generatedByObjectId,
    generatedAt: now,
    actionHistory: [
      {
        action: "generate",
        actionAt: now,
        actionBy: generatedByObjectId,
        note: remarks,
      },
    ],
    remarks,
    isDeleted: false,
  };
};

const generateLeaveBalancesIntoDB = async (
  payload: TGenerateLeaveBalancePayload,
) => {
  assertObjectId(payload.company, "Company");
  assertObjectId(payload.majorDepartment, "Major department");
  assertObjectId(payload.department, "Department");
  assertObjectId(payload.branch, "Branch");
  assertObjectId(payload.employee, "Employee");
  assertObjectId(payload.generatedBy, "Generated by user");

  const { yearStartDate, yearEndDate } = buildYearDateRange(payload.year);

  const employees = await Employee.find(
    buildEmployeeFilter({
      yearEndDate,
      company: payload.company,
      majorDepartment: payload.majorDepartment,
      department: payload.department,
      branch: payload.branch,
      employee: payload.employee,
    }),
  );

  if (employees.length === 0) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No eligible active employee found for leave balance generation.",
    );
  }

  const employeeIds = employees.map((employee) => employee._id);
  const existingRecords = await LeaveBalance.find({
    employee: { $in: employeeIds },
    year: payload.year,
    isDeleted: false,
  });

  if (existingRecords.length > 0 && !payload.overwrite) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Leave balance already exists for the selected scope and year. Use overwrite=true to regenerate unlocked records.",
    );
  }

  const lockedRecords = existingRecords.filter((record) => record.isLocked);

  if (lockedRecords.length > 0) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Leave balance regeneration blocked. One or more selected leave balance records are locked.",
    );
  }

  if (payload.overwrite && existingRecords.length > 0) {
    await LeaveBalance.deleteMany({
      employee: { $in: employeeIds },
      year: payload.year,
      isLocked: false,
      isDeleted: false,
    });
  }

  const leaveBalanceRecords: TLeaveBalance[] = [];

  for (const employee of employees) {
    for (const leaveType of LEAVE_TYPES) {
      const record = await buildLeaveBalanceRecord({
        employee,
        leaveType,
        year: payload.year,
        yearStartDate,
        yearEndDate,
        generatedBy: payload.generatedBy,
        remarks: payload.remarks,
      });

      leaveBalanceRecords.push(record);
    }
  }

  const createdRecords = await LeaveBalance.insertMany(leaveBalanceRecords);

  return {
    year: payload.year,
    employeeCount: employees.length,
    recordCount: createdRecords.length,
    generatedRecords: createdRecords,
  };
};

const getAllLeaveBalancesFromDB = async (query: TLeaveBalanceQuery) => {
  const filter = buildLeaveBalanceFilter(query);

  const result = await LeaveBalance.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ year: -1, "employeeSnapshot.employeeId": 1, leaveType: 1 });

  return result;
};

const getSingleLeaveBalanceFromDB = async (id: string) => {
  assertObjectId(id, "Leave balance");

  const result = await LeaveBalance.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("generatedBy")
    .populate("lockedBy")
    .populate("unlockedBy");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Leave balance record not found.");
  }

  return result;
};

const getLeaveBalanceSummaryFromDB = async (
  query: TLeaveBalanceSummaryQuery,
) => {
  const filter = buildLeaveBalanceFilter(query);
  const records = await LeaveBalance.find(filter);

  const summary = {
    year: query.year ? Number(query.year) : null,
    totalRecords: records.length,
    employeeCount: new Set(records.map((record) => getObjectIdString(record.employee))).size,
    generatedRecords: 0,
    lockedRecords: 0,
    openingBalanceDays: 0,
    adjustedDays: 0,
    carryForwardFromPreviousYear: 0,
    expiredPreviousYearRemainingDays: 0,
    totalCreditDays: 0,
    approvedConsumedDays: 0,
    pendingDays: 0,
    remainingDays: 0,
    overConsumedDays: 0,
    byLeaveType: LEAVE_TYPES.reduce(
      (accumulator, leaveType) => {
        accumulator[leaveType] = {
          recordCount: 0,
          lockedRecords: 0,
          openingBalanceDays: 0,
          adjustedDays: 0,
          carryForwardFromPreviousYear: 0,
          expiredPreviousYearRemainingDays: 0,
          totalCreditDays: 0,
          approvedConsumedDays: 0,
          pendingDays: 0,
          remainingDays: 0,
          overConsumedDays: 0,
        };

        return accumulator;
      },
      {} as Record<
        TLeaveType,
        {
          recordCount: number;
          lockedRecords: number;
          openingBalanceDays: number;
          adjustedDays: number;
          carryForwardFromPreviousYear: number;
          expiredPreviousYearRemainingDays: number;
          totalCreditDays: number;
          approvedConsumedDays: number;
          pendingDays: number;
          remainingDays: number;
          overConsumedDays: number;
        }
      >,
    ),
    readiness: {
      isGenerated: records.length > 0,
      isFullyLocked: records.length > 0 && records.every((record) => record.isLocked),
      hasOverConsumedBalance: records.some((record) => record.overConsumedDays > 0),
      nextRequiredAction: "generate_leave_balance",
      blockers: [] as string[],
    },
  };

  records.forEach((record) => {
    if (record.status === "generated") {
      summary.generatedRecords += 1;
    }

    if (record.isLocked) {
      summary.lockedRecords += 1;
    }

    summary.openingBalanceDays += record.openingBalance;
    summary.adjustedDays += record.adjustedDays;
    summary.carryForwardFromPreviousYear += record.carryForwardFromPreviousYear;
    summary.expiredPreviousYearRemainingDays += record.expiredPreviousYearRemainingDays;
    summary.totalCreditDays += record.totalCreditDays;
    summary.approvedConsumedDays += record.approvedConsumedDays;
    summary.pendingDays += record.pendingDays;
    summary.remainingDays += record.remainingDays;
    summary.overConsumedDays += record.overConsumedDays;

    const leaveTypeSummary = summary.byLeaveType[record.leaveType];
    leaveTypeSummary.recordCount += 1;
    leaveTypeSummary.lockedRecords += record.isLocked ? 1 : 0;
    leaveTypeSummary.openingBalanceDays += record.openingBalance;
    leaveTypeSummary.adjustedDays += record.adjustedDays;
    leaveTypeSummary.carryForwardFromPreviousYear += record.carryForwardFromPreviousYear;
    leaveTypeSummary.expiredPreviousYearRemainingDays +=
      record.expiredPreviousYearRemainingDays;
    leaveTypeSummary.totalCreditDays += record.totalCreditDays;
    leaveTypeSummary.approvedConsumedDays += record.approvedConsumedDays;
    leaveTypeSummary.pendingDays += record.pendingDays;
    leaveTypeSummary.remainingDays += record.remainingDays;
    leaveTypeSummary.overConsumedDays += record.overConsumedDays;
  });

  if (!summary.readiness.isGenerated) {
    summary.readiness.blockers.push("Leave balance is not generated for selected scope.");
  }

  if (summary.readiness.isGenerated && !summary.readiness.isFullyLocked) {
    summary.readiness.nextRequiredAction = "lock_leave_balance";
    summary.readiness.blockers.push("Leave balance has unlocked records.");
  }

  if (summary.readiness.isFullyLocked) {
    summary.readiness.nextRequiredAction = "ready_for_leave_balance_reporting";
  }

  if (summary.readiness.hasOverConsumedBalance) {
    summary.readiness.blockers.push("One or more employees have over-consumed limited leave balance.");
  }

  return summary;
};

const updateLeaveBalanceLockState = async ({
  id,
  action,
  payload,
}: {
  id: string;
  action: "lock" | "unlock";
  payload: TLeaveBalanceActionPayload;
}) => {
  const record = await getSingleLeaveBalanceFromDB(id);
  const now = new Date();
  const actionBy = buildActionBy(payload.actionBy);

  if (action === "lock" && record.isLocked) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Leave balance is already locked.");
  }

  if (action === "unlock" && !record.isLocked) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Leave balance is already unlocked.");
  }

  if (action === "lock") {
    record.status = "locked";
    record.isLocked = true;
    record.lockedAt = now;
    record.lockedBy = actionBy;
  } else {
    record.status = "generated";
    record.isLocked = false;
    record.unlockedAt = now;
    record.unlockedBy = actionBy;
  }

  record.actionHistory.push({
    action,
    actionAt: now,
    actionBy,
    note: payload.note,
  });

  await record.save();

  return getSingleLeaveBalanceFromDB(id);
};

const bulkUpdateLeaveBalanceLockState = async ({
  action,
  payload,
}: {
  action: "lock" | "unlock";
  payload: TLeaveBalanceBulkActionPayload;
}) => {
  const filter = buildLeaveBalanceFilter({
    ...payload,
    year: String(payload.year),
  });

  const records = await LeaveBalance.find(filter);

  if (records.length === 0) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No leave balance records found for selected bulk action scope.",
    );
  }

  const strict = payload.strict !== false;

  if (strict && action === "lock") {
    const alreadyLockedCount = records.filter((record) => record.isLocked).length;

    if (alreadyLockedCount > 0) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Bulk leave balance lock blocked. One or more selected records are already locked.",
      );
    }
  }

  if (strict && action === "unlock") {
    const alreadyUnlockedCount = records.filter((record) => !record.isLocked).length;

    if (alreadyUnlockedCount > 0) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Bulk leave balance unlock blocked. One or more selected records are already unlocked.",
      );
    }
  }

  const now = new Date();
  const actionBy = buildActionBy(payload.actionBy);
  let matchedCount = 0;

  for (const record of records) {
    const shouldUpdate = action === "lock" ? !record.isLocked : record.isLocked;

    if (!shouldUpdate) {
      continue;
    }

    matchedCount += 1;

    if (action === "lock") {
      record.status = "locked";
      record.isLocked = true;
      record.lockedAt = now;
      record.lockedBy = actionBy;
    } else {
      record.status = "generated";
      record.isLocked = false;
      record.unlockedAt = now;
      record.unlockedBy = actionBy;
    }

    record.actionHistory.push({
      action,
      actionAt: now,
      actionBy,
      note: payload.note,
    });

    await record.save();
  }

  return {
    action,
    selectedCount: records.length,
    updatedCount: matchedCount,
  };
};

const setLeaveBalanceOpeningBalanceIntoDB = async ({
  id,
  payload,
}: {
  id: string;
  payload: TLeaveBalanceOpeningBalancePayload;
}) => {
  const record = await getSingleLeaveBalanceFromDB(id);

  if (record.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Leave balance opening balance update blocked. The selected leave balance is locked.",
    );
  }

  const now = new Date();
  const actionBy = buildActionBy(payload.actionBy);
  const openingBalanceBefore = record.openingBalance;
  const adjustedDaysBefore = record.adjustedDays;

  record.openingBalance = payload.openingBalance;
  recalculateLeaveBalanceValues(record);

  record.actionHistory.push({
    action: "set_opening_balance",
    actionAt: now,
    actionBy,
    note: payload.note,
    reason: payload.reason,
    effectiveDate: payload.effectiveDate,
    days: payload.openingBalance,
    openingBalanceBefore,
    openingBalanceAfter: record.openingBalance,
    adjustedDaysBefore,
    adjustedDaysAfter: record.adjustedDays,
  });

  await record.save();

  return getSingleLeaveBalanceFromDB(id);
};

const adjustLeaveBalanceIntoDB = async ({
  id,
  payload,
}: {
  id: string;
  payload: TLeaveBalanceAdjustmentPayload;
}) => {
  const record = await getSingleLeaveBalanceFromDB(id);

  if (record.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Leave balance adjustment blocked. The selected leave balance is locked.",
    );
  }

  if (!record.isLimited) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Leave balance adjustment is allowed only for limited leave types.",
    );
  }

  const now = new Date();
  const actionBy = buildActionBy(payload.actionBy);
  const openingBalanceBefore = record.openingBalance;
  const adjustedDaysBefore = record.adjustedDays;
  const signedAdjustmentDays =
    payload.adjustmentType === "credit" ? payload.days : payload.days * -1;

  record.adjustedDays += signedAdjustmentDays;
  recalculateLeaveBalanceValues(record);

  record.actionHistory.push({
    action:
      payload.adjustmentType === "credit"
        ? "adjustment_credit"
        : "adjustment_debit",
    actionAt: now,
    actionBy,
    note: payload.note,
    reason: payload.reason,
    effectiveDate: payload.effectiveDate,
    days: payload.days,
    openingBalanceBefore,
    openingBalanceAfter: record.openingBalance,
    adjustedDaysBefore,
    adjustedDaysAfter: record.adjustedDays,
  });

  await record.save();

  return getSingleLeaveBalanceFromDB(id);
};

export const LeaveBalanceServices = {
  generateLeaveBalancesIntoDB,
  getAllLeaveBalancesFromDB,
  getSingleLeaveBalanceFromDB,
  getLeaveBalanceSummaryFromDB,
  setLeaveBalanceOpeningBalanceIntoDB,
  adjustLeaveBalanceIntoDB,
  updateLeaveBalanceLockState,
  bulkUpdateLeaveBalanceLockState,
};

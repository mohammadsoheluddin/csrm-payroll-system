import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import Attendance from "../attendance/attendance.model";
import type { TAttendanceSource, TAttendanceStatus } from "../attendance/attendance.interface";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import Employee from "../employee/employee.model";
import type {
  TAttendanceImportPayload,
  TAttendanceImportProcessedAttendance,
  TAttendanceImportQuery,
  TAttendanceImportRawRow,
  TAttendanceImportRejectedRow,
  TAttendanceImportSummary,
} from "./attendanceImport.interface";
import AttendanceImportBatch from "./attendanceImport.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const VALID_ATTENDANCE_STATUSES: TAttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "leave",
  "half-day",
  "weekend",
  "holiday",
];

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

const normalizeIdentifier = (value: string) => value.trim().toUpperCase();

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

const isValidDateString = (value: string) => {
  const date = new Date(value);

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const isValidTimeString = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const getPayrollMonthFromDate = (dateString: string) => dateString.slice(0, 7);

const generateBatchNo = () => {
  const randomText = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `AIB-${Date.now()}-${randomText}`;
};

const getAttendanceSourceFromImportSource = (
  source: TAttendanceImportPayload["source"],
): TAttendanceSource => {
  if (source === "device") {
    return "device";
  }

  return "import";
};

type TEmployeeDocumentLike = {
  _id: Types.ObjectId;
  employeeId: string;
  officeId?: string;
  cardNo?: string;
  name?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  company?: Types.ObjectId;
  majorDepartment?: Types.ObjectId;
  department?: Types.ObjectId;
  branch?: Types.ObjectId;
};

type TAggregatedAttendance = {
  employee: TEmployeeDocumentLike;
  employeeIdentifier: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: TAttendanceStatus;
  deviceId?: string;
  remarks: string[];
};

const pushRejectedRow = (
  rejectedRows: TAttendanceImportRejectedRow[],
  row: Partial<TAttendanceImportRawRow>,
  reason: string,
) => {
  rejectedRows.push({
    rowNo: row.rowNo,
    employeeIdentifier: row.employeeIdentifier,
    attendanceDate: row.attendanceDate,
    reason,
    rawPayload: row.rawPayload,
  });
};

const buildEmployeeLookup = async (payload: TAttendanceImportPayload) => {
  const identifiers = Array.from(
    new Set(
      payload.rows
        .map((row) => normalizeIdentifier(row.employeeIdentifier || ""))
        .filter(Boolean),
    ),
  );

  if (!identifiers.length) {
    return new Map<string, TEmployeeDocumentLike>();
  }

  const employeeFilter: Record<string, unknown> = {
    isDeleted: false,
    [payload.matchBy]: {
      $in: identifiers,
    },
  };

  if (payload.company) {
    employeeFilter.company = toObjectId(payload.company, "company id");
  }

  if (payload.majorDepartment) {
    employeeFilter.majorDepartment = toObjectId(
      payload.majorDepartment,
      "major department id",
    );
  }

  if (payload.department) {
    employeeFilter.department = toObjectId(payload.department, "department id");
  }

  if (payload.branch) {
    employeeFilter.branch = toObjectId(payload.branch, "branch id");
  }

  const employees = await Employee.find(employeeFilter)
    .select("_id employeeId officeId cardNo name company majorDepartment department branch")
    .lean<TEmployeeDocumentLike[]>();

  const employeeMap = new Map<string, TEmployeeDocumentLike>();

  employees.forEach((employee) => {
    const keyValue = employee[payload.matchBy as keyof TEmployeeDocumentLike];

    if (typeof keyValue === "string" && keyValue.trim()) {
      employeeMap.set(normalizeIdentifier(keyValue), employee);
    }
  });

  return employeeMap;
};

const mergeTimeValue = ({
  currentValue,
  incomingValue,
  mode,
}: {
  currentValue?: string;
  incomingValue?: string;
  mode: "min" | "max";
}) => {
  if (!incomingValue) {
    return currentValue;
  }

  if (!currentValue) {
    return incomingValue;
  }

  if (mode === "min") {
    return incomingValue < currentValue ? incomingValue : currentValue;
  }

  return incomingValue > currentValue ? incomingValue : currentValue;
};

const determineFinalStatus = (group: TAggregatedAttendance): TAttendanceStatus => {
  if (group.status) {
    return group.status;
  }

  if (group.checkInTime || group.checkOutTime) {
    return "present";
  }

  return "absent";
};

const buildGroupedAttendances = async (payload: TAttendanceImportPayload) => {
  const employeeMap = await buildEmployeeLookup(payload);
  const rejectedRows: TAttendanceImportRejectedRow[] = [];
  const groupedAttendances = new Map<string, TAggregatedAttendance>();
  let validRows = 0;

  payload.rows.forEach((row, index) => {
    const rowNo = row.rowNo || index + 1;
    const employeeIdentifier = normalizeIdentifier(row.employeeIdentifier || "");

    if (!employeeIdentifier) {
      pushRejectedRow(rejectedRows, { ...row, rowNo }, "Employee identifier is required.");
      return;
    }

    if (!isValidDateString(row.attendanceDate)) {
      pushRejectedRow(
        rejectedRows,
        { ...row, rowNo },
        "Attendance date must be a valid YYYY-MM-DD date.",
      );
      return;
    }

    const timeFields: Array<[string, string | undefined]> = [
      ["Punch time", row.punchTime],
      ["Check-in time", row.checkInTime],
      ["Check-out time", row.checkOutTime],
    ];

    const invalidTime = timeFields.find(([, value]) => value && !isValidTimeString(value));

    if (invalidTime) {
      pushRejectedRow(
        rejectedRows,
        { ...row, rowNo },
        `${invalidTime[0]} must follow HH:mm 24-hour format.`,
      );
      return;
    }

    if (row.checkInTime && row.checkOutTime && row.checkOutTime < row.checkInTime) {
      pushRejectedRow(
        rejectedRows,
        { ...row, rowNo },
        "Check-out time cannot be earlier than check-in time.",
      );
      return;
    }

    if (row.status && !VALID_ATTENDANCE_STATUSES.includes(row.status)) {
      pushRejectedRow(rejectedRows, { ...row, rowNo }, "Invalid attendance status.");
      return;
    }

    const employee = employeeMap.get(employeeIdentifier);

    if (!employee) {
      pushRejectedRow(
        rejectedRows,
        { ...row, rowNo },
        `Employee not found by ${payload.matchBy}: ${employeeIdentifier}.`,
      );
      return;
    }

    validRows += 1;

    const groupKey = `${getObjectIdString(employee._id)}__${row.attendanceDate}`;
    const existingGroup = groupedAttendances.get(groupKey);

    const punchTime = row.punchTime;
    const checkInTime = row.checkInTime || punchTime;
    const checkOutTime = row.checkOutTime || punchTime;

    if (!existingGroup) {
      groupedAttendances.set(groupKey, {
        employee,
        employeeIdentifier,
        attendanceDate: row.attendanceDate,
        checkInTime,
        checkOutTime: checkOutTime && checkOutTime !== checkInTime ? checkOutTime : row.checkOutTime,
        status: row.status,
        deviceId: row.deviceId || payload.deviceId,
        remarks: row.remarks ? [row.remarks] : [],
      });
      return;
    }

    existingGroup.checkInTime = mergeTimeValue({
      currentValue: existingGroup.checkInTime,
      incomingValue: checkInTime,
      mode: "min",
    });
    existingGroup.checkOutTime = mergeTimeValue({
      currentValue: existingGroup.checkOutTime,
      incomingValue: checkOutTime,
      mode: "max",
    });
    existingGroup.status = row.status || existingGroup.status;
    existingGroup.deviceId = row.deviceId || existingGroup.deviceId || payload.deviceId;

    if (row.remarks) {
      existingGroup.remarks.push(row.remarks);
    }
  });

  return {
    validRows,
    rejectedRows,
    groupedAttendances: Array.from(groupedAttendances.values()),
  };
};

const buildExistingAttendanceMap = async (groupedAttendances: TAggregatedAttendance[]) => {
  if (!groupedAttendances.length) {
    return new Map<string, any>();
  }

  const employeeIds = Array.from(
    new Set(groupedAttendances.map((item) => getObjectIdString(item.employee._id))),
  ).map((id) => new Types.ObjectId(id));
  const attendanceDates = Array.from(
    new Set(groupedAttendances.map((item) => item.attendanceDate)),
  );

  const existingAttendances = await Attendance.find({
    employee: {
      $in: employeeIds,
    },
    attendanceDate: {
      $in: attendanceDates,
    },
    isDeleted: false,
  }).lean<any[]>();

  const attendanceMap = new Map<string, any>();

  existingAttendances.forEach((attendance) => {
    attendanceMap.set(
      `${getObjectIdString(attendance.employee)}__${attendance.attendanceDate}`,
      attendance,
    );
  });

  return attendanceMap;
};

const findLockedAttendanceFinalizationBlockers = async (
  groupedAttendances: TAggregatedAttendance[],
) => {
  if (!groupedAttendances.length) {
    return [];
  }

  const employeeIds = Array.from(
    new Set(groupedAttendances.map((item) => getObjectIdString(item.employee._id))),
  ).map((id) => new Types.ObjectId(id));
  const payrollMonths = Array.from(
    new Set(groupedAttendances.map((item) => getPayrollMonthFromDate(item.attendanceDate))),
  );

  const lockedFinalizations = await AttendanceFinalization.find({
    employee: {
      $in: employeeIds,
    },
    payrollMonth: {
      $in: payrollMonths,
    },
    isLocked: true,
    isDeleted: false,
  })
    .select("_id employee employeeSnapshot payrollMonth")
    .lean<any[]>();

  return lockedFinalizations.map((item) => ({
    employee: getObjectIdString(item.employee),
    employeeId: item.employeeSnapshot?.employeeId || "",
    employeeName: item.employeeSnapshot?.employeeName || "",
    payrollMonth: item.payrollMonth,
    attendanceFinalization: getObjectIdString(item._id),
  }));
};

const buildProcessedAttendanceSummary = async ({
  payload,
  commit,
  batchNo,
}: {
  payload: TAttendanceImportPayload;
  commit: boolean;
  batchNo?: string;
}): Promise<TAttendanceImportSummary> => {
  const { validRows, rejectedRows, groupedAttendances } =
    await buildGroupedAttendances(payload);
  const existingAttendanceMap = await buildExistingAttendanceMap(groupedAttendances);
  const lockedMonthBlockers = commit
    ? await findLockedAttendanceFinalizationBlockers(groupedAttendances)
    : [];

  if (commit && lockedMonthBlockers.length) {
    return {
      totalRows: payload.rows.length,
      validRows,
      invalidRows: rejectedRows.length,
      groupedAttendanceCount: groupedAttendances.length,
      insertedAttendanceCount: 0,
      updatedAttendanceCount: 0,
      skippedAttendanceCount: 0,
      rejectedRows,
      processedAttendances: [],
      warnings: [
        "Attendance import blocked because one or more target employee/month finalizations are already locked.",
      ],
      lockedMonthBlockers,
    };
  }

  let insertedAttendanceCount = 0;
  let updatedAttendanceCount = 0;
  let skippedAttendanceCount = 0;
  const processedAttendances: TAttendanceImportProcessedAttendance[] = [];

  for (const group of groupedAttendances) {
    const groupKey = `${getObjectIdString(group.employee._id)}__${group.attendanceDate}`;
    const existingAttendance = existingAttendanceMap.get(groupKey);
    const shouldUpdate = Boolean(existingAttendance && payload.overwrite);
    const shouldSkip = Boolean(existingAttendance && !payload.overwrite);
    const action = shouldSkip ? "skip" : shouldUpdate ? "update" : "insert";
    const status = determineFinalStatus(group);
    const rowRemarks = group.remarks.length
      ? Array.from(new Set(group.remarks)).join(" | ")
      : undefined;
    const importRemarks = [
      batchNo ? `Imported via batch ${batchNo}` : "Attendance import preview",
      rowRemarks,
      payload.remarks,
    ]
      .filter(Boolean)
      .join(" | ");

    let attendanceId = existingAttendance?._id
      ? new Types.ObjectId(getObjectIdString(existingAttendance._id))
      : undefined;

    if (commit && action === "insert") {
      const createdAttendance = await Attendance.create({
        employee: group.employee._id,
        attendanceDate: group.attendanceDate,
        checkInTime: group.checkInTime,
        checkOutTime: group.checkOutTime,
        status,
        source: getAttendanceSourceFromImportSource(payload.source),
        remarks: importRemarks,
        deviceId: group.deviceId || payload.deviceId,
        importBatchNo: batchNo,
      });

      attendanceId = createdAttendance._id as Types.ObjectId;
    }

    if (commit && action === "update" && existingAttendance?._id) {
      await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          checkInTime: group.checkInTime,
          checkOutTime: group.checkOutTime,
          status,
          source: getAttendanceSourceFromImportSource(payload.source),
          remarks: importRemarks,
          deviceId: group.deviceId || payload.deviceId,
          importBatchNo: batchNo,
        },
        {
          runValidators: true,
        },
      );
    }

    if (action === "insert") {
      insertedAttendanceCount += 1;
    } else if (action === "update") {
      updatedAttendanceCount += 1;
    } else {
      skippedAttendanceCount += 1;
    }

    processedAttendances.push({
      employee: group.employee._id,
      employeeIdentifier: group.employeeIdentifier,
      employeeId: group.employee.employeeId,
      employeeName: getEmployeeFullName(group.employee),
      attendanceDate: group.attendanceDate,
      checkInTime: group.checkInTime,
      checkOutTime: group.checkOutTime,
      status,
      action,
      existingAttendance: existingAttendance?._id
        ? new Types.ObjectId(getObjectIdString(existingAttendance._id))
        : undefined,
      attendance: attendanceId,
      deviceId: group.deviceId || payload.deviceId,
      remarks: importRemarks,
    });
  }

  const warnings: string[] = [];

  if (skippedAttendanceCount > 0 && !payload.overwrite) {
    warnings.push(
      `${skippedAttendanceCount} attendance record(s) were skipped because attendance already exists and overwrite=false.`,
    );
  }

  if (rejectedRows.length > 0) {
    warnings.push(`${rejectedRows.length} row(s) were rejected during validation.`);
  }

  return {
    totalRows: payload.rows.length,
    validRows,
    invalidRows: rejectedRows.length,
    groupedAttendanceCount: groupedAttendances.length,
    insertedAttendanceCount,
    updatedAttendanceCount,
    skippedAttendanceCount,
    rejectedRows,
    processedAttendances,
    warnings,
    lockedMonthBlockers,
  };
};

const previewAttendanceImportFromPayload = async (
  payload: TAttendanceImportPayload,
) => {
  const result = await buildProcessedAttendanceSummary({
    payload,
    commit: false,
  });

  return {
    mode: "preview",
    source: payload.source,
    matchBy: payload.matchBy,
    overwrite: Boolean(payload.overwrite),
    filters: {
      company: payload.company || null,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      deviceId: payload.deviceId || null,
      sourceFileName: payload.sourceFileName || null,
    },
    summary: result,
  };
};

const commitAttendanceImportIntoDB = async (
  payload: TAttendanceImportPayload,
  userId?: string,
) => {
  const batchNo = generateBatchNo();
  const result = await buildProcessedAttendanceSummary({
    payload,
    commit: true,
    batchNo,
  });

  if (result.lockedMonthBlockers?.length) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Attendance import blocked. One or more target employee/month attendance finalizations are already locked.",
    );
  }

  const batch = await AttendanceImportBatch.create({
    batchNo,
    source: payload.source,
    matchBy: payload.matchBy,
    company: getOptionalObjectId(payload.company, "company id"),
    majorDepartment: getOptionalObjectId(payload.majorDepartment, "major department id"),
    department: getOptionalObjectId(payload.department, "department id"),
    branch: getOptionalObjectId(payload.branch, "branch id"),
    deviceId: payload.deviceId,
    sourceFileName: payload.sourceFileName,
    overwrite: Boolean(payload.overwrite),
    status: "committed",
    totalRows: result.totalRows,
    validRows: result.validRows,
    invalidRows: result.invalidRows,
    groupedAttendanceCount: result.groupedAttendanceCount,
    insertedAttendanceCount: result.insertedAttendanceCount,
    updatedAttendanceCount: result.updatedAttendanceCount,
    skippedAttendanceCount: result.skippedAttendanceCount,
    rejectedRows: result.rejectedRows,
    processedAttendances: result.processedAttendances,
    warnings: result.warnings,
    remarks: payload.remarks,
    processedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
    processedAt: new Date(),
  });

  return AttendanceImportBatch.findById(batch._id)
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("branch")
    .populate("processedBy", "name email role")
    .populate({
      path: "processedAttendances.employee",
      select: "employeeId officeId cardNo name",
    });
};

const getAllAttendanceImportsFromDB = async (query: TAttendanceImportQuery) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.source) {
    filter.source = query.source;
  }

  if (query.matchBy) {
    filter.matchBy = query.matchBy;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.company) {
    filter.company = toObjectId(query.company, "company id");
  }

  if (query.department) {
    filter.department = toObjectId(query.department, "department id");
  }

  if (query.branch) {
    filter.branch = toObjectId(query.branch, "branch id");
  }

  if (query.deviceId) {
    filter.deviceId = query.deviceId.trim();
  }

  if (query.batchNo) {
    filter.batchNo = query.batchNo.trim().toUpperCase();
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {
      ...(query.fromDate ? { $gte: new Date(`${query.fromDate}T00:00:00.000Z`) } : {}),
      ...(query.toDate ? { $lte: new Date(`${query.toDate}T23:59:59.999Z`) } : {}),
    };
  }

  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 200);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    AttendanceImportBatch.find(filter)
      .populate("company")
      .populate("majorDepartment")
      .populate("department")
      .populate("branch")
      .populate("processedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AttendanceImportBatch.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getSingleAttendanceImportFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid attendance import batch id.");
  }

  const result = await AttendanceImportBatch.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("branch")
    .populate("processedBy", "name email role")
    .populate({
      path: "processedAttendances.employee",
      select: "employeeId officeId cardNo name",
    });

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Attendance import batch not found.");
  }

  return result;
};

export const AttendanceImportServices = {
  previewAttendanceImportFromPayload,
  commitAttendanceImportIntoDB,
  getAllAttendanceImportsFromDB,
  getSingleAttendanceImportFromDB,
};

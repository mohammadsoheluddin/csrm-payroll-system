import { Types } from "mongoose";
import { buildDeletedFilter, buildRestoreUpdate, buildSoftDeleteUpdate, type TRestoreRequestBody, type TSoftDeleteRequestBody } from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Attendance from "../attendance/attendance.model";
import type { TAttendanceSource, TAttendanceStatus } from "../attendance/attendance.interface";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import Employee from "../employee/employee.model";
import type {
  TAttendanceImportPayload,
  TAttendanceImportPreviousAttendanceSnapshot,
  TAttendanceImportProcessedAttendance,
  TAttendanceImportQuery,
  TAttendanceImportRawRow,
  TAttendanceImportRollbackPayload,
  TAttendanceImportRollbackSummary,
  TAttendanceImportTemplateColumn,
  TAttendanceImportTemplatePreview,
  TAttendanceImportTemplateQuery,
  TAttendanceImportRejectionReportPreview,
  TAttendanceImportRejectedRow,
  TAttendanceImportSummary,
} from "./attendanceImport.interface";
import AttendanceImportBatch from "./attendanceImport.model";
import {
  generateAttendanceImportRejectionCsv,
  generateAttendanceImportRejectionExcel,
  generateAttendanceImportTemplateCsv,
  generateAttendanceImportTemplateExcel,
} from "./attendanceImport.export";

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


const buildPreviousAttendanceSnapshot = (
  attendance: any,
): TAttendanceImportPreviousAttendanceSnapshot | undefined => {
  if (!attendance?._id) {
    return undefined;
  }

  return {
    attendance: new Types.ObjectId(getObjectIdString(attendance._id)),
    checkInTime: attendance.checkInTime,
    checkOutTime: attendance.checkOutTime,
    status: attendance.status,
    source: attendance.source,
    remarks: attendance.remarks,
    deviceId: attendance.deviceId,
    importBatchNo: attendance.importBatchNo,
    isDeleted: Boolean(attendance.isDeleted),
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt,
  };
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
      previousAttendanceSnapshot:
        action === "update" ? buildPreviousAttendanceSnapshot(existingAttendance) : undefined,
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
    .populate("revertedBy", "name email role")
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

const getDeletedAttendanceImportsFromDB = async (query: TAttendanceImportQuery) => {
  const filter: Record<string, unknown> = {
    isDeleted: true,
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
      .populate("revertedBy", "name email role")
      .sort({ deletedAt: -1, createdAt: -1 })
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
    .populate("revertedBy", "name email role")
    .populate({
      path: "processedAttendances.employee",
      select: "employeeId officeId cardNo name",
    });

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Attendance import batch not found.");
  }

  return result;
};

type TAttendanceImportDeleteRestoreOptions = TSoftDeleteRequestBody & TRestoreRequestBody & { userId?: string };

type TAttendanceImportBatchDocumentLike = any;

type TAttendanceDocumentLike = {
  _id: Types.ObjectId | string;
  employee?: Types.ObjectId | string;
  attendanceDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: TAttendanceStatus;
  source?: string;
  remarks?: string;
  deviceId?: string;
  importBatchNo?: string;
  isDeleted?: boolean;
};

const getRawAttendanceImportBatchById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid attendance import batch id.");
  }

  const batch = await AttendanceImportBatch.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!batch) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Attendance import batch not found.");
  }

  return batch;
};

const findLockedAttendanceFinalizationBlockersFromProcessed = async (
  processedAttendances: TAttendanceImportProcessedAttendance[],
) => {
  const actionableAttendances = processedAttendances.filter(
    (item) => item.action !== "skip" && item.employee && item.attendanceDate,
  );

  if (!actionableAttendances.length) {
    return [];
  }

  const employeeIds = Array.from(
    new Set(actionableAttendances.map((item) => getObjectIdString(item.employee))),
  ).map((id) => new Types.ObjectId(id));
  const payrollMonths = Array.from(
    new Set(actionableAttendances.map((item) => getPayrollMonthFromDate(item.attendanceDate))),
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

const buildAttendanceMapByIds = async (
  processedAttendances: TAttendanceImportProcessedAttendance[],
) => {
  const attendanceIds = Array.from(
    new Set(
      processedAttendances
        .map((item) => getObjectIdString(item.attendance))
        .filter(Boolean),
    ),
  ).map((id) => new Types.ObjectId(id));

  if (!attendanceIds.length) {
    return new Map<string, TAttendanceDocumentLike>();
  }

  const attendances = await Attendance.find({
    _id: {
      $in: attendanceIds,
    },
  }).lean<TAttendanceDocumentLike[]>();

  const attendanceMap = new Map<string, TAttendanceDocumentLike>();

  attendances.forEach((attendance) => {
    attendanceMap.set(getObjectIdString(attendance._id), attendance);
  });

  return attendanceMap;
};

const valuesMatch = (left?: string, right?: string) => (left || "") === (right || "");

const hasAttendanceChangedAfterImport = ({
  attendance,
  processedAttendance,
  batchNo,
}: {
  attendance: TAttendanceDocumentLike;
  processedAttendance: TAttendanceImportProcessedAttendance;
  batchNo: string;
}) => {
  if (attendance.isDeleted) {
    return true;
  }

  return !(
    getObjectIdString(attendance.employee) ===
      getObjectIdString(processedAttendance.employee) &&
    attendance.attendanceDate === processedAttendance.attendanceDate &&
    valuesMatch(attendance.checkInTime, processedAttendance.checkInTime) &&
    valuesMatch(attendance.checkOutTime, processedAttendance.checkOutTime) &&
    attendance.status === processedAttendance.status &&
    valuesMatch(attendance.deviceId, processedAttendance.deviceId) &&
    valuesMatch(attendance.importBatchNo, batchNo)
  );
};

const buildRollbackSummary = async (
  batch: TAttendanceImportBatchDocumentLike,
): Promise<TAttendanceImportRollbackSummary> => {
  const batchObject = batch.toObject ? batch.toObject() : batch;
  const processedAttendances =
    (batchObject.processedAttendances || []) as TAttendanceImportProcessedAttendance[];
  const attendanceMap = await buildAttendanceMapByIds(processedAttendances);
  const lockedMonthBlockers =
    await findLockedAttendanceFinalizationBlockersFromProcessed(processedAttendances);

  const summary: TAttendanceImportRollbackSummary = {
    totalProcessedAttendances: processedAttendances.length,
    removableInsertedAttendances: 0,
    restorableUpdatedAttendances: 0,
    skippedAttendances: 0,
    blockedAttendances: 0,
    removedAttendanceCount: 0,
    restoredAttendanceCount: 0,
    warnings: [],
    blockers: [],
    items: [],
  };

  if (batchObject.status === "reverted") {
    summary.blockers.push("Attendance import batch is already reverted.");
  }

  lockedMonthBlockers.forEach((blocker) => {
    summary.blockers.push(
      `Rollback blocked because attendance finalization is locked for ${blocker.employeeId || blocker.employee} / ${blocker.payrollMonth}.`,
    );
  });

  processedAttendances.forEach((item) => {
    const attendanceId = getObjectIdString(item.attendance);
    const currentAttendance = attendanceId ? attendanceMap.get(attendanceId) : undefined;
    let rollbackAction: TAttendanceImportRollbackSummary["items"][number]["rollbackAction"] =
      "no_action";
    let reason = "Skipped import row does not require rollback.";

    if (item.action === "insert") {
      if (!attendanceId || !currentAttendance) {
        rollbackAction = "no_action";
        reason = "Inserted attendance record is already missing.";
      } else if (
        hasAttendanceChangedAfterImport({
          attendance: currentAttendance,
          processedAttendance: item,
          batchNo: batchObject.batchNo,
        })
      ) {
        rollbackAction = "blocked";
        reason =
          "Inserted attendance record was changed after import; automatic removal is blocked.";
      } else {
        rollbackAction = "remove_inserted";
        reason = "Inserted attendance will be soft-deleted.";
        summary.removableInsertedAttendances += 1;
      }
    } else if (item.action === "update") {
      if (!attendanceId || !currentAttendance) {
        rollbackAction = "blocked";
        reason = "Updated attendance record is missing; previous value cannot be restored safely.";
      } else if (!item.previousAttendanceSnapshot) {
        rollbackAction = "blocked";
        reason =
          "Previous attendance snapshot is not available. This usually means the batch was committed before rollback support was added.";
      } else if (
        hasAttendanceChangedAfterImport({
          attendance: currentAttendance,
          processedAttendance: item,
          batchNo: batchObject.batchNo,
        })
      ) {
        rollbackAction = "blocked";
        reason =
          "Updated attendance record was changed after import; automatic restore is blocked.";
      } else {
        rollbackAction = "restore_updated";
        reason = "Updated attendance will be restored to previous snapshot.";
        summary.restorableUpdatedAttendances += 1;
      }
    } else {
      summary.skippedAttendances += 1;
    }

    if (rollbackAction === "blocked") {
      summary.blockedAttendances += 1;
    }

    summary.items.push({
      employee: item.employee,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      attendanceDate: item.attendanceDate,
      importAction: item.action,
      rollbackAction,
      attendance: item.attendance,
      reason,
    });
  });

  if (summary.blockedAttendances > 0) {
    summary.blockers.push(
      `${summary.blockedAttendances} attendance record(s) cannot be reverted safely.`,
    );
  }

  if (summary.blockers.length > 0) {
    summary.warnings.push("Attendance import rollback is blocked until blockers are resolved.");
  }

  if (!summary.removableInsertedAttendances && !summary.restorableUpdatedAttendances) {
    summary.warnings.push("No attendance records are available for rollback.");
  }

  return summary;
};

const previewAttendanceImportRollbackFromDB = async (id: string) => {
  const batch = await getRawAttendanceImportBatchById(id);
  const summary = await buildRollbackSummary(batch);
  const batchObject = batch.toObject ? batch.toObject() : batch;

  return {
    mode: "preview",
    canRevert: summary.blockers.length === 0,
    batch: {
      id: getObjectIdString(batchObject._id),
      batchNo: batchObject.batchNo,
      source: batchObject.source,
      matchBy: batchObject.matchBy,
      status: batchObject.status,
      processedAt: batchObject.processedAt,
      revertedAt: batchObject.revertedAt,
    },
    summary,
  };
};

const buildAttendanceRestoreUpdate = (
  snapshot: TAttendanceImportPreviousAttendanceSnapshot,
) => {
  const setPayload: Record<string, unknown> = {
    isDeleted: Boolean(snapshot.isDeleted),
  };
  const unsetPayload: Record<string, 1> = {};

  const optionalFields: Array<keyof TAttendanceImportPreviousAttendanceSnapshot> = [
    "checkInTime",
    "checkOutTime",
    "status",
    "source",
    "remarks",
    "deviceId",
    "importBatchNo",
  ];

  optionalFields.forEach((fieldName) => {
    const value = snapshot[fieldName];

    if (value === undefined || value === null || value === "") {
      unsetPayload[fieldName] = 1;
    } else {
      setPayload[fieldName] = value;
    }
  });

  return {
    ...(Object.keys(setPayload).length ? { $set: setPayload } : {}),
    ...(Object.keys(unsetPayload).length ? { $unset: unsetPayload } : {}),
  };
};

const rollbackAttendanceImportBatchIntoDB = async (
  id: string,
  payload: TAttendanceImportRollbackPayload,
  userId?: string,
) => {
  const batch = await getRawAttendanceImportBatchById(id);
  const batchObject = batch.toObject ? batch.toObject() : batch;
  const summary = await buildRollbackSummary(batch);

  if (summary.blockers.length > 0) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Attendance import rollback blocked. Review rollback preview for blockers before reverting this batch.",
    );
  }

  const processedAttendances =
    (batchObject.processedAttendances || []) as TAttendanceImportProcessedAttendance[];
  const processedAttendanceMap = new Map<string, TAttendanceImportProcessedAttendance>();

  processedAttendances.forEach((item) => {
    const attendanceId = getObjectIdString(item.attendance);

    if (attendanceId) {
      processedAttendanceMap.set(attendanceId, item);
    }
  });

  for (const item of summary.items) {
    const attendanceId = getObjectIdString(item.attendance);

    if (!attendanceId) {
      continue;
    }

    if (item.rollbackAction === "remove_inserted") {
      const currentAttendance = await Attendance.findById(attendanceId).lean<any>();
      const revertRemarks = [
        currentAttendance?.remarks,
        `Reverted attendance import batch ${batchObject.batchNo}`,
        payload.note,
      ]
        .filter(Boolean)
        .join(" | ");

      await Attendance.findByIdAndUpdate(
        attendanceId,
        {
          isDeleted: true,
          remarks: revertRemarks,
        },
        {
          runValidators: true,
        },
      );
      summary.removedAttendanceCount += 1;
      continue;
    }

    if (item.rollbackAction === "restore_updated") {
      const processedAttendance = processedAttendanceMap.get(attendanceId);
      const previousSnapshot = processedAttendance?.previousAttendanceSnapshot;

      if (!previousSnapshot) {
        continue;
      }

      await Attendance.findByIdAndUpdate(
        attendanceId,
        buildAttendanceRestoreUpdate(previousSnapshot),
        {
          runValidators: true,
        },
      );
      summary.restoredAttendanceCount += 1;
    }
  }

  batch.set({
    status: "reverted",
    revertedBy:
      userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
    revertedAt: new Date(),
    revertNote: payload.note,
    rollbackSummary: summary,
  });

  await batch.save();

  return AttendanceImportBatch.findById(batch._id)
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("branch")
    .populate("processedBy", "name email role")
    .populate("revertedBy", "name email role")
    .populate({
      path: "processedAttendances.employee",
      select: "employeeId officeId cardNo name",
    });
};


const deleteAttendanceImportFromDB = async (
  id: string,
  options: TAttendanceImportDeleteRestoreOptions = {},
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid attendance import batch id.");
  }

  const result = await AttendanceImportBatch.findOneAndUpdate(
    { _id: id, isDeleted: false },
    buildSoftDeleteUpdate({
      userId: options.userId,
      deleteReason: options.deleteReason,
    }),
    { new: true, runValidators: true },
  )
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("branch")
    .populate("processedBy", "name email role")
    .populate("revertedBy", "name email role");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Attendance import batch not found.");
  }

  return result;
};

const restoreAttendanceImportIntoDB = async (
  id: string,
  options: TAttendanceImportDeleteRestoreOptions = {},
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid attendance import batch id.");
  }

  const result = await AttendanceImportBatch.findOneAndUpdate(
    buildDeletedFilter({ _id: id }),
    buildRestoreUpdate({
      userId: options.userId,
      restoreReason: options.restoreReason,
    }),
    { new: true, runValidators: true },
  )
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("branch")
    .populate("processedBy", "name email role")
    .populate("revertedBy", "name email role");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Deleted attendance import batch not found.");
  }

  return result;
};

const TEMPLATE_COLUMNS: TAttendanceImportTemplateColumn[] = [
  {
    header: "Row No",
    key: "rowNo",
    required: false,
    format: "Number",
    description: "Optional row serial from source file for easier rejection tracking.",
    width: 10,
  },
  {
    header: "Employee Identifier",
    key: "employeeIdentifier",
    required: true,
    format: "Text",
    description:
      "Employee value matching selected matchBy option: employeeId, officeId, or cardNo.",
    width: 24,
  },
  {
    header: "Attendance Date",
    key: "attendanceDate",
    required: true,
    format: "YYYY-MM-DD",
    description: "Attendance date for the punch or manual row.",
    width: 18,
  },
  {
    header: "Punch Time",
    key: "punchTime",
    required: false,
    format: "HH:mm",
    description:
      "Single punch time. Multiple rows for same employee/date will be grouped into first in and last out.",
    width: 14,
  },
  {
    header: "Check In Time",
    key: "checkInTime",
    required: false,
    format: "HH:mm",
    description: "Manual or prepared check-in time in 24-hour format.",
    width: 16,
  },
  {
    header: "Check Out Time",
    key: "checkOutTime",
    required: false,
    format: "HH:mm",
    description: "Manual or prepared check-out time in 24-hour format.",
    width: 16,
  },
  {
    header: "Status",
    key: "status",
    required: false,
    format: "present | absent | late | leave | half-day | weekend | holiday",
    description:
      "Optional attendance status. If omitted, rows with punch/check times become present; empty time rows become absent.",
    width: 18,
  },
  {
    header: "Device ID",
    key: "deviceId",
    required: false,
    format: "Text",
    description: "Optional punch device identifier. Request level deviceId is also supported.",
    width: 18,
  },
  {
    header: "Remarks",
    key: "remarks",
    required: false,
    format: "Text",
    description: "Optional row-level note, for example Manual correction or Device sync.",
    width: 40,
  },
];

const getBooleanQueryValue = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue;
  }

  return ["true", "1", "yes"].includes(value.toLowerCase());
};

const getSampleRows = ({
  matchBy,
  includeSample,
}: {
  matchBy: TAttendanceImportTemplateQuery["matchBy"];
  includeSample: boolean;
}): TAttendanceImportRawRow[] => {
  if (!includeSample) {
    return [];
  }

  const employeeIdentifier =
    matchBy === "cardNo" ? "CARD-001" : matchBy === "officeId" ? "OFF-001" : "EMP-001";

  return [
    {
      rowNo: 1,
      employeeIdentifier,
      attendanceDate: "2026-05-01",
      punchTime: "08:05",
      deviceId: "ZKT-01",
      remarks: "Morning punch sample",
    },
    {
      rowNo: 2,
      employeeIdentifier,
      attendanceDate: "2026-05-01",
      punchTime: "17:10",
      deviceId: "ZKT-01",
      remarks: "Evening punch sample",
    },
    {
      rowNo: 3,
      employeeIdentifier: `${employeeIdentifier}-2`,
      attendanceDate: "2026-05-01",
      checkInTime: "08:00",
      checkOutTime: "17:00",
      status: "present",
      remarks: "Manual bulk sample",
    },
  ];
};

const buildAttendanceImportTemplatePreview = (
  query: TAttendanceImportTemplateQuery,
): TAttendanceImportTemplatePreview => {
  const source = query.source || "excel";
  const matchBy = query.matchBy || "employeeId";
  const includeSample = getBooleanQueryValue(query.includeSample, true);

  return {
    template: {
      source,
      matchBy,
      recommendedEndpoint: "/api/v1/attendance-imports/preview then /api/v1/attendance-imports/commit",
      maxRowsPerRequest: 5000,
      notes: [
        "Template columns map to the rows[] payload accepted by attendance import preview/commit APIs.",
        "Use either punchTime rows or prepared checkInTime/checkOutTime rows.",
        "Multiple punch rows for the same employee/date will be grouped into first check-in and last check-out.",
        "Commit is blocked when the target employee/month attendance finalization is already locked.",
      ],
    },
    columns: TEMPLATE_COLUMNS,
    sampleRows: getSampleRows({ matchBy, includeSample }),
  };
};

const buildAttendanceImportRejectionReportFromDB = async (
  id: string,
): Promise<TAttendanceImportRejectionReportPreview> => {
  const batch = await getSingleAttendanceImportFromDB(id);

  const batchObject = batch.toObject ? batch.toObject() : batch;

  return {
    batch: {
      id: getObjectIdString(batchObject._id),
      batchNo: batchObject.batchNo,
      source: batchObject.source,
      matchBy: batchObject.matchBy,
      sourceFileName: batchObject.sourceFileName,
      deviceId: batchObject.deviceId,
      processedAt: batchObject.processedAt,
    },
    summary: {
      totalRows: batchObject.totalRows || 0,
      validRows: batchObject.validRows || 0,
      invalidRows: batchObject.invalidRows || 0,
      rejectedRows: batchObject.rejectedRows?.length || 0,
      insertedAttendanceCount: batchObject.insertedAttendanceCount || 0,
      updatedAttendanceCount: batchObject.updatedAttendanceCount || 0,
      skippedAttendanceCount: batchObject.skippedAttendanceCount || 0,
    },
    rejectedRows: batchObject.rejectedRows || [],
  };
};

const exportAttendanceImportTemplateCsv = (query: TAttendanceImportTemplateQuery) => {
  const preview = buildAttendanceImportTemplatePreview(query);

  return generateAttendanceImportTemplateCsv(preview);
};

const exportAttendanceImportTemplateExcel = async (
  query: TAttendanceImportTemplateQuery,
) => {
  const preview = buildAttendanceImportTemplatePreview(query);

  return generateAttendanceImportTemplateExcel(preview);
};

const exportAttendanceImportRejectionsCsv = async (id: string) => {
  const preview = await buildAttendanceImportRejectionReportFromDB(id);

  return generateAttendanceImportRejectionCsv(preview);
};

const exportAttendanceImportRejectionsExcel = async (id: string) => {
  const preview = await buildAttendanceImportRejectionReportFromDB(id);

  return generateAttendanceImportRejectionExcel(preview);
};


export const AttendanceImportServices = {
  previewAttendanceImportFromPayload,
  commitAttendanceImportIntoDB,
  getAllAttendanceImportsFromDB,
  getDeletedAttendanceImportsFromDB,
  getSingleAttendanceImportFromDB,
  previewAttendanceImportRollbackFromDB,
  rollbackAttendanceImportBatchIntoDB,
  buildAttendanceImportTemplatePreview,
  deleteAttendanceImportFromDB,
  restoreAttendanceImportIntoDB,
  exportAttendanceImportTemplateCsv,
  exportAttendanceImportTemplateExcel,
  buildAttendanceImportRejectionReportFromDB,
  exportAttendanceImportRejectionsCsv,
  exportAttendanceImportRejectionsExcel,
};

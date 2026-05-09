import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import TimeBill from "../timeBill/timeBill.model";
import OtStatement from "./otStatement.model";
import {
  generateOtStatementCsv,
  generateOtStatementExcel,
  generateOtStatementPDF,
} from "./otStatement.export";
import {
  TGenerateOtStatementPayload,
  TOtStatement,
  TOtStatementActionPayload,
  TOtStatementExportQuery,
  TOtStatementBulkActionPayload,
  TOtStatementBulkActionType,
  TOtStatementQuery,
  TOtStatementStatus,
  TOtStatementSummaryQuery,
} from "./otStatement.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const parsePayrollMonth = (payrollMonth: string) => {
  const [yearText, monthText] = payrollMonth.split("-");

  return {
    month: Number(monthText),
    year: Number(yearText),
  };
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
  };
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

const getIdNameSnapshot = (value: unknown) => {
  const source = value as {
    _id?: Types.ObjectId | string;
    name?: string;
  } | null;

  if (!source) {
    return null;
  }

  return {
    id: getObjectIdString(source._id),
    name: source.name || "",
  };
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

const buildActionBy = (actionBy?: string) => {
  if (actionBy && Types.ObjectId.isValid(actionBy)) {
    return new Types.ObjectId(actionBy);
  }

  return null;
};

const assertObjectId = (value: string | undefined, fieldName: string) => {
  if (!value) {
    return;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }
};

const normalizePayrollMonthFromQuery = (query: {
  payrollMonth?: string;
  month?: string | number;
  year?: string | number;
}) => {
  if (query.payrollMonth) {
    return query.payrollMonth;
  }

  const month = Number(query.month);
  const year = Number(query.year);

  if (!month || !year) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  return buildPayrollMonth(month, year);
};

const buildBaseFilter = ({
  payrollMonth,
  company,
  majorDepartment,
  department,
  branch,
  employee,
}: {
  payrollMonth: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}) => {
  const filter: Record<string, unknown> = {
    payrollMonth,
    isDeleted: false,
  };

  if (company) {
    filter.company = new Types.ObjectId(company);
  }

  if (majorDepartment) {
    filter.majorDepartment = new Types.ObjectId(majorDepartment);
  }

  if (department) {
    filter.department = new Types.ObjectId(department);
  }

  if (branch) {
    filter.branch = new Types.ObjectId(branch);
  }

  if (employee) {
    filter.employee = new Types.ObjectId(employee);
  }

  return filter;
};

const validateMonthlyQuery = ({
  payrollMonth,
  month,
  year,
  company,
  majorDepartment,
  department,
  branch,
  employee,
}: {
  payrollMonth?: string;
  month?: string | number;
  year?: string | number;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}) => {
  if (!payrollMonth && (!month || !year)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  if (!company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  assertObjectId(company, "Company");
  assertObjectId(majorDepartment, "Major department");
  assertObjectId(department, "Department");
  assertObjectId(branch, "Branch");
  assertObjectId(employee, "Employee");
};

const populateOtStatementQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("timeBill")
    .populate("attendanceFinalization")
    .populate("salaryStructure");
};

const populateTimeBillQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("attendanceFinalization")
    .populate("salaryStructure");
};

const buildTimeBillFilter = (payload: TGenerateOtStatementPayload) => {
  return buildBaseFilter({
    payrollMonth: buildPayrollMonth(payload.month, payload.year),
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    branch: payload.branch,
    employee: payload.employee,
  });
};

const ensureTimeBillsReadyForOtStatement = (timeBills: any[]) => {
  const blockers = timeBills
    .filter((timeBill) => timeBill.status !== "locked" || !timeBill.isLocked)
    .map((timeBill) => ({
      employeeId: timeBill?.employee?.employeeId || "",
      employeeName: getEmployeeFullName(timeBill?.employee),
      reason: `Time Bill is ${timeBill.status} and locked=${timeBill.isLocked}.`,
    }));

  if (blockers.length) {
    const blockerPreview = blockers
      .slice(0, 10)
      .map(
        (blocker) =>
          `${blocker.employeeId} - ${blocker.employeeName}: ${blocker.reason}`,
      )
      .join("; ");

    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `OT Statement generation blocked. Locked Time Bill is required for every selected employee before OT Statement processing. Blockers: ${blockerPreview}${
        blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."
      }`,
    );
  }
};

const createOtStatementSnapshot = (timeBill: any) => {
  const employee = timeBill?.employee;

  return {
    employee: {
      employeeDbId: getObjectIdString(employee?._id),
      employeeId: employee?.employeeId || "",
      employeeName: getEmployeeFullName(employee),
      officeId: employee?.officeId || "",
      cardNo: employee?.cardNo || "",
      company: getIdNameSnapshot(timeBill?.company || employee?.company),
      majorDepartment: getIdNameSnapshot(
        timeBill?.majorDepartment || employee?.majorDepartment,
      ),
      department: getIdNameSnapshot(timeBill?.department || employee?.department),
      designation: getIdNameSnapshot(
        timeBill?.designation || employee?.designation,
      ),
      branch: getIdNameSnapshot(timeBill?.branch || employee?.branch),
      serviceType: employee?.serviceType || "",
      payType: employee?.payType || "",
      employmentStatus: employee?.employmentStatus || "",
      joiningDate: employee?.joiningDate || "",
      dutyHourPerDay: Number(employee?.dutyHourPerDay || 0),
    },
    timeBill: {
      timeBillId: getObjectIdString(timeBill?._id),
      payrollMonth: timeBill?.payrollMonth || "",
      status: timeBill?.status || "",
      isLocked: Boolean(timeBill?.isLocked),
      attendanceFinalizationId: getObjectIdString(timeBill?.attendanceFinalization),
      salaryStructureId: getObjectIdString(timeBill?.salaryStructure),
      grossSalary: Number(timeBill?.grossSalary || 0),
      dutyHourPerDay: Number(timeBill?.dutyHourPerDay || 0),
      otHours: Number(timeBill?.otHours || 0),
      otRate: Number(timeBill?.otRate || 0),
      otAmount: Number(timeBill?.otAmount || 0),
      tiffinDays: Number(timeBill?.tiffinDays || 0),
      tiffinRate: Number(timeBill?.tiffinRate || 0),
      tiffinAmount: Number(timeBill?.tiffinAmount || 0),
      totalPayableAmount: Number(timeBill?.totalPayableAmount || 0),
      totalDutyDays: Number(timeBill?.totalDutyDays || 0),
      totalPayableDays: Number(timeBill?.totalPayableDays || 0),
      totalHolidayDutyDays: Number(timeBill?.totalHolidayDutyDays || 0),
    },
  };
};

const buildOtStatementPayload = ({
  timeBill,
  snapshot,
  actionBy,
  remarks,
}: {
  timeBill: any;
  snapshot: ReturnType<typeof createOtStatementSnapshot>;
  actionBy?: string;
  remarks?: string;
}) => {
  return {
    employee: timeBill.employee?._id || timeBill.employee,
    company: timeBill.company?._id || timeBill.company,
    majorDepartment: timeBill.majorDepartment?._id || timeBill.majorDepartment,
    department: timeBill.department?._id || timeBill.department,
    designation: timeBill.designation?._id || timeBill.designation,
    branch: timeBill.branch?._id || timeBill.branch,
    payrollMonth: timeBill.payrollMonth,
    month: timeBill.month,
    year: timeBill.year,
    periodStartDate: timeBill.periodStartDate,
    periodEndDate: timeBill.periodEndDate,
    timeBill: timeBill._id,
    attendanceFinalization:
      timeBill.attendanceFinalization?._id || timeBill.attendanceFinalization,
    salaryStructure: timeBill.salaryStructure?._id || timeBill.salaryStructure,
    grossSalary: Number(timeBill.grossSalary || 0),
    dutyHourPerDay: Number(timeBill.dutyHourPerDay || 0),
    otHours: Number(timeBill.otHours || 0),
    otRate: Number(timeBill.otRate || 0),
    otAmount: Number(timeBill.otAmount || 0),
    tiffinDays: Number(timeBill.tiffinDays || 0),
    tiffinRate: Number(timeBill.tiffinRate || 0),
    tiffinAmount: Number(timeBill.tiffinAmount || 0),
    totalPayableAmount: Number(timeBill.totalPayableAmount || 0),
    totalDutyDays: Number(timeBill.totalDutyDays || 0),
    totalPayableDays: Number(timeBill.totalPayableDays || 0),
    totalHolidayDutyDays: Number(timeBill.totalHolidayDutyDays || 0),
    status: "draft" as TOtStatementStatus,
    isLocked: false,
    generatedBy: buildActionBy(actionBy),
    generatedAt: new Date(),
    processedBy: null,
    processedAt: null,
    approvedBy: null,
    approvedAt: null,
    lockedBy: null,
    lockedAt: null,
    snapshot,
    remarks: remarks || "",
    isDeleted: false,
  };
};

const summarizeOtStatementRows = (rows: any[]) => {
  return {
    totalRecords: rows.length,
    totalOtHours: rows.reduce((sum, row) => sum + Number(row.otHours || 0), 0),
    totalOtAmount: rows.reduce((sum, row) => sum + Number(row.otAmount || 0), 0),
    totalTiffinDays: rows.reduce(
      (sum, row) => sum + Number(row.tiffinDays || 0),
      0,
    ),
    totalTiffinAmount: rows.reduce(
      (sum, row) => sum + Number(row.tiffinAmount || 0),
      0,
    ),
    totalPayableAmount: rows.reduce(
      (sum, row) => sum + Number(row.totalPayableAmount || 0),
      0,
    ),
  };
};

const buildStatusSummary = (rows: any[]) => {
  const statusSummary = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  rows.forEach((row) => {
    if (row.status in statusSummary) {
      statusSummary[row.status as keyof typeof statusSummary] += 1;
    }
  });

  return statusSummary;
};

const buildLockSummary = (rows: any[]) => {
  const locked = rows.filter((row) => row.isLocked).length;

  return {
    locked,
    unlocked: rows.length - locked,
  };
};

const getGroupKey = (value: unknown) => {
  const source = value as {
    _id?: Types.ObjectId | string;
    name?: string;
  } | null;

  if (!source) {
    return {
      id: "unknown",
      name: "Unknown",
    };
  }

  return {
    id: getObjectIdString(source._id),
    name: source.name || "Unknown",
  };
};

const groupSummaryBy = (rows: any[], fieldName: string) => {
  const grouped = new Map<string, any>();

  rows.forEach((row) => {
    const entity = getGroupKey(row[fieldName]);
    const current = grouped.get(entity.id) || {
      id: entity.id,
      name: entity.name,
      totalRecords: 0,
      totalOtHours: 0,
      totalOtAmount: 0,
      totalTiffinDays: 0,
      totalTiffinAmount: 0,
      totalPayableAmount: 0,
    };

    current.totalRecords += 1;
    current.totalOtHours += Number(row.otHours || 0);
    current.totalOtAmount += Number(row.otAmount || 0);
    current.totalTiffinDays += Number(row.tiffinDays || 0);
    current.totalTiffinAmount += Number(row.tiffinAmount || 0);
    current.totalPayableAmount += Number(row.totalPayableAmount || 0);

    grouped.set(entity.id, current);
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

const buildOtPaymentReadiness = (rows: any[]) => {
  const statusSummary = buildStatusSummary(rows);
  const lockSummary = buildLockSummary(rows);
  const isGenerated = rows.length > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved = isGenerated && statusSummary.approved + statusSummary.locked === rows.length;
  const isFullyLocked = isGenerated && lockSummary.unlocked === 0 && statusSummary.locked === rows.length;
  const blockers: string[] = [];

  if (!isGenerated) {
    blockers.push("OT Statement has not been generated yet.");
  }

  if (isGenerated && !isFullyProcessed) {
    blockers.push("Some OT Statement records are still in draft status.");
  }

  if (isGenerated && !isFullyApproved) {
    blockers.push("Some OT Statement records are not approved yet.");
  }

  if (isGenerated && !isFullyLocked) {
    blockers.push("Some OT Statement records are not locked yet.");
  }

  let nextRequiredAction = "generate_ot_statement";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_ot_statement";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_ot_statement";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_ot_statement";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_ot_payment_statement";
  }

  return {
    canProcessOtPaymentSheet: isFullyLocked,
    canProcessOtBankSheet: isFullyLocked,
    canProcessOtCashSheet: isFullyLocked,
    isGenerated,
    isFullyProcessed,
    isFullyApproved,
    isFullyLocked,
    nextRequiredAction,
    blockers,
  };
};

const generateMonthlyOtStatementIntoDB = async (
  payload: TGenerateOtStatementPayload,
  actionBy?: string,
) => {
  const { month, year, company } = payload;

  if (!month || !year) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Month and year are required.");
  }

  if (!company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  assertObjectId(company, "Company");
  assertObjectId(payload.majorDepartment, "Major department");
  assertObjectId(payload.department, "Department");
  assertObjectId(payload.branch, "Branch");
  assertObjectId(payload.employee, "Employee");

  const payrollMonth = buildPayrollMonth(month, year);
  const { periodStartDate, periodEndDate } = getMonthDateRange(month, year);

  const timeBillFilter = buildTimeBillFilter(payload);
  const timeBills = await populateTimeBillQuery(
    TimeBill.find(timeBillFilter).sort({ employee: 1 }),
  );

  if (!timeBills.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Time Bill records found for OT Statement generation.",
    );
  }

  ensureTimeBillsReadyForOtStatement(timeBills);

  const generatedOtStatements = [];
  const regeneratedOtStatements = [];
  const skippedRows = [];

  for (const timeBill of timeBills) {
    const existingStatement = await OtStatement.findOne({
      employee: timeBill.employee?._id || timeBill.employee,
      payrollMonth,
      isDeleted: false,
    });

    if (existingStatement && !payload.overwrite) {
      skippedRows.push({
        employeeId: timeBill?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(timeBill?.employee),
        reason: "OT Statement already exists.",
      });
      continue;
    }

    if (existingStatement && existingStatement.isLocked) {
      skippedRows.push({
        employeeId: timeBill?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(timeBill?.employee),
        reason: "Locked OT Statement cannot be overwritten.",
      });
      continue;
    }

    if (existingStatement && existingStatement.status !== "draft") {
      skippedRows.push({
        employeeId: timeBill?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(timeBill?.employee),
        reason: "Only draft OT Statement can be overwritten.",
      });
      continue;
    }

    const snapshot = createOtStatementSnapshot(timeBill);
    const statementPayload = buildOtStatementPayload({
      timeBill,
      snapshot,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingStatement) {
      existingStatement.set({
        ...statementPayload,
        auditLogs: [
          ...existingStatement.auditLogs,
          {
            action: "regenerated",
            fromStatus: existingStatement.status,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note: payload.remarks || "OT Statement regenerated from locked Time Bill.",
          },
        ],
      });

      await existingStatement.save();
      regeneratedOtStatements.push(existingStatement);
      continue;
    }

    const newStatement = await OtStatement.create({
      ...statementPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note: payload.remarks || "OT Statement generated from locked Time Bill.",
        },
      ],
    });

    generatedOtStatements.push(newStatement);
  }

  const allCreatedStatements = [
    ...generatedOtStatements,
    ...regeneratedOtStatements,
  ];

  return {
    payrollMonth,
    month,
    year,
    periodStartDate,
    periodEndDate,
    filters: {
      company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    timeBillReadiness: {
      totalTimeBillsFound: timeBills.length,
      totalLockedTimeBills: timeBills.filter(
        (timeBill: any) => timeBill.status === "locked" && timeBill.isLocked,
      ).length,
      ...summarizeOtStatementRows(timeBills),
    },
    totals: summarizeOtStatementRows(allCreatedStatements),
    totalGenerated: generatedOtStatements.length,
    totalRegenerated: regeneratedOtStatements.length,
    totalSkipped: skippedRows.length,
    generatedOtStatements,
    regeneratedOtStatements,
    skippedRows,
  };
};

const getAllOtStatementsFromDB = async (query: TOtStatementQuery) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.payrollMonth) {
    filter.payrollMonth = query.payrollMonth;
  }

  if (query.month && query.year) {
    filter.payrollMonth = buildPayrollMonth(Number(query.month), Number(query.year));
  }

  if (query.company) {
    assertObjectId(query.company, "Company");
    filter.company = new Types.ObjectId(query.company);
  }

  if (query.majorDepartment) {
    assertObjectId(query.majorDepartment, "Major department");
    filter.majorDepartment = new Types.ObjectId(query.majorDepartment);
  }

  if (query.department) {
    assertObjectId(query.department, "Department");
    filter.department = new Types.ObjectId(query.department);
  }

  if (query.branch) {
    assertObjectId(query.branch, "Branch");
    filter.branch = new Types.ObjectId(query.branch);
  }

  if (query.employee) {
    assertObjectId(query.employee, "Employee");
    filter.employee = new Types.ObjectId(query.employee);
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  const result = await populateOtStatementQuery(
    OtStatement.find(filter).sort({ payrollMonth: -1, employee: 1 }),
  );

  return {
    meta: {
      total: result.length,
    },
    data: result,
  };
};

const getSingleOtStatementFromDB = async (id: string) => {
  assertObjectId(id, "OT Statement id");

  const result = await populateOtStatementQuery(
    OtStatement.findOne({
      _id: id,
      isDeleted: false,
    }),
  );

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "OT Statement not found.");
  }

  return result;
};

const getOtStatementOperationalSummaryFromDB = async (
  query: TOtStatementSummaryQuery,
) => {
  validateMonthlyQuery(query);

  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const { month, year } = parsePayrollMonth(payrollMonth);
  const filter = buildBaseFilter({
    payrollMonth,
    company: query.company,
    majorDepartment: query.majorDepartment,
    department: query.department,
    branch: query.branch,
    employee: query.employee,
  });

  const rows = await populateOtStatementQuery(
    OtStatement.find(filter).sort({ employee: 1 }),
  );

  return {
    payrollMonth,
    month,
    year,
    filters: {
      company: query.company,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
    },
    readiness: buildOtPaymentReadiness(rows),
    statusSummary: buildStatusSummary(rows),
    lockSummary: buildLockSummary(rows),
    totals: summarizeOtStatementRows(rows),
    groupedSummary: {
      byMajorDepartment: groupSummaryBy(rows, "majorDepartment"),
      byDepartment: groupSummaryBy(rows, "department"),
      byBranch: groupSummaryBy(rows, "branch"),
    },
  };
};

const transitionOtStatementStatusIntoDB = async ({
  id,
  payload,
  actionBy,
  expectedStatus,
  nextStatus,
  action,
}: {
  id: string;
  payload: TOtStatementActionPayload;
  actionBy?: string;
  expectedStatus: TOtStatementStatus;
  nextStatus: TOtStatementStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "OT Statement id");

  const statement = await OtStatement.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!statement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "OT Statement not found.");
  }

  if (action !== "unlocked" && statement.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked OT Statement cannot be changed.",
    );
  }

  if (statement.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `OT Statement must be ${expectedStatus} before it can be ${nextStatus}.`,
    );
  }

  const actionDate = new Date();
  const userObjectId = buildActionBy(actionBy);

  statement.status = nextStatus;
  statement.isLocked = nextStatus === "locked" ? true : false;
  statement.auditLogs.push({
    action,
    fromStatus: expectedStatus,
    toStatus: nextStatus,
    actionBy: userObjectId,
    actionAt: actionDate,
    note: payload?.note || "",
  });

  if (nextStatus === "processed") {
    statement.processedBy = userObjectId;
    statement.processedAt = actionDate;
  }

  if (nextStatus === "approved") {
    if (action === "unlocked") {
      statement.lockedBy = null;
      statement.lockedAt = null;
      statement.immutableSeal = null;
    } else {
      statement.approvedBy = userObjectId;
      statement.approvedAt = actionDate;
    }
  }

  if (nextStatus === "locked") {
    statement.lockedBy = userObjectId;
    statement.lockedAt = actionDate;
    statement.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: statement as unknown as Record<string, unknown>,
      sourceModule: "ot_statement",
      sealedBy: userObjectId,
      note: payload?.note || "OT Statement locked and immutable snapshot sealed.",
    });
  }

  await statement.save();

  return getSingleOtStatementFromDB(getObjectIdString(statement._id));
};

const buildBulkFilter = (payload: TOtStatementBulkActionPayload) => {
  validateMonthlyQuery(payload);

  const payrollMonth = normalizePayrollMonthFromQuery(payload);

  return {
    payrollMonth,
    filter: buildBaseFilter({
      payrollMonth,
      company: payload.company,
      majorDepartment: payload.majorDepartment,
      department: payload.department,
      branch: payload.branch,
      employee: payload.employee,
    }),
  };
};

const getBulkStatusConfig = (action: TOtStatementBulkActionType) => {
  const configMap = {
    process: {
      expectedStatus: "draft" as TOtStatementStatus,
      nextStatus: "processed" as TOtStatementStatus,
      auditAction: "processed" as const,
    },
    approve: {
      expectedStatus: "processed" as TOtStatementStatus,
      nextStatus: "approved" as TOtStatementStatus,
      auditAction: "approved" as const,
    },
    lock: {
      expectedStatus: "approved" as TOtStatementStatus,
      nextStatus: "locked" as TOtStatementStatus,
      auditAction: "locked" as const,
    },
    unlock: {
      expectedStatus: "locked" as TOtStatementStatus,
      nextStatus: "approved" as TOtStatementStatus,
      auditAction: "unlocked" as const,
    },
  };

  return configMap[action];
};

const buildBulkActionResult = ({
  payrollMonth,
  payload,
  rows,
  updatedRows,
  skippedRows,
}: {
  payrollMonth: string;
  payload: TOtStatementBulkActionPayload;
  rows: any[];
  updatedRows: any[];
  skippedRows: any[];
}) => {
  const { month, year } = parsePayrollMonth(payrollMonth);

  return {
    payrollMonth,
    month,
    year,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    summary: {
      totalSelected: rows.length,
      totalUpdated: updatedRows.length,
      totalSkipped: skippedRows.length,
      statusSummary: buildStatusSummary(updatedRows),
      totals: summarizeOtStatementRows(updatedRows),
    },
    otPaymentReadiness: buildOtPaymentReadiness(rows),
    updatedRows,
    skippedRows,
  };
};

const bulkChangeOtStatementStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TOtStatementBulkActionType;
  payload: TOtStatementBulkActionPayload;
  actionBy?: string;
}) => {
  const { payrollMonth, filter } = buildBulkFilter(payload);
  const rows = await OtStatement.find(filter).sort({ employee: 1 });

  if (!rows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No OT Statement records found for bulk action.",
    );
  }

  const config = getBulkStatusConfig(action);
  const strict = payload.strict !== false;
  const skippedRows = [];

  if (action === "lock" && strict) {
    const notReadyRows = rows.filter(
      (row) => row.status !== config.expectedStatus || row.isLocked,
    );

    if (notReadyRows.length) {
      const preview = notReadyRows
        .slice(0, 10)
        .map(
          (row) =>
            `${row.snapshot?.employee?.employeeId || getObjectIdString(row.employee)} - ${
              row.snapshot?.employee?.employeeName || "Unknown"
            }: status=${row.status}, locked=${row.isLocked}`,
        )
        .join("; ");

      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Bulk OT Statement lock blocked. Every selected OT Statement must be approved and unlocked before lock. Blockers: ${preview}${
          notReadyRows.length > 10 ? `; and ${notReadyRows.length - 10} more.` : "."
        }`,
      );
    }
  }

  const updatedRows = [];
  const actionDate = new Date();
  const userObjectId = buildActionBy(actionBy);

  for (const row of rows) {
    if (action !== "unlock" && row.isLocked) {
      skippedRows.push({
        id: getObjectIdString(row._id),
        employee: row.snapshot?.employee || null,
        reason: "Locked OT Statement cannot be changed.",
      });
      continue;
    }

    if (row.status !== config.expectedStatus) {
      skippedRows.push({
        id: getObjectIdString(row._id),
        employee: row.snapshot?.employee || null,
        reason: `Expected status ${config.expectedStatus}, found ${row.status}.`,
      });
      continue;
    }

    row.status = config.nextStatus;
    row.isLocked = config.nextStatus === "locked" ? true : false;
    row.auditLogs.push({
      action: config.auditAction,
      fromStatus: config.expectedStatus,
      toStatus: config.nextStatus,
      actionBy: userObjectId,
      actionAt: actionDate,
      note: payload.note || "",
    });

    if (config.nextStatus === "processed") {
      row.processedBy = userObjectId;
      row.processedAt = actionDate;
    }

    if (config.nextStatus === "approved") {
      if (action === "unlock") {
        row.lockedBy = null;
        row.lockedAt = null;
        row.immutableSeal = null;
      } else {
        row.approvedBy = userObjectId;
        row.approvedAt = actionDate;
      }
    }

    if (config.nextStatus === "locked") {
      row.lockedBy = userObjectId;
      row.lockedAt = actionDate;
      row.immutableSeal = buildPayrollImmutableSealFromRecord({
        record: row as unknown as Record<string, unknown>,
        sourceModule: "ot_statement",
        sealedBy: userObjectId,
        note: payload.note || "OT Statement locked and immutable snapshot sealed.",
      });
    }

    await row.save();
    updatedRows.push(row);
  }

  const latestRows = await OtStatement.find(filter).sort({ employee: 1 });

  return buildBulkActionResult({
    payrollMonth,
    payload,
    rows: latestRows,
    updatedRows,
    skippedRows,
  });
};

const processOtStatementIntoDB = async (
  id: string,
  payload: TOtStatementActionPayload,
  actionBy?: string,
) => {
  return transitionOtStatementStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "draft",
    nextStatus: "processed",
    action: "processed",
  });
};

const approveOtStatementIntoDB = async (
  id: string,
  payload: TOtStatementActionPayload,
  actionBy?: string,
) => {
  return transitionOtStatementStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "processed",
    nextStatus: "approved",
    action: "approved",
  });
};

const lockOtStatementIntoDB = async (
  id: string,
  payload: TOtStatementActionPayload,
  actionBy?: string,
) => {
  return transitionOtStatementStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "approved",
    nextStatus: "locked",
    action: "locked",
  });
};

const unlockOtStatementIntoDB = async (
  id: string,
  payload: TOtStatementActionPayload,
  actionBy?: string,
) => {
  return transitionOtStatementStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "locked",
    nextStatus: "approved",
    action: "unlocked",
  });
};

const bulkProcessOtStatementsIntoDB = async (
  payload: TOtStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeOtStatementStatusIntoDB({
    action: "process",
    payload,
    actionBy,
  });
};

const bulkApproveOtStatementsIntoDB = async (
  payload: TOtStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeOtStatementStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockOtStatementsIntoDB = async (
  payload: TOtStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeOtStatementStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockOtStatementsIntoDB = async (
  payload: TOtStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeOtStatementStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};

const buildOtStatementExportPreviewFromDB = async (
  query: TOtStatementExportQuery,
) => {
  validateMonthlyQuery(query);

  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const { month, year } = parsePayrollMonth(payrollMonth);
  const filter = buildBaseFilter({
    payrollMonth,
    company: query.company,
    majorDepartment: query.majorDepartment,
    department: query.department,
    branch: query.branch,
    employee: query.employee,
  });

  const records = await OtStatement.find(filter)
    .sort({ "snapshot.employee.employeeId": 1 })
    .lean<(TOtStatement & { _id: Types.ObjectId })[]>();

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No OT Statement records found for export.",
    );
  }

  const blockers = records
    .filter((record) => record.status !== "locked" || !record.isLocked)
    .map((record) => {
      const employee = record.snapshot?.employee;

      return `${employee?.employeeId || getObjectIdString(record.employee)} - ${
        employee?.employeeName || "Unknown"
      }: status=${record.status}, locked=${record.isLocked}`;
    });

  if (blockers.length) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `OT Statement export blocked. All selected OT Statement records must be locked before final export. Blockers: ${blockers
        .slice(0, 10)
        .join("; ")}${blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."}`,
    );
  }

  const rows = records.map((record, index) => {
    const employee = record.snapshot?.employee;

    return {
      slNo: index + 1,
      otStatementId: getObjectIdString(record._id),
      employeeId: employee?.employeeId || "",
      employeeName: employee?.employeeName || "",
      officeId: employee?.officeId || "",
      cardNo: employee?.cardNo || "",
      designation: employee?.designation?.name || "",
      department: employee?.department?.name || "",
      majorDepartment: employee?.majorDepartment?.name || "",
      branch: employee?.branch?.name || "",
      grossSalary: Number(record.grossSalary || 0),
      dutyHourPerDay: Number(record.dutyHourPerDay || 0),
      otHours: Number(record.otHours || 0),
      otRate: Number(record.otRate || 0),
      otAmount: Number(record.otAmount || 0),
      tiffinDays: Number(record.tiffinDays || 0),
      tiffinRate: Number(record.tiffinRate || 0),
      tiffinAmount: Number(record.tiffinAmount || 0),
      totalDutyDays: Number(record.totalDutyDays || 0),
      totalPayableDays: Number(record.totalPayableDays || 0),
      totalHolidayDutyDays: Number(record.totalHolidayDutyDays || 0),
      totalPayableAmount: Number(record.totalPayableAmount || 0),
    };
  });

  return {
    payrollMonth,
    filters: {
      company: query.company,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
    },
    summary: {
      payrollMonth,
      month,
      year,
      totalEmployees: rows.length,
      totalGrossSalary: rows.reduce((sum, row) => sum + row.grossSalary, 0),
      totalOtHours: rows.reduce((sum, row) => sum + row.otHours, 0),
      totalOtAmount: rows.reduce((sum, row) => sum + row.otAmount, 0),
      totalTiffinDays: rows.reduce((sum, row) => sum + row.tiffinDays, 0),
      totalTiffinAmount: rows.reduce((sum, row) => sum + row.tiffinAmount, 0),
      totalPayableAmount: rows.reduce(
        (sum, row) => sum + row.totalPayableAmount,
        0,
      ),
      generatedAt: new Date().toISOString(),
    },
    readiness: {
      canExport: true,
      blockers: [],
    },
    rows,
  };
};

const exportOtStatementCsvFromDB = async (query: TOtStatementExportQuery) => {
  const preview = await buildOtStatementExportPreviewFromDB(query);

  return generateOtStatementCsv(preview);
};

const exportOtStatementExcelFromDB = async (query: TOtStatementExportQuery) => {
  const preview = await buildOtStatementExportPreviewFromDB(query);

  return generateOtStatementExcel(preview);
};

const exportOtStatementPdfFromDB = async (query: TOtStatementExportQuery) => {
  const preview = await buildOtStatementExportPreviewFromDB(query);

  return generateOtStatementPDF(preview);
};


export const OtStatementServices = {
  generateMonthlyOtStatementIntoDB,
  getAllOtStatementsFromDB,
  getSingleOtStatementFromDB,
  getOtStatementOperationalSummaryFromDB,
  processOtStatementIntoDB,
  approveOtStatementIntoDB,
  lockOtStatementIntoDB,
  unlockOtStatementIntoDB,
  bulkProcessOtStatementsIntoDB,
  bulkApproveOtStatementsIntoDB,
  bulkLockOtStatementsIntoDB,
  bulkUnlockOtStatementsIntoDB,
  buildOtStatementExportPreviewFromDB,
  exportOtStatementCsvFromDB,
  exportOtStatementExcelFromDB,
  exportOtStatementPdfFromDB,
};

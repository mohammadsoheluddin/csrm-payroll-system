import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import SalarySheet from "../salarySheet/salarySheet.model";
import type { TSalarySheet } from "../salarySheet/salarySheet.interface";
import SalaryStatement from "./salaryStatement.model";
import {
  TGenerateSalaryStatementPayload,
  TSalaryStatement,
  TSalaryStatementActionPayload,
  TSalaryStatementBulkActionPayload,
  TSalaryStatementBulkActionType,
  TSalaryStatementQuery,
  TSalaryStatementStatus,
  TSalaryStatementSummaryQuery,
} from "./salaryStatement.interface";

import { createFinancialRecordSoftDeleteHandlers } from "../../common/financialRecordSoftDelete";
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
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

const resolvePayrollMonthFromQuery = (
  query: TSalaryStatementQuery | TSalaryStatementSummaryQuery,
) => {
  if (query.payrollMonth) {
    return query.payrollMonth;
  }

  if (query.month && query.year) {
    const month = Number(query.month);
    const year = Number(query.year);

    if (!month || !year) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Valid month and year are required.",
      );
    }

    return buildPayrollMonth(month, year);
  }

  return "";
};

const buildSalaryStatementFilter = (
  query: TSalaryStatementQuery | TSalaryStatementSummaryQuery,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  const payrollMonth = resolvePayrollMonthFromQuery(query);

  if (payrollMonth) {
    filter.payrollMonth = payrollMonth;
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

  if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if ("isLocked" in query && query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  return filter;
};

type TSalarySheetRecord = TSalarySheet & {
  _id: Types.ObjectId;
};

const buildSalarySheetFilterFromPayload = (
  payload: TGenerateSalaryStatementPayload,
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

  const filter: Record<string, unknown> = {
    payrollMonth,
    company: new Types.ObjectId(company),
    isDeleted: false,
  };

  if (payload.majorDepartment) {
    filter.majorDepartment = new Types.ObjectId(payload.majorDepartment);
  }

  if (payload.department) {
    filter.department = new Types.ObjectId(payload.department);
  }

  if (payload.branch) {
    filter.branch = new Types.ObjectId(payload.branch);
  }

  if (payload.employee) {
    filter.employee = new Types.ObjectId(payload.employee);
  }

  return {
    payrollMonth,
    filter,
  };
};

const assertLockedSalarySheets = (salarySheets: TSalarySheetRecord[]) => {
  const blockers = salarySheets.filter(
    (salarySheet) => salarySheet.status !== "locked" || !salarySheet.isLocked,
  );

  if (!blockers.length) {
    return;
  }

  const blockerPreview = blockers
    .slice(0, 10)
    .map((salarySheet) => {
      const employeeId = salarySheet.snapshot?.employee?.employeeId || "";
      const employeeName = salarySheet.snapshot?.employee?.employeeName || "";
      return `${employeeId} - ${employeeName}: Salary Sheet is ${salarySheet.status} and locked=${salarySheet.isLocked}.`;
    })
    .join("; ");

  throw new AppError(
    HTTP_STATUS.CONFLICT,
    `Salary Statement generation blocked. Locked Salary Sheet is required for every selected employee before statement processing. Blockers: ${blockerPreview}${
      blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."
    }`,
  );
};

const createSalaryStatementSnapshot = (salarySheet: TSalarySheetRecord) => {
  return {
    employee: salarySheet.snapshot?.employee || null,
    salarySheet: {
      salarySheetId: getObjectIdString(salarySheet._id),
      payrollMonth: salarySheet.payrollMonth,
      status: salarySheet.status,
      isLocked: salarySheet.isLocked,
      attendanceFinalizationId: getObjectIdString(
        salarySheet.attendanceFinalization,
      ),
      salaryStructureId: getObjectIdString(salarySheet.salaryStructure),
      basicSalary: Number(salarySheet.basicSalary || 0),
      houseRent: Number(salarySheet.houseRent || 0),
      medicalAllowance: Number(salarySheet.medicalAllowance || 0),
      transportAllowance: Number(salarySheet.transportAllowance || 0),
      otherAllowance: Number(salarySheet.otherAllowance || 0),
      grossSalary: Number(salarySheet.grossSalary || 0),
      fixedDeduction: Number(salarySheet.fixedDeduction || 0),
      attendanceDeduction: Number(salarySheet.attendanceDeduction || 0),
      totalDeduction: Number(salarySheet.totalDeduction || 0),
      netSalary: Number(salarySheet.netSalary || 0),
      payableSalary: Number(salarySheet.payableSalary || 0),
      totalPayableDays: Number(salarySheet.totalPayableDays || 0),
      totalDeductionDays: Number(salarySheet.totalDeductionDays || 0),
      totalAbsentDays: Number(salarySheet.totalAbsentDays || 0),
      totalPaidLeaveDays: Number(salarySheet.totalPaidLeaveDays || 0),
      totalUnpaidLeaveDays: Number(salarySheet.totalUnpaidLeaveDays || 0),
    },
  };
};

const buildSalaryStatementDocumentPayload = ({
  salarySheet,
  actionBy,
  remarks,
}: {
  salarySheet: TSalarySheetRecord;
  actionBy?: string;
  remarks?: string;
}) => {
  return {
    employee: salarySheet.employee,
    company: salarySheet.company,
    majorDepartment: salarySheet.majorDepartment,
    department: salarySheet.department,
    designation: salarySheet.designation,
    branch: salarySheet.branch,
    payrollMonth: salarySheet.payrollMonth,
    month: salarySheet.month,
    year: salarySheet.year,
    periodStartDate: salarySheet.periodStartDate,
    periodEndDate: salarySheet.periodEndDate,
    salarySheet: salarySheet._id,
    attendanceFinalization: salarySheet.attendanceFinalization,
    salaryStructure: salarySheet.salaryStructure,
    basicSalary: Number(salarySheet.basicSalary || 0),
    houseRent: Number(salarySheet.houseRent || 0),
    medicalAllowance: Number(salarySheet.medicalAllowance || 0),
    transportAllowance: Number(salarySheet.transportAllowance || 0),
    otherAllowance: Number(salarySheet.otherAllowance || 0),
    grossSalary: Number(salarySheet.grossSalary || 0),
    fixedDeduction: Number(salarySheet.fixedDeduction || 0),
    attendanceDeduction: Number(salarySheet.attendanceDeduction || 0),
    totalDeduction: Number(salarySheet.totalDeduction || 0),
    netSalary: Number(salarySheet.netSalary || 0),
    payableSalary: Number(salarySheet.payableSalary || 0),
    totalPayableDays: Number(salarySheet.totalPayableDays || 0),
    totalDeductionDays: Number(salarySheet.totalDeductionDays || 0),
    totalAbsentDays: Number(salarySheet.totalAbsentDays || 0),
    totalPaidLeaveDays: Number(salarySheet.totalPaidLeaveDays || 0),
    totalUnpaidLeaveDays: Number(salarySheet.totalUnpaidLeaveDays || 0),
    status: "draft" as TSalaryStatementStatus,
    isLocked: false,
    generatedBy: buildActionBy(actionBy),
    generatedAt: new Date(),
    processedBy: null,
    processedAt: null,
    approvedBy: null,
    approvedAt: null,
    lockedBy: null,
    lockedAt: null,
    snapshot: createSalaryStatementSnapshot(salarySheet),
    remarks: remarks || "",
    isDeleted: false,
  };
};

const buildResultItem = (record: any) => {
  return {
    salaryStatementId: record._id,
    employeeId: record.snapshot?.employee?.employeeId || "",
    employeeName: record.snapshot?.employee?.employeeName || "",
    payrollMonth: record.payrollMonth,
    grossSalary: record.grossSalary,
    totalDeduction: record.totalDeduction,
    payableSalary: record.payableSalary,
    salarySheetId: getObjectIdString(record.salarySheet),
    status: record.status,
    isLocked: record.isLocked,
  };
};

const generateMonthlySalaryStatementIntoDB = async (
  payload: TGenerateSalaryStatementPayload,
  actionBy?: string,
) => {
  const { payrollMonth, filter } = buildSalarySheetFilterFromPayload(payload);

  const salarySheets = await SalarySheet.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ "snapshot.employee.employeeId": 1, createdAt: 1 });

  if (!salarySheets.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Sheet records found for Salary Statement generation.",
    );
  }

  assertLockedSalarySheets(salarySheets as TSalarySheetRecord[]);

  const generatedSalaryStatements = [];
  const regeneratedSalaryStatements = [];
  const skippedEmployees = [];

  for (const salarySheet of salarySheets as TSalarySheetRecord[]) {
    const existingSalaryStatement = await SalaryStatement.findOne({
      employee: salarySheet.employee,
      payrollMonth,
      isDeleted: false,
    });

    const employeeId = salarySheet.snapshot?.employee?.employeeId || "";
    const employeeName = salarySheet.snapshot?.employee?.employeeName || "";

    if (existingSalaryStatement && !payload.overwrite) {
      skippedEmployees.push({
        employeeId,
        employeeName,
        reason: "Salary Statement already exists.",
      });
      continue;
    }

    if (existingSalaryStatement?.isLocked) {
      skippedEmployees.push({
        employeeId,
        employeeName,
        reason: "Locked Salary Statement cannot be overwritten.",
      });
      continue;
    }

    const documentPayload = buildSalaryStatementDocumentPayload({
      salarySheet,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingSalaryStatement && payload.overwrite) {
      const previousStatus = existingSalaryStatement.status;
      existingSalaryStatement.set({
        ...documentPayload,
        auditLogs: [
          ...existingSalaryStatement.auditLogs,
          {
            action: "regenerated",
            fromStatus: previousStatus,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note:
              payload.remarks ||
              `Salary Statement regenerated for ${payrollMonth}`,
          },
        ],
      });

      await existingSalaryStatement.save();
      regeneratedSalaryStatements.push(buildResultItem(existingSalaryStatement));
      continue;
    }

    const salaryStatement = await SalaryStatement.create({
      ...documentPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note: payload.remarks || `Salary Statement generated for ${payrollMonth}`,
        },
      ],
    });

    generatedSalaryStatements.push(buildResultItem(salaryStatement));
  }

  const totals = [
    ...generatedSalaryStatements,
    ...regeneratedSalaryStatements,
  ].reduce(
    (acc, item) => {
      acc.grossSalary += Number(item.grossSalary || 0);
      acc.totalDeduction += Number(item.totalDeduction || 0);
      acc.payableSalary += Number(item.payableSalary || 0);
      return acc;
    },
    { grossSalary: 0, totalDeduction: 0, payableSalary: 0 },
  );

  return {
    payrollMonth,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    salarySheetReadiness: {
      totalSalarySheetsFound: salarySheets.length,
      totalLockedSalarySheets: salarySheets.filter(
        (salarySheet) => salarySheet.status === "locked" && salarySheet.isLocked,
      ).length,
      totalGrossSalary: salarySheets.reduce(
        (sum, salarySheet) => sum + Number(salarySheet.grossSalary || 0),
        0,
      ),
      totalPayableSalary: salarySheets.reduce(
        (sum, salarySheet) => sum + Number(salarySheet.payableSalary || 0),
        0,
      ),
    },
    totalSalarySheets: salarySheets.length,
    totalGenerated: generatedSalaryStatements.length,
    totalRegenerated: regeneratedSalaryStatements.length,
    totalSkipped: skippedEmployees.length,
    totals,
    generatedSalaryStatements,
    regeneratedSalaryStatements,
    skippedEmployees,
  };
};

const getAllSalaryStatementsFromDB = async (query: TSalaryStatementQuery) => {
  const filter = buildSalaryStatementFilter(query);

  return SalaryStatement.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salarySheet")
    .sort({ payrollMonth: -1, "snapshot.employee.employeeId": 1 });
};

const getSingleSalaryStatementFromDB = async (id: string) => {
  assertObjectId(id, "Salary Statement id");

  const result = await SalaryStatement.findOne({ _id: id, isDeleted: false })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salarySheet")
    .populate("attendanceFinalization")
    .populate("salaryStructure");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Salary Statement not found.");
  }

  return result;
};

const getSalaryStatementOperationalSummaryFromDB = async (
  query: TSalaryStatementSummaryQuery,
) => {
  const filter = buildSalaryStatementFilter(query);
  const payrollMonth = resolvePayrollMonthFromQuery(query);

  if (!payrollMonth) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  const salaryStatements = await SalaryStatement.find(filter).lean<
    TSalaryStatement[]
  >();

  const statusSummary: Record<TSalaryStatementStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = salaryStatements.reduce(
    (acc, item) => {
      statusSummary[item.status] += 1;

      if (item.isLocked) {
        lockSummary.locked += 1;
      } else {
        lockSummary.unlocked += 1;
      }

      acc.totalGrossSalary += Number(item.grossSalary || 0);
      acc.totalFixedDeduction += Number(item.fixedDeduction || 0);
      acc.totalAttendanceDeduction += Number(item.attendanceDeduction || 0);
      acc.totalDeduction += Number(item.totalDeduction || 0);
      acc.totalNetSalary += Number(item.netSalary || 0);
      acc.totalPayableSalary += Number(item.payableSalary || 0);
      return acc;
    },
    {
      totalGrossSalary: 0,
      totalFixedDeduction: 0,
      totalAttendanceDeduction: 0,
      totalDeduction: 0,
      totalNetSalary: 0,
      totalPayableSalary: 0,
    },
  );

  const blockers: string[] = [];
  const totalRecords = salaryStatements.length;

  if (!totalRecords) {
    blockers.push("Salary Statement has not been generated for the selected filters.");
  }

  if (totalRecords && statusSummary.draft > 0) {
    blockers.push(`${statusSummary.draft} Salary Statement record(s) still in draft.`);
  }

  if (totalRecords && statusSummary.processed > 0) {
    blockers.push(
      `${statusSummary.processed} Salary Statement record(s) processed but not approved.`,
    );
  }

  if (totalRecords && statusSummary.approved > 0) {
    blockers.push(
      `${statusSummary.approved} Salary Statement record(s) approved but not locked.`,
    );
  }

  const isGenerated = totalRecords > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0;
  const isFullyLocked = isGenerated && statusSummary.locked === totalRecords;

  let nextRequiredAction = "generate_salary_statement";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_salary_statement";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_salary_statement";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_salary_statement";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_salary_payment_distribution";
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
    readiness: {
      isGenerated,
      isFullyProcessed,
      isFullyApproved,
      isFullyLocked,
      canProcessSalaryPaymentDistribution: isFullyLocked,
      canProcessBankSheet: isFullyLocked,
      canProcessCashSheet: isFullyLocked,
      canProcessMobileBankingSheet: isFullyLocked,
      nextRequiredAction,
      blockers,
    },
    statusSummary,
    lockSummary,
    totals: {
      totalRecords,
      ...totals,
    },
  };
};


const buildSalaryStatementBulkActionFilter = (
  payload: TSalaryStatementBulkActionPayload,
) => {
  if (!payload.company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  assertObjectId(payload.company, "Company");
  assertObjectId(payload.majorDepartment, "Major department");
  assertObjectId(payload.department, "Department");
  assertObjectId(payload.branch, "Branch");
  assertObjectId(payload.employee, "Employee");

  let payrollMonth = payload.payrollMonth;

  if (!payrollMonth) {
    if (!payload.month || !payload.year) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Either payrollMonth or both month and year are required.",
      );
    }

    payrollMonth = buildPayrollMonth(payload.month, payload.year);
  }

  const filter: Record<string, unknown> = {
    payrollMonth,
    company: new Types.ObjectId(payload.company),
    isDeleted: false,
  };

  if (payload.majorDepartment) {
    filter.majorDepartment = new Types.ObjectId(payload.majorDepartment);
  }

  if (payload.department) {
    filter.department = new Types.ObjectId(payload.department);
  }

  if (payload.branch) {
    filter.branch = new Types.ObjectId(payload.branch);
  }

  if (payload.employee) {
    filter.employee = new Types.ObjectId(payload.employee);
  }

  return {
    payrollMonth,
    filter,
  };
};

const buildSalaryStatementStatusSummary = (records: TSalaryStatement[]) => {
  const statusSummary: Record<TSalaryStatementStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  for (const record of records) {
    statusSummary[record.status] += 1;
  }

  return statusSummary;
};

const getSalaryStatementBulkActionConfig = (
  action: TSalaryStatementBulkActionType,
) => {
  const config: Record<
    TSalaryStatementBulkActionType,
    {
      auditAction: "processed" | "approved" | "locked" | "unlocked";
      allowedStatus: TSalaryStatementStatus;
      targetStatus: TSalaryStatementStatus;
      description: string;
    }
  > = {
    process: {
      auditAction: "processed",
      allowedStatus: "draft",
      targetStatus: "processed",
      description: "Bulk processed",
    },
    approve: {
      auditAction: "approved",
      allowedStatus: "processed",
      targetStatus: "approved",
      description: "Bulk approved",
    },
    lock: {
      auditAction: "locked",
      allowedStatus: "approved",
      targetStatus: "locked",
      description: "Bulk locked",
    },
    unlock: {
      auditAction: "unlocked",
      allowedStatus: "locked",
      targetStatus: "approved",
      description: "Bulk unlocked",
    },
  };

  return config[action];
};

const isSalaryStatementEligibleForBulkAction = (
  record: TSalaryStatement,
  action: TSalaryStatementBulkActionType,
) => {
  const config = getSalaryStatementBulkActionConfig(action);

  if (action === "unlock") {
    return record.status === "locked" && record.isLocked;
  }

  if (record.isLocked) {
    return false;
  }

  return record.status === config.allowedStatus;
};

const buildSalaryStatementBulkSkippedReason = (
  record: TSalaryStatement,
  action: TSalaryStatementBulkActionType,
) => {
  if (action !== "unlock" && record.isLocked) {
    return "Record is locked.";
  }

  if (action === "unlock") {
    return "Only locked Salary Statement records can be unlocked.";
  }

  const config = getSalaryStatementBulkActionConfig(action);
  return `Only ${config.allowedStatus} Salary Statement records can be ${config.description.toLowerCase()}.`;
};

const buildSalaryStatementBulkUpdatePayload = ({
  record,
  action,
  actionBy,
  note,
}: {
  record: TSalaryStatement;
  action: TSalaryStatementBulkActionType;
  actionBy?: string;
  note?: string;
}): Partial<TSalaryStatement> => {
  const config = getSalaryStatementBulkActionConfig(action);
  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  const updatePayload: Partial<TSalaryStatement> = {
    status: config.targetStatus,
    isLocked:
      action === "lock" ? true : action === "unlock" ? false : record.isLocked,
    auditLogs: [
      ...record.auditLogs,
      {
        action: config.auditAction,
        fromStatus: record.status,
        toStatus: config.targetStatus,
        actionBy: userObjectId,
        actionAt: now,
        note: note || `${config.description} for ${record.payrollMonth}.`,
      },
    ],
  };

  if (action === "process") {
    updatePayload.processedBy = userObjectId;
    updatePayload.processedAt = now;
  }

  if (action === "approve") {
    updatePayload.approvedBy = userObjectId;
    updatePayload.approvedAt = now;
  }

  if (action === "lock") {
    updatePayload.lockedBy = userObjectId;
    updatePayload.lockedAt = now;
    updatePayload.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: record as unknown as Record<string, unknown>,
      sourceModule: "salary_statement",
      sealedBy: userObjectId,
      note: note || "Salary Statement locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlock") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
    updatePayload.immutableSeal = null;
  }

  return updatePayload;
};

const buildSalaryStatementBulkResultItem = (record: any) => {
  return {
    id: getObjectIdString(record._id),
    employee: getObjectIdString(record.employee),
    employeeId: record.snapshot?.employee?.employeeId || "",
    employeeName: record.snapshot?.employee?.employeeName || "",
    payrollMonth: record.payrollMonth,
    status: record.status,
    isLocked: record.isLocked,
    grossSalary: record.grossSalary,
    fixedDeduction: record.fixedDeduction,
    attendanceDeduction: record.attendanceDeduction,
    totalDeduction: record.totalDeduction,
    netSalary: record.netSalary,
    payableSalary: record.payableSalary,
  };
};

const bulkChangeSalaryStatementStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TSalaryStatementBulkActionType;
  payload: TSalaryStatementBulkActionPayload;
  actionBy?: string;
}) => {
  const { payrollMonth, filter } = buildSalaryStatementBulkActionFilter(payload);
  const records = await SalaryStatement.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Statement records found for the selected month and filters.",
    );
  }

  const statusSummaryBefore = buildSalaryStatementStatusSummary(
    records as TSalaryStatement[],
  );

  if (action === "lock" && payload.strict !== false) {
    const blockers = records.filter(
      (record) => record.status !== "approved" || record.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Salary Payment Distribution readiness lock rejected. ${blockers.length} Salary Statement record(s) are not ready for lock. Process and approve every selected Salary Statement first, or pass strict=false for partial lock.`,
      );
    }
  }

  const processedRecords = [];
  const skippedRecords = [];

  for (const record of records) {
    if (!isSalaryStatementEligibleForBulkAction(record as TSalaryStatement, action)) {
      skippedRecords.push({
        ...buildSalaryStatementBulkResultItem(record),
        reason: buildSalaryStatementBulkSkippedReason(
          record as TSalaryStatement,
          action,
        ),
      });
      continue;
    }

    const updatedRecord = await SalaryStatement.findOneAndUpdate(
      {
        _id: record._id,
        isDeleted: false,
      },
      buildSalaryStatementBulkUpdatePayload({
        record: record as TSalaryStatement,
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
      .populate("branch")
      .populate("salarySheet")
      .populate("attendanceFinalization")
      .populate("salaryStructure");

    if (updatedRecord) {
      processedRecords.push(updatedRecord);
    }
  }

  const refreshedRecords = await SalaryStatement.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  const refreshedStatusSummary = buildSalaryStatementStatusSummary(
    refreshedRecords as TSalaryStatement[],
  );
  const totalLocked = refreshedRecords.filter((record) => record.isLocked).length;
  const isFullyLocked =
    refreshedRecords.length > 0 && totalLocked === refreshedRecords.length;

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
    salaryPaymentDistributionReadiness: {
      canProcessSalaryPaymentDistribution: isFullyLocked,
      canProcessBankSheet: isFullyLocked,
      canProcessCashSheet: isFullyLocked,
      canProcessMobileBankingSheet: isFullyLocked,
      totalRecords: refreshedRecords.length,
      totalLocked,
      blockers: isFullyLocked
        ? []
        : [
            "All selected Salary Statement records must be locked before Salary Payment Distribution processing.",
          ],
    },
    summary: {
      totalMatched: records.length,
      totalProcessed: processedRecords.length,
      totalSkipped: skippedRecords.length,
      statusSummaryBefore,
      statusSummaryAfter: refreshedStatusSummary,
      lockSummaryAfter: {
        locked: totalLocked,
        unlocked: refreshedRecords.length - totalLocked,
      },
      strictLock: action === "lock" ? payload.strict !== false : null,
    },
    processedRecords,
    skippedRecords,
  };
};

const applySingleAction = async ({
  id,
  payload,
  actionBy,
  expectedStatus,
  nextStatus,
  action,
}: {
  id: string;
  payload?: TSalaryStatementActionPayload;
  actionBy?: string;
  expectedStatus: TSalaryStatementStatus;
  nextStatus: TSalaryStatementStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Salary Statement id");

  const salaryStatement = await SalaryStatement.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!salaryStatement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Salary Statement not found.");
  }

  if (action !== "unlocked" && salaryStatement.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked Salary Statement cannot be changed.",
    );
  }

  if (salaryStatement.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Salary Statement must be ${expectedStatus} before it can be ${action}. Current status is ${salaryStatement.status}.`,
    );
  }

  const previousStatus = salaryStatement.status;
  salaryStatement.status = nextStatus;

  if (action === "processed") {
    salaryStatement.processedBy = buildActionBy(actionBy);
    salaryStatement.processedAt = new Date();
  }

  if (action === "approved") {
    salaryStatement.approvedBy = buildActionBy(actionBy);
    salaryStatement.approvedAt = new Date();
  }

  if (action === "locked") {
    salaryStatement.isLocked = true;
    salaryStatement.lockedBy = buildActionBy(actionBy);
    salaryStatement.lockedAt = new Date();
    salaryStatement.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: salaryStatement as unknown as Record<string, unknown>,
      sourceModule: "salary_statement",
      sealedBy: buildActionBy(actionBy),
      note: payload?.note || "Salary Statement locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlocked") {
    salaryStatement.isLocked = false;
    salaryStatement.lockedBy = null;
    salaryStatement.lockedAt = null;
    salaryStatement.immutableSeal = null;
  }

  salaryStatement.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: buildActionBy(actionBy),
    actionAt: new Date(),
    note: payload?.note || "",
  });

  await salaryStatement.save();

  return salaryStatement;
};

const processSalaryStatementIntoDB = async (
  id: string,
  payload?: TSalaryStatementActionPayload,
  actionBy?: string,
) => {
  return applySingleAction({
    id,
    payload,
    actionBy,
    expectedStatus: "draft",
    nextStatus: "processed",
    action: "processed",
  });
};

const approveSalaryStatementIntoDB = async (
  id: string,
  payload?: TSalaryStatementActionPayload,
  actionBy?: string,
) => {
  return applySingleAction({
    id,
    payload,
    actionBy,
    expectedStatus: "processed",
    nextStatus: "approved",
    action: "approved",
  });
};

const lockSalaryStatementIntoDB = async (
  id: string,
  payload?: TSalaryStatementActionPayload,
  actionBy?: string,
) => {
  return applySingleAction({
    id,
    payload,
    actionBy,
    expectedStatus: "approved",
    nextStatus: "locked",
    action: "locked",
  });
};

const unlockSalaryStatementIntoDB = async (
  id: string,
  payload?: TSalaryStatementActionPayload,
  actionBy?: string,
) => {
  return applySingleAction({
    id,
    payload,
    actionBy,
    expectedStatus: "locked",
    nextStatus: "approved",
    action: "unlocked",
  });
};

const bulkProcessSalaryStatementsIntoDB = async (
  payload: TSalaryStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalaryStatementStatusIntoDB({
    action: "process",
    payload,
    actionBy,
  });
};

const bulkApproveSalaryStatementsIntoDB = async (
  payload: TSalaryStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalaryStatementStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockSalaryStatementsIntoDB = async (
  payload: TSalaryStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalaryStatementStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockSalaryStatementsIntoDB = async (
  payload: TSalaryStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalaryStatementStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};


const {
  getDeletedRecordsFromDB: getDeletedSalaryStatementsFromDB,
  softDeleteRecordFromDB: softDeleteSalaryStatementFromDB,
  restoreRecordIntoDB: restoreSalaryStatementIntoDB,
} = createFinancialRecordSoftDeleteHandlers({
  model: SalaryStatement,
  recordName: "Salary Statement",
  queryFields: ['employee', 'company', 'payrollMonth', 'status'],
  restoreUniqueFields: ['employee', 'payrollMonth'],
});

export const SalaryStatementServices = {
  generateMonthlySalaryStatementIntoDB,
  getAllSalaryStatementsFromDB,
  getSingleSalaryStatementFromDB,
  getSalaryStatementOperationalSummaryFromDB,
  processSalaryStatementIntoDB,
  approveSalaryStatementIntoDB,
  lockSalaryStatementIntoDB,
  unlockSalaryStatementIntoDB,
  bulkProcessSalaryStatementsIntoDB,
  bulkApproveSalaryStatementsIntoDB,
  bulkLockSalaryStatementsIntoDB,
  bulkUnlockSalaryStatementsIntoDB,

  getDeletedSalaryStatementsFromDB,
  softDeleteSalaryStatementFromDB,
  restoreSalaryStatementIntoDB,
};

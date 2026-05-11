import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import BonusSheet from "../bonusSheet/bonusSheet.model";
import type { TBonusSheet } from "../bonusSheet/bonusSheet.interface";
import {
  TBonusStatement,
  TBonusStatementActionPayload,
  TBonusStatementBulkActionPayload,
  TBonusStatementBulkActionType,
  TBonusStatementQuery,
  TBonusStatementStatus,
  TBonusStatementSummaryQuery,
  TGenerateBonusStatementPayload,
} from "./bonusStatement.interface";
import BonusStatement from "./bonusStatement.model";

import { createFinancialRecordSoftDeleteHandlers } from "../../common/financialRecordSoftDelete";
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const buildBonusMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const parseBonusMonth = (bonusMonth: string) => {
  const [yearText, monthText] = bonusMonth.split("-");

  return {
    month: Number(monthText),
    year: Number(yearText),
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

const normalizeBonusMonthFromPayload = (payload: {
  bonusMonth?: string;
  month?: string | number;
  year?: string | number;
}) => {
  if (payload.bonusMonth) {
    return payload.bonusMonth;
  }

  const month = Number(payload.month);
  const year = Number(payload.year);

  if (!month || !year) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either bonusMonth or both month and year are required.",
    );
  }

  return buildBonusMonth(month, year);
};

const validateMonthlyPayload = ({
  bonusMonth,
  month,
  year,
  company,
  majorDepartment,
  department,
  branch,
  employee,
}: {
  bonusMonth?: string;
  month?: string | number;
  year?: string | number;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
}) => {
  if (!bonusMonth && (!month || !year)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either bonusMonth or both month and year are required.",
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

const buildBaseFilter = ({
  bonusMonth,
  company,
  majorDepartment,
  department,
  branch,
  employee,
  bonusName,
  bonusType,
}: {
  bonusMonth: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: string;
}) => {
  const filter: Record<string, unknown> = {
    bonusMonth,
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

  if (bonusName) {
    filter.bonusName = bonusName;
  }

  if (bonusType) {
    filter.bonusType = bonusType;
  }

  return filter;
};

const buildBonusSheetFilter = (payload: TGenerateBonusStatementPayload) => {
  validateMonthlyPayload(payload);
  const bonusMonth = normalizeBonusMonthFromPayload(payload);

  const filter = buildBaseFilter({
    bonusMonth,
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    branch: payload.branch,
    employee: payload.employee,
    bonusName: payload.bonusName,
    bonusType: payload.bonusType,
  });

  return {
    bonusMonth,
    filter: {
      ...filter,
      status: "locked",
      isLocked: true,
    },
  };
};

const buildStatementFilterFromQuery = (
  query: TBonusStatementQuery | TBonusStatementSummaryQuery,
) => {
  const bonusMonth = normalizeBonusMonthFromPayload(query);

  const filter = buildBaseFilter({
    bonusMonth,
    company: query.company,
    majorDepartment: query.majorDepartment,
    department: query.department,
    branch: query.branch,
    employee: query.employee,
    bonusName: query.bonusName,
    bonusType: query.bonusType,
  });

  if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if ("isLocked" in query && query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  return {
    bonusMonth,
    filter,
  };
};

type TBonusSheetRecord = TBonusSheet & {
  _id: Types.ObjectId;
};

const buildBonusStatementDocumentPayload = ({
  bonusSheet,
  actionBy,
  remarks,
}: {
  bonusSheet: TBonusSheetRecord;
  actionBy?: string;
  remarks?: string;
}) => {
  return {
    employee: bonusSheet.employee,
    company: bonusSheet.company,
    majorDepartment: bonusSheet.majorDepartment,
    department: bonusSheet.department,
    designation: bonusSheet.designation,
    branch: bonusSheet.branch,
    bonusMonth: bonusSheet.bonusMonth,
    month: bonusSheet.month,
    year: bonusSheet.year,
    bonusName: bonusSheet.bonusName,
    bonusType: bonusSheet.bonusType,
    calculationBasis: bonusSheet.calculationBasis,
    bonusSheet: bonusSheet._id,
    salaryStructure: bonusSheet.salaryStructure,
    basicSalary: Number(bonusSheet.basicSalary || 0),
    grossSalary: Number(bonusSheet.grossSalary || 0),
    serviceDays: Number(bonusSheet.serviceDays || 0),
    baseAmount: Number(bonusSheet.baseAmount || 0),
    calculatedBonusAmount: Number(bonusSheet.calculatedBonusAmount || 0),
    payableBonusAmount: Number(bonusSheet.payableBonusAmount || 0),
    isEligible: Boolean(bonusSheet.isEligible),
    eligibilityReason: bonusSheet.eligibilityReason || "",
    status: "draft" as TBonusStatementStatus,
    isLocked: false,
    generatedBy: buildActionBy(actionBy),
    generatedAt: new Date(),
    processedBy: null,
    processedAt: null,
    approvedBy: null,
    approvedAt: null,
    lockedBy: null,
    lockedAt: null,
    immutableSeal: null,
    snapshot: {
      bonusSheet: {
        bonusSheetId: getObjectIdString(bonusSheet._id),
        bonusMonth: bonusSheet.bonusMonth,
        bonusName: bonusSheet.bonusName,
        bonusType: bonusSheet.bonusType,
        calculationBasis: bonusSheet.calculationBasis,
        status: bonusSheet.status,
        isLocked: bonusSheet.isLocked,
        salaryStructureId: getObjectIdString(bonusSheet.salaryStructure),
        basicSalary: Number(bonusSheet.basicSalary || 0),
        grossSalary: Number(bonusSheet.grossSalary || 0),
        serviceDays: Number(bonusSheet.serviceDays || 0),
        baseAmount: Number(bonusSheet.baseAmount || 0),
        calculatedBonusAmount: Number(bonusSheet.calculatedBonusAmount || 0),
        payableBonusAmount: Number(bonusSheet.payableBonusAmount || 0),
        isEligible: Boolean(bonusSheet.isEligible),
        eligibilityReason: bonusSheet.eligibilityReason || "",
      },
      sourceSnapshot: bonusSheet.snapshot || null,
    },
    remarks: remarks || "",
    isDeleted: false,
  };
};

const buildResultItem = (record: any) => ({
  bonusStatementId: record._id,
  bonusSheetId: record.bonusSheet,
  employeeId: record.snapshot?.sourceSnapshot?.employee?.employeeId || "",
  employeeName: record.snapshot?.sourceSnapshot?.employee?.employeeName || "",
  bonusMonth: record.bonusMonth,
  bonusName: record.bonusName,
  bonusType: record.bonusType,
  calculatedBonusAmount: record.calculatedBonusAmount,
  payableBonusAmount: record.payableBonusAmount,
  isEligible: record.isEligible,
  status: record.status,
  isLocked: record.isLocked,
});

const generateMonthlyBonusStatementIntoDB = async (
  payload: TGenerateBonusStatementPayload,
  actionBy?: string,
) => {
  const { bonusMonth, filter } = buildBonusSheetFilter(payload);

  const bonusSheets = await BonusSheet.find(filter).sort({
    bonusName: 1,
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  if (!bonusSheets.length) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Bonus Statement generation blocked. Locked Bonus Sheet is required for every selected employee before Bonus Statement processing.",
    );
  }

  const generatedBonusStatements = [];
  const regeneratedBonusStatements = [];
  const skippedBonusSheets = [];

  for (const bonusSheet of bonusSheets as TBonusSheetRecord[]) {
    const existingStatement = await BonusStatement.findOne({
      bonusSheet: bonusSheet._id,
      isDeleted: false,
    });

    const employeeId = bonusSheet.snapshot?.employee?.employeeId || "";
    const employeeName = bonusSheet.snapshot?.employee?.employeeName || "";

    if (existingStatement && !payload.overwrite) {
      skippedBonusSheets.push({
        employeeId,
        employeeName,
        bonusSheetId: getObjectIdString(bonusSheet._id),
        reason: "Bonus Statement already exists.",
      });
      continue;
    }

    if (existingStatement?.isLocked) {
      skippedBonusSheets.push({
        employeeId,
        employeeName,
        bonusSheetId: getObjectIdString(bonusSheet._id),
        reason: "Locked Bonus Statement cannot be overwritten.",
      });
      continue;
    }

    const documentPayload = buildBonusStatementDocumentPayload({
      bonusSheet,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingStatement && payload.overwrite) {
      const previousStatus = existingStatement.status;
      existingStatement.set({
        ...documentPayload,
        auditLogs: [
          ...existingStatement.auditLogs,
          {
            action: "regenerated",
            fromStatus: previousStatus,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note:
              payload.remarks ||
              `Bonus Statement regenerated for ${bonusSheet.bonusName} ${bonusMonth}`,
          },
        ],
      });

      await existingStatement.save();
      regeneratedBonusStatements.push(buildResultItem(existingStatement));
      continue;
    }

    const statement = await BonusStatement.create({
      ...documentPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note:
            payload.remarks ||
            `Bonus Statement generated for ${bonusSheet.bonusName} ${bonusMonth}`,
        },
      ],
    });

    generatedBonusStatements.push(buildResultItem(statement));
  }

  const allItems = [...generatedBonusStatements, ...regeneratedBonusStatements];
  const totals = allItems.reduce(
    (acc, item) => {
      acc.totalCalculatedBonus += Number(item.calculatedBonusAmount || 0);
      acc.totalPayableBonus += Number(item.payableBonusAmount || 0);
      if (item.isEligible) {
        acc.totalEligible += 1;
      } else {
        acc.totalIneligible += 1;
      }
      return acc;
    },
    {
      totalCalculatedBonus: 0,
      totalPayableBonus: 0,
      totalEligible: 0,
      totalIneligible: 0,
    },
  );

  return {
    bonusMonth,
    bonusName: payload.bonusName || null,
    bonusType: payload.bonusType || null,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    sourceReadiness: {
      totalLockedBonusSheetsFound: bonusSheets.length,
      totalBonusStatementsGenerated: allItems.length,
      totalBonusSheetsSkipped: skippedBonusSheets.length,
    },
    totalGenerated: generatedBonusStatements.length,
    totalRegenerated: regeneratedBonusStatements.length,
    totalSkipped: skippedBonusSheets.length,
    totals,
    generatedBonusStatements,
    regeneratedBonusStatements,
    skippedBonusSheets,
  };
};

const populateBonusStatementQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("bonusSheet")
    .populate("salaryStructure");
};

const getAllBonusStatementsFromDB = async (query: TBonusStatementQuery) => {
  const { filter } = buildStatementFilterFromQuery(query);

  return populateBonusStatementQuery(
    BonusStatement.find(filter).sort({
      bonusMonth: -1,
      bonusName: 1,
      "snapshot.sourceSnapshot.employee.employeeId": 1,
    }),
  );
};

const getSingleBonusStatementFromDB = async (id: string) => {
  assertObjectId(id, "Bonus Statement id");

  const result = await populateBonusStatementQuery(
    BonusStatement.findOne({ _id: id, isDeleted: false }),
  );

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Bonus Statement not found.");
  }

  return result;
};

const getBonusStatementOperationalSummaryFromDB = async (
  query: TBonusStatementSummaryQuery,
) => {
  validateMonthlyPayload(query);
  const { bonusMonth, filter } = buildStatementFilterFromQuery(query);

  const statements = await BonusStatement.find(filter).lean<TBonusStatement[]>();

  const statusSummary: Record<TBonusStatementStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = statements.reduce(
    (acc, item) => {
      statusSummary[item.status] += 1;
      if (item.isLocked) {
        lockSummary.locked += 1;
      } else {
        lockSummary.unlocked += 1;
      }
      acc.totalCalculatedBonus += Number(item.calculatedBonusAmount || 0);
      acc.totalPayableBonus += Number(item.payableBonusAmount || 0);
      if (item.isEligible) {
        acc.totalEligible += 1;
      } else {
        acc.totalIneligible += 1;
      }
      return acc;
    },
    {
      totalCalculatedBonus: 0,
      totalPayableBonus: 0,
      totalEligible: 0,
      totalIneligible: 0,
    },
  );

  const totalRecords = statements.length;
  const blockers: string[] = [];

  if (!totalRecords) {
    blockers.push("Bonus Statement has not been generated for the selected filters.");
  }

  if (totalRecords && statusSummary.draft > 0) {
    blockers.push(`${statusSummary.draft} Bonus Statement record(s) still in draft.`);
  }

  if (totalRecords && statusSummary.processed > 0) {
    blockers.push(
      `${statusSummary.processed} Bonus Statement record(s) processed but not approved.`,
    );
  }

  if (totalRecords && statusSummary.approved > 0) {
    blockers.push(
      `${statusSummary.approved} Bonus Statement record(s) approved but not locked.`,
    );
  }

  const isGenerated = totalRecords > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0;
  const isFullyLocked = isGenerated && statusSummary.locked === totalRecords;

  let nextRequiredAction = "generate_bonus_statement";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_bonus_statement";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_bonus_statement";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_bonus_statement";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_bonus_payment_distribution";
  }

  return {
    bonusMonth,
    filters: {
      company: query.company,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
      bonusName: query.bonusName || null,
      bonusType: query.bonusType || null,
    },
    readiness: {
      isGenerated,
      isFullyProcessed,
      isFullyApproved,
      isFullyLocked,
      canProcessBonusPaymentDistribution: isFullyLocked,
      canProcessBonusBankSheet: isFullyLocked,
      canProcessBonusCashSheet: isFullyLocked,
      canProcessBonusMobileBankingSheet: isFullyLocked,
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

const applySingleAction = async ({
  id,
  payload,
  actionBy,
  expectedStatus,
  nextStatus,
  action,
}: {
  id: string;
  payload?: TBonusStatementActionPayload;
  actionBy?: string;
  expectedStatus: TBonusStatementStatus;
  nextStatus: TBonusStatementStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Bonus Statement id");

  const statement = await BonusStatement.findOne({ _id: id, isDeleted: false });

  if (!statement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Bonus Statement not found.");
  }

  if (statement.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Only ${expectedStatus} Bonus Statement can be ${action}.`,
    );
  }

  const previousStatus = statement.status;
  statement.status = nextStatus;

  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  if (action === "processed") {
    statement.processedBy = userObjectId;
    statement.processedAt = now;
  }

  if (action === "approved") {
    statement.approvedBy = userObjectId;
    statement.approvedAt = now;
  }

  if (action === "locked") {
    statement.isLocked = true;
    statement.lockedBy = userObjectId;
    statement.lockedAt = now;
    statement.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: statement.toObject() as unknown as Record<string, unknown>,
      sourceModule: "bonus_statement",
      sealedBy: userObjectId,
      note: payload?.note || "Bonus Statement locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlocked") {
    statement.isLocked = false;
    statement.lockedBy = null;
    statement.lockedAt = null;
    statement.immutableSeal = null;
  }

  statement.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: userObjectId,
    actionAt: now,
    note: payload?.note || `Bonus Statement ${action}.`,
  });

  await statement.save();
  return statement;
};

const buildBulkFilter = (payload: TBonusStatementBulkActionPayload) => {
  validateMonthlyPayload(payload);
  const bonusMonth = normalizeBonusMonthFromPayload(payload);

  return {
    bonusMonth,
    filter: buildBaseFilter({
      bonusMonth,
      company: payload.company,
      majorDepartment: payload.majorDepartment,
      department: payload.department,
      branch: payload.branch,
      employee: payload.employee,
      bonusName: payload.bonusName,
      bonusType: payload.bonusType,
    }),
  };
};

const bulkChangeBonusStatementStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TBonusStatementBulkActionType;
  payload: TBonusStatementBulkActionPayload;
  actionBy?: string;
}) => {
  const { bonusMonth, filter } = buildBulkFilter(payload);
  const statements = await BonusStatement.find(filter).sort({
    bonusName: 1,
    "snapshot.sourceSnapshot.employee.employeeId": 1,
  });

  if (!statements.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Bonus Statement records found for selected filters.",
    );
  }

  const transitionMap: Record<
    TBonusStatementBulkActionType,
    {
      expectedStatus: TBonusStatementStatus;
      nextStatus: TBonusStatementStatus;
      auditAction: "processed" | "approved" | "locked" | "unlocked";
    }
  > = {
    process: { expectedStatus: "draft", nextStatus: "processed", auditAction: "processed" },
    approve: { expectedStatus: "processed", nextStatus: "approved", auditAction: "approved" },
    lock: { expectedStatus: "approved", nextStatus: "locked", auditAction: "locked" },
    unlock: { expectedStatus: "locked", nextStatus: "approved", auditAction: "unlocked" },
  };

  const transition = transitionMap[action];
  const strict = payload.strict !== false;

  if (action === "lock" && strict) {
    const notApproved = statements.filter((item) => item.status !== "approved");

    if (notApproved.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Bulk lock rejected. ${notApproved.length} Bonus Statement record(s) are not approved yet.`,
      );
    }
  }

  const updatedRecords = [];
  const skippedRecords = [];

  for (const statement of statements) {
    const employeeId = statement.snapshot?.sourceSnapshot?.employee?.employeeId || "";
    const employeeName = statement.snapshot?.sourceSnapshot?.employee?.employeeName || "";

    if (statement.status !== transition.expectedStatus) {
      skippedRecords.push({
        bonusStatementId: getObjectIdString(statement._id),
        employeeId,
        employeeName,
        currentStatus: statement.status,
        reason: `Expected status ${transition.expectedStatus}.`,
      });
      continue;
    }

    const previousStatus = statement.status;
    const now = new Date();
    const userObjectId = buildActionBy(actionBy);

    statement.status = transition.nextStatus;

    if (action === "process") {
      statement.processedBy = userObjectId;
      statement.processedAt = now;
    }

    if (action === "approve") {
      statement.approvedBy = userObjectId;
      statement.approvedAt = now;
    }

    if (action === "lock") {
      statement.isLocked = true;
      statement.lockedBy = userObjectId;
      statement.lockedAt = now;
      statement.immutableSeal = buildPayrollImmutableSealFromRecord({
        record: statement.toObject() as unknown as Record<string, unknown>,
        sourceModule: "bonus_statement",
        sealedBy: userObjectId,
        note: payload.note || "Bonus Statement bulk locked and immutable snapshot sealed.",
      });
    }

    if (action === "unlock") {
      statement.isLocked = false;
      statement.lockedBy = null;
      statement.lockedAt = null;
      statement.immutableSeal = null;
    }

    statement.auditLogs.push({
      action: transition.auditAction,
      fromStatus: previousStatus,
      toStatus: transition.nextStatus,
      actionBy: userObjectId,
      actionAt: now,
      note: payload.note || `Bonus Statement bulk ${transition.auditAction}.`,
    });

    await statement.save();
    updatedRecords.push(buildResultItem(statement));
  }

  return {
    bonusMonth,
    action,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
      bonusName: payload.bonusName || null,
      bonusType: payload.bonusType || null,
    },
    summary: {
      totalMatched: statements.length,
      totalUpdated: updatedRecords.length,
      totalSkipped: skippedRecords.length,
    },
    bonusPaymentReadiness: {
      canProcessBonusPaymentDistribution:
        action === "lock" ? skippedRecords.length === 0 : false,
      nextRequiredAction:
        action === "lock" && skippedRecords.length === 0
          ? "ready_for_bonus_payment_distribution"
          : "complete_bonus_statement_lock",
    },
    updatedRecords,
    skippedRecords,
  };
};

const processBonusStatementIntoDB = async (
  id: string,
  payload?: TBonusStatementActionPayload,
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

const approveBonusStatementIntoDB = async (
  id: string,
  payload?: TBonusStatementActionPayload,
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

const lockBonusStatementIntoDB = async (
  id: string,
  payload?: TBonusStatementActionPayload,
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

const unlockBonusStatementIntoDB = async (
  id: string,
  payload?: TBonusStatementActionPayload,
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

const bulkProcessBonusStatementsIntoDB = async (
  payload: TBonusStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusStatementStatusIntoDB({ action: "process", payload, actionBy });
};

const bulkApproveBonusStatementsIntoDB = async (
  payload: TBonusStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusStatementStatusIntoDB({ action: "approve", payload, actionBy });
};

const bulkLockBonusStatementsIntoDB = async (
  payload: TBonusStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusStatementStatusIntoDB({ action: "lock", payload, actionBy });
};

const bulkUnlockBonusStatementsIntoDB = async (
  payload: TBonusStatementBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusStatementStatusIntoDB({ action: "unlock", payload, actionBy });
};


const {
  getDeletedRecordsFromDB: getDeletedBonusStatementsFromDB,
  softDeleteRecordFromDB: softDeleteBonusStatementFromDB,
  restoreRecordIntoDB: restoreBonusStatementIntoDB,
} = createFinancialRecordSoftDeleteHandlers({
  model: BonusStatement,
  recordName: "Bonus Statement",
  queryFields: ['employee', 'company', 'bonusMonth', 'bonusName', 'bonusType', 'status'],
  restoreUniqueFields: ['employee', 'bonusMonth', 'bonusName'],
});

export const BonusStatementServices = {
  generateMonthlyBonusStatementIntoDB,
  getAllBonusStatementsFromDB,
  getSingleBonusStatementFromDB,
  getBonusStatementOperationalSummaryFromDB,
  processBonusStatementIntoDB,
  approveBonusStatementIntoDB,
  lockBonusStatementIntoDB,
  unlockBonusStatementIntoDB,
  bulkProcessBonusStatementsIntoDB,
  bulkApproveBonusStatementsIntoDB,
  bulkLockBonusStatementsIntoDB,
  bulkUnlockBonusStatementsIntoDB,

  getDeletedBonusStatementsFromDB,
  softDeleteBonusStatementFromDB,
  restoreBonusStatementIntoDB,
};

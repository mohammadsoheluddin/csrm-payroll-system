import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import BonusStatement from "../bonusStatement/bonusStatement.model";
import type { TBonusStatement } from "../bonusStatement/bonusStatement.interface";
import {
  TBonusPaymentDistribution,
  TBonusPaymentDistributionActionPayload,
  TBonusPaymentDistributionBulkActionPayload,
  TBonusPaymentDistributionBulkActionType,
  TBonusPaymentDistributionPaymentMode,
  TBonusPaymentDistributionQuery,
  TBonusPaymentDistributionStatus,
  TBonusPaymentDistributionSummaryQuery,
  TGenerateBonusPaymentDistributionPayload,
} from "./bonusPaymentDistribution.interface";
import BonusPaymentDistribution from "./bonusPaymentDistribution.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const buildBonusMonth = (month: number, year: number) => {
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
  paymentMode,
}: {
  bonusMonth: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  bonusName?: string;
  bonusType?: string;
  paymentMode?: TBonusPaymentDistributionPaymentMode;
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

  if (paymentMode) {
    filter.paymentMode = paymentMode;
  }

  return filter;
};

const buildBonusStatementFilter = (
  payload: TGenerateBonusPaymentDistributionPayload,
) => {
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

const buildDistributionFilterFromQuery = (
  query: TBonusPaymentDistributionQuery | TBonusPaymentDistributionSummaryQuery,
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
    paymentMode: query.paymentMode,
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

type TBonusStatementRecord = TBonusStatement & {
  _id: Types.ObjectId;
};

type TPaymentInfoRecord = {
  _id: Types.ObjectId;
  paymentMode: TBonusPaymentDistributionPaymentMode;
  accountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountNo?: string;
  processBankBranchNo?: string;
  routingNo?: string;
  mobileBankingProvider?: string;
  mobileBankingNo?: string;
  cashPayReason?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isPrimary?: boolean;
  status?: string;
};

const getActivePaymentInfo = async (bonusStatement: TBonusStatementRecord) => {
  return EmployeeBankInfo.findOne({
    employee: bonusStatement.employee,
    company: bonusStatement.company,
    isPrimary: true,
    status: "active",
    isDeleted: false,
  }).sort({ effectiveFrom: -1, createdAt: -1 });
};

const buildPaymentInfoSnapshot = ({
  paymentInfo,
  allowCashFallback,
}: {
  paymentInfo: TPaymentInfoRecord | null;
  allowCashFallback: boolean;
}) => {
  if (!paymentInfo) {
    if (!allowCashFallback) {
      return null;
    }

    return {
      paymentInfo: null,
      paymentMode: "cash" as TBonusPaymentDistributionPaymentMode,
      paymentInfoSource: "fallback_cash" as const,
      paymentInfoWarning:
        "Active primary payment info not found. Bonus payable amount placed into fallback cash.",
      snapshot: {
        paymentMode: "cash" as TBonusPaymentDistributionPaymentMode,
        source: "fallback_cash" as const,
        warning:
          "Active primary payment info not found. Bonus payable amount placed into fallback cash.",
      },
    };
  }

  return {
    paymentInfo: paymentInfo._id,
    paymentMode: paymentInfo.paymentMode,
    paymentInfoSource: "employee_payment_info" as const,
    paymentInfoWarning: "",
    accountName: paymentInfo.accountName || "",
    bankName: paymentInfo.bankName || "",
    bankBranchName: paymentInfo.bankBranchName || "",
    bankBranchCode: paymentInfo.bankBranchCode || "",
    accountNo: paymentInfo.accountNo || "",
    processBankBranchNo: paymentInfo.processBankBranchNo || "",
    routingNo: paymentInfo.routingNo || "",
    mobileBankingProvider: paymentInfo.mobileBankingProvider || "",
    mobileBankingNo: paymentInfo.mobileBankingNo || "",
    cashPayReason: paymentInfo.cashPayReason || "",
    snapshot: {
      paymentInfoId: getObjectIdString(paymentInfo._id),
      paymentMode: paymentInfo.paymentMode,
      isPrimary: paymentInfo.isPrimary,
      status: paymentInfo.status,
      accountName: paymentInfo.accountName || "",
      bankName: paymentInfo.bankName || "",
      bankBranchName: paymentInfo.bankBranchName || "",
      bankBranchCode: paymentInfo.bankBranchCode || "",
      accountNo: paymentInfo.accountNo || "",
      processBankBranchNo: paymentInfo.processBankBranchNo || "",
      routingNo: paymentInfo.routingNo || "",
      mobileBankingProvider: paymentInfo.mobileBankingProvider || "",
      mobileBankingNo: paymentInfo.mobileBankingNo || "",
      cashPayReason: paymentInfo.cashPayReason || "",
      effectiveFrom: paymentInfo.effectiveFrom || "",
      effectiveTo: paymentInfo.effectiveTo || "",
      source: "employee_payment_info" as const,
      warning: "",
    },
  };
};

const splitAmountByPaymentMode = (
  paymentMode: TBonusPaymentDistributionPaymentMode,
  amount: number,
) => {
  return {
    bankAmount: paymentMode === "bank" ? amount : 0,
    cashAmount: paymentMode === "cash" ? amount : 0,
    mobileBankingAmount: paymentMode === "mobile_banking" ? amount : 0,
  };
};

const buildBonusPaymentDistributionDocumentPayload = async ({
  bonusStatement,
  actionBy,
  allowCashFallback,
  remarks,
}: {
  bonusStatement: TBonusStatementRecord;
  actionBy?: string;
  allowCashFallback: boolean;
  remarks?: string;
}) => {
  const paymentInfo = (await getActivePaymentInfo(
    bonusStatement,
  )) as TPaymentInfoRecord | null;

  const paymentSnapshot = buildPaymentInfoSnapshot({
    paymentInfo,
    allowCashFallback,
  });

  if (!paymentSnapshot) {
    return null;
  }

  const payableBonusAmount = Number(bonusStatement.payableBonusAmount || 0);
  const paymentAmounts = splitAmountByPaymentMode(
    paymentSnapshot.paymentMode,
    payableBonusAmount,
  );

  return {
    employee: bonusStatement.employee,
    company: bonusStatement.company,
    majorDepartment: bonusStatement.majorDepartment,
    department: bonusStatement.department,
    designation: bonusStatement.designation,
    branch: bonusStatement.branch,
    bonusMonth: bonusStatement.bonusMonth,
    month: bonusStatement.month,
    year: bonusStatement.year,
    bonusName: bonusStatement.bonusName,
    bonusType: bonusStatement.bonusType,
    calculationBasis: bonusStatement.calculationBasis,
    bonusStatement: bonusStatement._id,
    bonusSheet: bonusStatement.bonusSheet,
    salaryStructure: bonusStatement.salaryStructure,
    basicSalary: Number(bonusStatement.basicSalary || 0),
    grossSalary: Number(bonusStatement.grossSalary || 0),
    calculatedBonusAmount: Number(bonusStatement.calculatedBonusAmount || 0),
    payableBonusAmount,
    isEligible: Boolean(bonusStatement.isEligible),
    eligibilityReason: bonusStatement.eligibilityReason || "",
    ...paymentSnapshot,
    ...paymentAmounts,
    status: "draft" as TBonusPaymentDistributionStatus,
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
      bonusStatement: bonusStatement.snapshot || null,
      paymentInfo: paymentSnapshot.snapshot,
    },
    remarks: remarks || "",
    isDeleted: false,
  };
};

const buildResultItem = (record: any) => ({
  bonusPaymentDistributionId: record._id,
  bonusStatementId: record.bonusStatement,
  employeeId: record.snapshot?.bonusStatement?.sourceSnapshot?.employee?.employeeId || "",
  employeeName: record.snapshot?.bonusStatement?.sourceSnapshot?.employee?.employeeName || "",
  bonusMonth: record.bonusMonth,
  bonusName: record.bonusName,
  bonusType: record.bonusType,
  paymentMode: record.paymentMode,
  payableBonusAmount: record.payableBonusAmount,
  bankAmount: record.bankAmount,
  cashAmount: record.cashAmount,
  mobileBankingAmount: record.mobileBankingAmount,
  paymentInfoSource: record.paymentInfoSource,
  paymentInfoWarning: record.paymentInfoWarning,
  status: record.status,
  isLocked: record.isLocked,
});

const generateMonthlyBonusPaymentDistributionIntoDB = async (
  payload: TGenerateBonusPaymentDistributionPayload,
  actionBy?: string,
) => {
  const { bonusMonth, filter } = buildBonusStatementFilter(payload);
  const allowCashFallback = payload.allowCashFallback !== false;

  const bonusStatements = await BonusStatement.find(filter).sort({
    bonusName: 1,
    "snapshot.sourceSnapshot.employee.employeeId": 1,
  });

  if (!bonusStatements.length) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Bonus Payment Distribution generation blocked. Locked Bonus Statement is required before Bonus Bank/Cash/Mobile sheet processing.",
    );
  }

  const generatedDistributions = [];
  const regeneratedDistributions = [];
  const skippedStatements = [];

  for (const bonusStatement of bonusStatements as TBonusStatementRecord[]) {
    const employeeId = bonusStatement.snapshot?.sourceSnapshot?.employee?.employeeId || "";
    const employeeName = bonusStatement.snapshot?.sourceSnapshot?.employee?.employeeName || "";

    const existingDistribution = await BonusPaymentDistribution.findOne({
      bonusStatement: bonusStatement._id,
      isDeleted: false,
    });

    if (existingDistribution && !payload.overwrite) {
      skippedStatements.push({
        employeeId,
        employeeName,
        bonusStatementId: getObjectIdString(bonusStatement._id),
        reason: "Bonus Payment Distribution already exists.",
      });
      continue;
    }

    if (existingDistribution?.isLocked) {
      skippedStatements.push({
        employeeId,
        employeeName,
        bonusStatementId: getObjectIdString(bonusStatement._id),
        reason: "Locked Bonus Payment Distribution cannot be overwritten.",
      });
      continue;
    }

    const documentPayload = await buildBonusPaymentDistributionDocumentPayload({
      bonusStatement,
      actionBy,
      allowCashFallback,
      remarks: payload.remarks,
    });

    if (!documentPayload) {
      skippedStatements.push({
        employeeId,
        employeeName,
        bonusStatementId: getObjectIdString(bonusStatement._id),
        reason: "Active primary payment info not found and cash fallback disabled.",
      });
      continue;
    }

    if (existingDistribution && payload.overwrite) {
      const previousStatus = existingDistribution.status;
      existingDistribution.set({
        ...documentPayload,
        auditLogs: [
          ...existingDistribution.auditLogs,
          {
            action: "regenerated",
            fromStatus: previousStatus,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note:
              payload.remarks ||
              `Bonus Payment Distribution regenerated for ${bonusStatement.bonusName} ${bonusMonth}`,
          },
        ],
      });

      await existingDistribution.save();
      regeneratedDistributions.push(buildResultItem(existingDistribution));
      continue;
    }

    const distribution = await BonusPaymentDistribution.create({
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
            `Bonus Payment Distribution generated for ${bonusStatement.bonusName} ${bonusMonth}`,
        },
      ],
    });

    generatedDistributions.push(buildResultItem(distribution));
  }

  const allItems = [...generatedDistributions, ...regeneratedDistributions];

  const totals = allItems.reduce(
    (acc, item) => {
      acc.totalPayableBonus += Number(item.payableBonusAmount || 0);
      acc.totalBankAmount += Number(item.bankAmount || 0);
      acc.totalCashAmount += Number(item.cashAmount || 0);
      acc.totalMobileBankingAmount += Number(item.mobileBankingAmount || 0);
      if (item.paymentInfoSource === "fallback_cash") {
        acc.fallbackCashCount += 1;
      }
      return acc;
    },
    {
      totalPayableBonus: 0,
      totalBankAmount: 0,
      totalCashAmount: 0,
      totalMobileBankingAmount: 0,
      fallbackCashCount: 0,
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
      totalLockedBonusStatementsFound: bonusStatements.length,
      totalDistributionsGenerated: allItems.length,
      totalStatementsSkipped: skippedStatements.length,
      allowCashFallback,
    },
    totalGenerated: generatedDistributions.length,
    totalRegenerated: regeneratedDistributions.length,
    totalSkipped: skippedStatements.length,
    totals,
    generatedDistributions,
    regeneratedDistributions,
    skippedStatements,
  };
};

const populateBonusPaymentDistributionQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("bonusStatement")
    .populate("bonusSheet")
    .populate("salaryStructure")
    .populate("paymentInfo");
};

const getAllBonusPaymentDistributionsFromDB = async (
  query: TBonusPaymentDistributionQuery,
) => {
  const { filter } = buildDistributionFilterFromQuery(query);

  return populateBonusPaymentDistributionQuery(
    BonusPaymentDistribution.find(filter).sort({
      bonusMonth: -1,
      bonusName: 1,
      "snapshot.bonusStatement.sourceSnapshot.employee.employeeId": 1,
    }),
  );
};

const getSingleBonusPaymentDistributionFromDB = async (id: string) => {
  assertObjectId(id, "Bonus Payment Distribution id");

  const result = await populateBonusPaymentDistributionQuery(
    BonusPaymentDistribution.findOne({ _id: id, isDeleted: false }),
  );

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Bonus Payment Distribution not found.",
    );
  }

  return result;
};

const getBonusPaymentDistributionOperationalSummaryFromDB = async (
  query: TBonusPaymentDistributionSummaryQuery,
) => {
  validateMonthlyPayload(query);
  const { bonusMonth, filter } = buildDistributionFilterFromQuery(query);

  const distributions = await BonusPaymentDistribution.find(filter).lean<
    TBonusPaymentDistribution[]
  >();

  const statusSummary: Record<TBonusPaymentDistributionStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = distributions.reduce(
    (acc, item) => {
      statusSummary[item.status] += 1;
      if (item.isLocked) {
        lockSummary.locked += 1;
      } else {
        lockSummary.unlocked += 1;
      }
      acc.totalPayableBonus += Number(item.payableBonusAmount || 0);
      acc.totalBankAmount += Number(item.bankAmount || 0);
      acc.totalCashAmount += Number(item.cashAmount || 0);
      acc.totalMobileBankingAmount += Number(item.mobileBankingAmount || 0);
      if (item.paymentInfoSource === "fallback_cash") {
        acc.fallbackCashCount += 1;
      }
      return acc;
    },
    {
      totalPayableBonus: 0,
      totalBankAmount: 0,
      totalCashAmount: 0,
      totalMobileBankingAmount: 0,
      fallbackCashCount: 0,
    },
  );

  const totalRecords = distributions.length;
  const blockers: string[] = [];

  if (!totalRecords) {
    blockers.push(
      "Bonus Payment Distribution has not been generated for the selected filters.",
    );
  }

  if (totalRecords && statusSummary.draft > 0) {
    blockers.push(
      `${statusSummary.draft} Bonus Payment Distribution record(s) still in draft.`,
    );
  }

  if (totalRecords && statusSummary.processed > 0) {
    blockers.push(
      `${statusSummary.processed} Bonus Payment Distribution record(s) processed but not approved.`,
    );
  }

  if (totalRecords && statusSummary.approved > 0) {
    blockers.push(
      `${statusSummary.approved} Bonus Payment Distribution record(s) approved but not locked.`,
    );
  }

  const isGenerated = totalRecords > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0;
  const isFullyLocked = isGenerated && statusSummary.locked === totalRecords;

  let nextRequiredAction = "generate_bonus_payment_distribution";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_bonus_payment_distribution";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_bonus_payment_distribution";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_bonus_payment_distribution";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_bonus_bank_cash_mobile_sheets";
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
      paymentMode: query.paymentMode || null,
    },
    readiness: {
      isGenerated,
      isFullyProcessed,
      isFullyApproved,
      isFullyLocked,
      canProcessBonusPaymentSheet: isFullyLocked,
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
  payload?: TBonusPaymentDistributionActionPayload;
  actionBy?: string;
  expectedStatus: TBonusPaymentDistributionStatus;
  nextStatus: TBonusPaymentDistributionStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Bonus Payment Distribution id");

  const distribution = await BonusPaymentDistribution.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!distribution) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Bonus Payment Distribution not found.",
    );
  }

  if (distribution.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Only ${expectedStatus} Bonus Payment Distribution can be ${action}.`,
    );
  }

  const previousStatus = distribution.status;
  distribution.status = nextStatus;

  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  if (action === "processed") {
    distribution.processedBy = userObjectId;
    distribution.processedAt = now;
  }

  if (action === "approved") {
    distribution.approvedBy = userObjectId;
    distribution.approvedAt = now;
  }

  if (action === "locked") {
    distribution.isLocked = true;
    distribution.lockedBy = userObjectId;
    distribution.lockedAt = now;
    distribution.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: distribution.toObject() as unknown as Record<string, unknown>,
      sourceModule: "bonus_payment_distribution",
      sealedBy: userObjectId,
      note:
        payload?.note ||
        "Bonus Payment Distribution locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlocked") {
    distribution.isLocked = false;
    distribution.lockedBy = null;
    distribution.lockedAt = null;
    distribution.immutableSeal = null;
  }

  distribution.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: userObjectId,
    actionAt: now,
    note: payload?.note || `Bonus Payment Distribution ${action}.`,
  });

  await distribution.save();
  return distribution;
};

const buildBulkFilter = (payload: TBonusPaymentDistributionBulkActionPayload) => {
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
      paymentMode: payload.paymentMode,
    }),
  };
};

const bulkChangeBonusPaymentDistributionStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TBonusPaymentDistributionBulkActionType;
  payload: TBonusPaymentDistributionBulkActionPayload;
  actionBy?: string;
}) => {
  const { bonusMonth, filter } = buildBulkFilter(payload);
  const distributions = await BonusPaymentDistribution.find(filter).sort({
    bonusName: 1,
    "snapshot.bonusStatement.sourceSnapshot.employee.employeeId": 1,
  });

  if (!distributions.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Bonus Payment Distribution records found for selected filters.",
    );
  }

  const transitionMap: Record<
    TBonusPaymentDistributionBulkActionType,
    {
      expectedStatus: TBonusPaymentDistributionStatus;
      nextStatus: TBonusPaymentDistributionStatus;
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
    const notApproved = distributions.filter((item) => item.status !== "approved");

    if (notApproved.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Bulk lock rejected. ${notApproved.length} Bonus Payment Distribution record(s) are not approved yet.`,
      );
    }
  }

  const updatedRecords = [];
  const skippedRecords = [];

  for (const distribution of distributions) {
    const employeeId =
      distribution.snapshot?.bonusStatement?.sourceSnapshot?.employee?.employeeId ||
      "";
    const employeeName =
      distribution.snapshot?.bonusStatement?.sourceSnapshot?.employee?.employeeName ||
      "";

    if (distribution.status !== transition.expectedStatus) {
      skippedRecords.push({
        bonusPaymentDistributionId: getObjectIdString(distribution._id),
        employeeId,
        employeeName,
        currentStatus: distribution.status,
        reason: `Expected status ${transition.expectedStatus}.`,
      });
      continue;
    }

    const previousStatus = distribution.status;
    const now = new Date();
    const userObjectId = buildActionBy(actionBy);

    distribution.status = transition.nextStatus;

    if (action === "process") {
      distribution.processedBy = userObjectId;
      distribution.processedAt = now;
    }

    if (action === "approve") {
      distribution.approvedBy = userObjectId;
      distribution.approvedAt = now;
    }

    if (action === "lock") {
      distribution.isLocked = true;
      distribution.lockedBy = userObjectId;
      distribution.lockedAt = now;
      distribution.immutableSeal = buildPayrollImmutableSealFromRecord({
        record: distribution.toObject() as unknown as Record<string, unknown>,
        sourceModule: "bonus_payment_distribution",
        sealedBy: userObjectId,
        note:
          payload.note ||
          "Bonus Payment Distribution bulk locked and immutable snapshot sealed.",
      });
    }

    if (action === "unlock") {
      distribution.isLocked = false;
      distribution.lockedBy = null;
      distribution.lockedAt = null;
      distribution.immutableSeal = null;
    }

    distribution.auditLogs.push({
      action: transition.auditAction,
      fromStatus: previousStatus,
      toStatus: transition.nextStatus,
      actionBy: userObjectId,
      actionAt: now,
      note:
        payload.note ||
        `Bonus Payment Distribution bulk ${transition.auditAction}.`,
    });

    await distribution.save();
    updatedRecords.push(buildResultItem(distribution));
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
      paymentMode: payload.paymentMode || null,
    },
    summary: {
      totalMatched: distributions.length,
      totalUpdated: updatedRecords.length,
      totalSkipped: skippedRecords.length,
    },
    bonusPaymentReadiness: {
      canProcessBonusPaymentSheet:
        action === "lock" ? skippedRecords.length === 0 : false,
      canProcessBonusBankSheet:
        action === "lock" ? skippedRecords.length === 0 : false,
      canProcessBonusCashSheet:
        action === "lock" ? skippedRecords.length === 0 : false,
      canProcessBonusMobileBankingSheet:
        action === "lock" ? skippedRecords.length === 0 : false,
      nextRequiredAction:
        action === "lock" && skippedRecords.length === 0
          ? "ready_for_bonus_bank_cash_mobile_sheets"
          : "complete_bonus_payment_distribution_lock",
    },
    updatedRecords,
    skippedRecords,
  };
};

const processBonusPaymentDistributionIntoDB = async (
  id: string,
  payload?: TBonusPaymentDistributionActionPayload,
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

const approveBonusPaymentDistributionIntoDB = async (
  id: string,
  payload?: TBonusPaymentDistributionActionPayload,
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

const lockBonusPaymentDistributionIntoDB = async (
  id: string,
  payload?: TBonusPaymentDistributionActionPayload,
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

const unlockBonusPaymentDistributionIntoDB = async (
  id: string,
  payload?: TBonusPaymentDistributionActionPayload,
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

const bulkProcessBonusPaymentDistributionsIntoDB = async (
  payload: TBonusPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusPaymentDistributionStatusIntoDB({
    action: "process",
    payload,
    actionBy,
  });
};

const bulkApproveBonusPaymentDistributionsIntoDB = async (
  payload: TBonusPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusPaymentDistributionStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockBonusPaymentDistributionsIntoDB = async (
  payload: TBonusPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusPaymentDistributionStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockBonusPaymentDistributionsIntoDB = async (
  payload: TBonusPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusPaymentDistributionStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};

export const BonusPaymentDistributionServices = {
  generateMonthlyBonusPaymentDistributionIntoDB,
  getAllBonusPaymentDistributionsFromDB,
  getSingleBonusPaymentDistributionFromDB,
  getBonusPaymentDistributionOperationalSummaryFromDB,
  processBonusPaymentDistributionIntoDB,
  approveBonusPaymentDistributionIntoDB,
  lockBonusPaymentDistributionIntoDB,
  unlockBonusPaymentDistributionIntoDB,
  bulkProcessBonusPaymentDistributionsIntoDB,
  bulkApproveBonusPaymentDistributionsIntoDB,
  bulkLockBonusPaymentDistributionsIntoDB,
  bulkUnlockBonusPaymentDistributionsIntoDB,
};

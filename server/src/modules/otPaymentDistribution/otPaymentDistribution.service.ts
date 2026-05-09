import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import OtStatement from "../otStatement/otStatement.model";
import {
  TGenerateOtPaymentDistributionPayload,
  TOtPaymentDistributionActionPayload,
  TOtPaymentDistributionBulkActionPayload,
  TOtPaymentDistributionBulkActionType,
  TOtPaymentDistributionPaymentMode,
  TOtPaymentDistributionQuery,
  TOtPaymentDistributionStatus,
  TOtPaymentDistributionSummaryQuery,
} from "./otPaymentDistribution.interface";
import OtPaymentDistribution from "./otPaymentDistribution.model";

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
  paymentMode,
}: {
  payrollMonth: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  paymentMode?: TOtPaymentDistributionPaymentMode;
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

  if (paymentMode) {
    filter.paymentMode = paymentMode;
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

const populateOtPaymentDistributionQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("otStatement")
    .populate("timeBill")
    .populate("attendanceFinalization")
    .populate("salaryStructure")
    .populate("paymentInfo");
};

const buildOtStatementFilter = (payload: TGenerateOtPaymentDistributionPayload) => {
  return buildBaseFilter({
    payrollMonth: buildPayrollMonth(payload.month, payload.year),
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    branch: payload.branch,
    employee: payload.employee,
  });
};

const ensureOtStatementsReadyForPaymentDistribution = (otStatements: any[]) => {
  const blockers = otStatements
    .filter((otStatement) => otStatement.status !== "locked" || !otStatement.isLocked)
    .map((otStatement) => ({
      employeeId: otStatement?.employee?.employeeId || "",
      employeeName: getEmployeeFullName(otStatement?.employee),
      reason: `OT Statement is ${otStatement.status} and locked=${otStatement.isLocked}.`,
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
      `OT Payment Distribution generation blocked. Locked OT Statement is required for every selected employee before OT Bank/Cash/Mobile payment processing. Blockers: ${blockerPreview}${
        blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."
      }`,
    );
  }
};

const findPaymentInfoForEmployee = async ({
  employee,
  company,
  periodStartDate,
  periodEndDate,
}: {
  employee: string;
  company: string;
  periodStartDate: string;
  periodEndDate: string;
}) => {
  return EmployeeBankInfo.findOne({
    employee,
    company,
    status: "active",
    isDeleted: false,
    effectiveFrom: { $lte: periodEndDate },
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: "" },
      { effectiveTo: { $gte: periodStartDate } },
    ],
  }).sort({ isPrimary: -1, effectiveFrom: -1, createdAt: -1 });
};

const buildPaymentInfoSnapshot = ({
  paymentInfo,
  allowCashFallback,
}: {
  paymentInfo: any;
  allowCashFallback: boolean;
}) => {
  if (paymentInfo) {
    return {
      paymentInfoId: getObjectIdString(paymentInfo?._id),
      paymentMode: paymentInfo.paymentMode,
      isPrimary: Boolean(paymentInfo.isPrimary),
      status: paymentInfo.status || "",
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
    };
  }

  if (!allowCashFallback) {
    return null;
  }

  return {
    paymentInfoId: "",
    paymentMode: "cash" as TOtPaymentDistributionPaymentMode,
    isPrimary: false,
    status: "fallback",
    accountName: "",
    bankName: "",
    bankBranchName: "",
    bankBranchCode: "",
    accountNo: "",
    processBankBranchNo: "",
    routingNo: "",
    mobileBankingProvider: "",
    mobileBankingNo: "",
    cashPayReason: "No active primary payment information found during OT payment distribution generation.",
    effectiveFrom: "",
    effectiveTo: "",
    source: "fallback_cash" as const,
    warning: "Employee has no active payment info. Marked as cash fallback for manual review.",
  };
};

const createOtPaymentDistributionSnapshot = ({
  otStatement,
  paymentInfoSnapshot,
}: {
  otStatement: any;
  paymentInfoSnapshot: ReturnType<typeof buildPaymentInfoSnapshot>;
}) => {
  const employee = otStatement?.employee;

  return {
    employee: {
      employeeDbId: getObjectIdString(employee?._id),
      employeeId: employee?.employeeId || "",
      employeeName: getEmployeeFullName(employee),
      officeId: employee?.officeId || "",
      cardNo: employee?.cardNo || "",
      company: getIdNameSnapshot(otStatement?.company || employee?.company),
      majorDepartment: getIdNameSnapshot(
        otStatement?.majorDepartment || employee?.majorDepartment,
      ),
      department: getIdNameSnapshot(
        otStatement?.department || employee?.department,
      ),
      designation: getIdNameSnapshot(
        otStatement?.designation || employee?.designation,
      ),
      branch: getIdNameSnapshot(otStatement?.branch || employee?.branch),
      serviceType: employee?.serviceType || "",
      payType: employee?.payType || "",
      employmentStatus: employee?.employmentStatus || "",
      joiningDate: employee?.joiningDate || "",
    },
    otStatement: {
      otStatementId: getObjectIdString(otStatement?._id),
      payrollMonth: otStatement?.payrollMonth || "",
      status: otStatement?.status || "",
      isLocked: Boolean(otStatement?.isLocked),
      timeBillId: getObjectIdString(otStatement?.timeBill),
      attendanceFinalizationId: getObjectIdString(
        otStatement?.attendanceFinalization,
      ),
      salaryStructureId: getObjectIdString(otStatement?.salaryStructure),
      grossSalary: Number(otStatement?.grossSalary || 0),
      dutyHourPerDay: Number(otStatement?.dutyHourPerDay || 0),
      otHours: Number(otStatement?.otHours || 0),
      otRate: Number(otStatement?.otRate || 0),
      otAmount: Number(otStatement?.otAmount || 0),
      tiffinDays: Number(otStatement?.tiffinDays || 0),
      tiffinRate: Number(otStatement?.tiffinRate || 0),
      tiffinAmount: Number(otStatement?.tiffinAmount || 0),
      totalPayableAmount: Number(otStatement?.totalPayableAmount || 0),
    },
    paymentInfo: paymentInfoSnapshot,
  };
};

const buildOtPaymentDistributionPayload = ({
  otStatement,
  paymentInfo,
  paymentInfoSnapshot,
  snapshot,
  actionBy,
  remarks,
}: {
  otStatement: any;
  paymentInfo: any;
  paymentInfoSnapshot: NonNullable<ReturnType<typeof buildPaymentInfoSnapshot>>;
  snapshot: ReturnType<typeof createOtPaymentDistributionSnapshot>;
  actionBy?: string;
  remarks?: string;
}) => {
  const totalPayableAmount = Number(otStatement.totalPayableAmount || 0);
  const paymentMode = paymentInfoSnapshot.paymentMode;

  return {
    employee: otStatement.employee?._id || otStatement.employee,
    company: otStatement.company?._id || otStatement.company,
    majorDepartment: otStatement.majorDepartment?._id || otStatement.majorDepartment,
    department: otStatement.department?._id || otStatement.department,
    designation: otStatement.designation?._id || otStatement.designation,
    branch: otStatement.branch?._id || otStatement.branch,
    payrollMonth: otStatement.payrollMonth,
    month: otStatement.month,
    year: otStatement.year,
    periodStartDate: otStatement.periodStartDate,
    periodEndDate: otStatement.periodEndDate,
    otStatement: otStatement._id,
    timeBill: otStatement.timeBill?._id || otStatement.timeBill,
    attendanceFinalization:
      otStatement.attendanceFinalization?._id || otStatement.attendanceFinalization,
    salaryStructure: otStatement.salaryStructure?._id || otStatement.salaryStructure,
    grossSalary: Number(otStatement.grossSalary || 0),
    dutyHourPerDay: Number(otStatement.dutyHourPerDay || 0),
    otHours: Number(otStatement.otHours || 0),
    otRate: Number(otStatement.otRate || 0),
    otAmount: Number(otStatement.otAmount || 0),
    tiffinDays: Number(otStatement.tiffinDays || 0),
    tiffinRate: Number(otStatement.tiffinRate || 0),
    tiffinAmount: Number(otStatement.tiffinAmount || 0),
    totalPayableAmount,
    paymentMode,
    paymentInfo: paymentInfo?._id || null,
    accountName: paymentInfoSnapshot.accountName || "",
    bankName: paymentInfoSnapshot.bankName || "",
    bankBranchName: paymentInfoSnapshot.bankBranchName || "",
    bankBranchCode: paymentInfoSnapshot.bankBranchCode || "",
    accountNo: paymentInfoSnapshot.accountNo || "",
    processBankBranchNo: paymentInfoSnapshot.processBankBranchNo || "",
    routingNo: paymentInfoSnapshot.routingNo || "",
    mobileBankingProvider: paymentInfoSnapshot.mobileBankingProvider || "",
    mobileBankingNo: paymentInfoSnapshot.mobileBankingNo || "",
    cashPayReason: paymentInfoSnapshot.cashPayReason || "",
    paymentInfoSource: paymentInfoSnapshot.source,
    paymentInfoWarning: paymentInfoSnapshot.warning || "",
    bankAmount: paymentMode === "bank" ? totalPayableAmount : 0,
    cashAmount: paymentMode === "cash" ? totalPayableAmount : 0,
    mobileBankingAmount: paymentMode === "mobile_banking" ? totalPayableAmount : 0,
    status: "draft" as TOtPaymentDistributionStatus,
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

const summarizeRows = (rows: any[]) => {
  return {
    totalRecords: rows.length,
    totalPayableAmount: rows.reduce(
      (sum, row) => sum + Number(row.totalPayableAmount || 0),
      0,
    ),
    totalBankAmount: rows.reduce(
      (sum, row) => sum + Number(row.bankAmount || 0),
      0,
    ),
    totalCashAmount: rows.reduce(
      (sum, row) => sum + Number(row.cashAmount || 0),
      0,
    ),
    totalMobileBankingAmount: rows.reduce(
      (sum, row) => sum + Number(row.mobileBankingAmount || 0),
      0,
    ),
    fallbackCashCount: rows.filter(
      (row) => row.paymentInfoSource === "fallback_cash",
    ).length,
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

const buildPaymentModeSummary = (rows: any[]) => {
  const summary = {
    bank: { totalRecords: 0, totalAmount: 0 },
    cash: { totalRecords: 0, totalAmount: 0 },
    mobile_banking: { totalRecords: 0, totalAmount: 0 },
  };

  rows.forEach((row) => {
    const paymentMode = row.paymentMode as TOtPaymentDistributionPaymentMode;

    if (paymentMode in summary) {
      summary[paymentMode].totalRecords += 1;
      summary[paymentMode].totalAmount += Number(row.totalPayableAmount || 0);
    }
  });

  return summary;
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
      totalPayableAmount: 0,
      totalBankAmount: 0,
      totalCashAmount: 0,
      totalMobileBankingAmount: 0,
      fallbackCashCount: 0,
    };

    current.totalRecords += 1;
    current.totalPayableAmount += Number(row.totalPayableAmount || 0);
    current.totalBankAmount += Number(row.bankAmount || 0);
    current.totalCashAmount += Number(row.cashAmount || 0);
    current.totalMobileBankingAmount += Number(row.mobileBankingAmount || 0);

    if (row.paymentInfoSource === "fallback_cash") {
      current.fallbackCashCount += 1;
    }

    grouped.set(entity.id, current);
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

const buildOtPaymentSheetReadiness = (rows: any[]) => {
  const statusSummary = buildStatusSummary(rows);
  const lockSummary = buildLockSummary(rows);
  const paymentModeSummary = buildPaymentModeSummary(rows);
  const isGenerated = rows.length > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.approved + statusSummary.locked === rows.length;
  const isFullyLocked =
    isGenerated && lockSummary.unlocked === 0 && statusSummary.locked === rows.length;
  const fallbackCashCount = rows.filter(
    (row) => row.paymentInfoSource === "fallback_cash",
  ).length;
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!isGenerated) {
    blockers.push("OT Payment Distribution has not been generated yet.");
  }

  if (isGenerated && !isFullyProcessed) {
    blockers.push("Some OT Payment Distribution records are still in draft status.");
  }

  if (isGenerated && !isFullyApproved) {
    blockers.push("Some OT Payment Distribution records are not approved yet.");
  }

  if (isGenerated && !isFullyLocked) {
    blockers.push("Some OT Payment Distribution records are not locked yet.");
  }

  if (fallbackCashCount > 0) {
    warnings.push(
      `${fallbackCashCount} employee(s) are using fallback cash because active payment info was not found.`,
    );
  }

  let nextRequiredAction = "generate_ot_payment_distribution";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_ot_payment_distribution";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_ot_payment_distribution";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_ot_payment_distribution";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_ot_bank_cash_mobile_sheets";
  }

  return {
    canProcessOtPaymentSheet: isFullyLocked,
    canProcessOtBankSheet: isFullyLocked,
    canProcessOtCashSheet: isFullyLocked,
    canProcessOtMobileBankingSheet: isFullyLocked,
    hasBankPayable: paymentModeSummary.bank.totalAmount > 0,
    hasCashPayable: paymentModeSummary.cash.totalAmount > 0,
    hasMobileBankingPayable: paymentModeSummary.mobile_banking.totalAmount > 0,
    isGenerated,
    isFullyProcessed,
    isFullyApproved,
    isFullyLocked,
    nextRequiredAction,
    blockers,
    warnings,
  };
};

const generateMonthlyOtPaymentDistributionIntoDB = async (
  payload: TGenerateOtPaymentDistributionPayload,
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
  const allowCashFallback = payload.allowCashFallback !== false;
  const otStatementFilter = buildOtStatementFilter(payload);
  const otStatements = await populateOtStatementQuery(
    OtStatement.find(otStatementFilter).sort({ employee: 1 }),
  );

  if (!otStatements.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No OT Statement records found for OT Payment Distribution generation.",
    );
  }

  ensureOtStatementsReadyForPaymentDistribution(otStatements);

  const generatedDistributions = [];
  const regeneratedDistributions = [];
  const skippedRows = [];

  for (const otStatement of otStatements) {
    const employeeId = getObjectIdString(otStatement.employee?._id || otStatement.employee);
    const companyId = getObjectIdString(otStatement.company?._id || otStatement.company);
    const existingDistribution = await OtPaymentDistribution.findOne({
      employee: otStatement.employee?._id || otStatement.employee,
      payrollMonth,
      isDeleted: false,
    });

    if (existingDistribution && !payload.overwrite) {
      skippedRows.push({
        employeeId: otStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(otStatement?.employee),
        reason: "OT Payment Distribution already exists.",
      });
      continue;
    }

    if (existingDistribution && existingDistribution.isLocked) {
      skippedRows.push({
        employeeId: otStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(otStatement?.employee),
        reason: "Locked OT Payment Distribution cannot be overwritten.",
      });
      continue;
    }

    if (existingDistribution && existingDistribution.status !== "draft") {
      skippedRows.push({
        employeeId: otStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(otStatement?.employee),
        reason: "Only draft OT Payment Distribution can be overwritten.",
      });
      continue;
    }

    const paymentInfo = await findPaymentInfoForEmployee({
      employee: employeeId,
      company: companyId,
      periodStartDate: otStatement.periodStartDate,
      periodEndDate: otStatement.periodEndDate,
    });

    const paymentInfoSnapshot = buildPaymentInfoSnapshot({
      paymentInfo,
      allowCashFallback,
    });

    if (!paymentInfoSnapshot) {
      skippedRows.push({
        employeeId: otStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(otStatement?.employee),
        reason: "No active payment info found and cash fallback is disabled.",
      });
      continue;
    }

    const snapshot = createOtPaymentDistributionSnapshot({
      otStatement,
      paymentInfoSnapshot,
    });
    const distributionPayload = buildOtPaymentDistributionPayload({
      otStatement,
      paymentInfo,
      paymentInfoSnapshot,
      snapshot,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingDistribution) {
      existingDistribution.set({
        ...distributionPayload,
        auditLogs: [
          ...existingDistribution.auditLogs,
          {
            action: "regenerated",
            fromStatus: existingDistribution.status,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note:
              payload.remarks ||
              "OT Payment Distribution regenerated from locked OT Statement.",
          },
        ],
      });

      await existingDistribution.save();
      regeneratedDistributions.push(existingDistribution);
      continue;
    }

    const newDistribution = await OtPaymentDistribution.create({
      ...distributionPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note:
            payload.remarks ||
            "OT Payment Distribution generated from locked OT Statement.",
        },
      ],
    });

    generatedDistributions.push(newDistribution);
  }

  const affectedRows = [...generatedDistributions, ...regeneratedDistributions];

  return {
    payrollMonth,
    month,
    year,
    periodStartDate: otStatements[0]?.periodStartDate || "",
    periodEndDate: otStatements[0]?.periodEndDate || "",
    filters: {
      company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
      allowCashFallback,
    },
    otStatementReadiness: {
      consumedLockedOtStatements: otStatements.length,
    },
    totals: summarizeRows(affectedRows),
    totalGenerated: generatedDistributions.length,
    totalRegenerated: regeneratedDistributions.length,
    totalSkipped: skippedRows.length,
    skippedRows,
    data: affectedRows,
  };
};

const getAllOtPaymentDistributionsFromDB = async (
  query: TOtPaymentDistributionQuery,
) => {
  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const filter = buildBaseFilter({
    payrollMonth,
    company: query.company,
    majorDepartment: query.majorDepartment,
    department: query.department,
    branch: query.branch,
    employee: query.employee,
    paymentMode: query.paymentMode,
  });

  if (query.status) {
    filter.status = query.status;
  }

  if (query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  return populateOtPaymentDistributionQuery(
    OtPaymentDistribution.find(filter).sort({ employee: 1 }),
  );
};

const getSingleOtPaymentDistributionFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "OT Payment Distribution id is invalid.");
  }

  const result = await populateOtPaymentDistributionQuery(
    OtPaymentDistribution.findOne({
      _id: id,
      isDeleted: false,
    }),
  );

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "OT Payment Distribution not found.",
    );
  }

  return result;
};

const getOtPaymentDistributionOperationalSummaryFromDB = async (
  query: TOtPaymentDistributionSummaryQuery,
) => {
  validateMonthlyQuery(query);

  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const rows = await populateOtPaymentDistributionQuery(
    OtPaymentDistribution.find(
      buildBaseFilter({
        payrollMonth,
        company: query.company,
        majorDepartment: query.majorDepartment,
        department: query.department,
        branch: query.branch,
        employee: query.employee,
        paymentMode: query.paymentMode,
      }),
    ).sort({ employee: 1 }),
  );
  const { month, year } = parsePayrollMonth(payrollMonth);

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
      paymentMode: query.paymentMode || null,
    },
    readiness: buildOtPaymentSheetReadiness(rows),
    statusSummary: buildStatusSummary(rows),
    lockSummary: buildLockSummary(rows),
    paymentModeSummary: buildPaymentModeSummary(rows),
    totals: summarizeRows(rows),
    groupedSummary: {
      byMajorDepartment: groupSummaryBy(rows, "majorDepartment"),
      byDepartment: groupSummaryBy(rows, "department"),
      byBranch: groupSummaryBy(rows, "branch"),
    },
  };
};

const getExistingDistributionOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "OT Payment Distribution id is invalid.");
  }

  const existingDistribution = await OtPaymentDistribution.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingDistribution) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "OT Payment Distribution not found.",
    );
  }

  return existingDistribution;
};

const updateDistributionStatus = async ({
  id,
  allowedStatuses,
  nextStatus,
  action,
  actionBy,
  note,
  lockValue,
}: {
  id: string;
  allowedStatuses: TOtPaymentDistributionStatus[];
  nextStatus: TOtPaymentDistributionStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
  actionBy?: string;
  note?: string;
  lockValue?: boolean;
}) => {
  const existingDistribution = await getExistingDistributionOrThrow(id);

  if (action !== "unlocked" && existingDistribution.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked OT Payment Distribution cannot be modified.",
    );
  }

  if (!allowedStatuses.includes(existingDistribution.status)) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `OT Payment Distribution must be ${allowedStatuses.join(" or ")} before this action. Current status is ${existingDistribution.status}.`,
    );
  }

  const fromStatus = existingDistribution.status;
  const now = new Date();
  const actionUser = buildActionBy(actionBy);

  existingDistribution.status = nextStatus;

  if (lockValue !== undefined) {
    existingDistribution.isLocked = lockValue;
  }

  if (action === "processed") {
    existingDistribution.processedBy = actionUser;
    existingDistribution.processedAt = now;
  }

  if (action === "approved") {
    existingDistribution.approvedBy = actionUser;
    existingDistribution.approvedAt = now;
  }

  if (action === "locked") {
    existingDistribution.lockedBy = actionUser;
    existingDistribution.lockedAt = now;
  }

  if (action === "unlocked") {
    existingDistribution.lockedBy = null;
    existingDistribution.lockedAt = null;
  }

  existingDistribution.auditLogs.push({
    action,
    fromStatus,
    toStatus: nextStatus,
    actionBy: actionUser,
    actionAt: now,
    note: note || "",
  });

  await existingDistribution.save();

  return getSingleOtPaymentDistributionFromDB(id);
};

const processOtPaymentDistributionIntoDB = async (
  id: string,
  payload: TOtPaymentDistributionActionPayload,
  actionBy?: string,
) => {
  return updateDistributionStatus({
    id,
    allowedStatuses: ["draft"],
    nextStatus: "processed",
    action: "processed",
    actionBy,
    note: payload?.note,
  });
};

const approveOtPaymentDistributionIntoDB = async (
  id: string,
  payload: TOtPaymentDistributionActionPayload,
  actionBy?: string,
) => {
  return updateDistributionStatus({
    id,
    allowedStatuses: ["processed"],
    nextStatus: "approved",
    action: "approved",
    actionBy,
    note: payload?.note,
  });
};

const lockOtPaymentDistributionIntoDB = async (
  id: string,
  payload: TOtPaymentDistributionActionPayload,
  actionBy?: string,
) => {
  return updateDistributionStatus({
    id,
    allowedStatuses: ["approved"],
    nextStatus: "locked",
    action: "locked",
    actionBy,
    note: payload?.note,
    lockValue: true,
  });
};

const unlockOtPaymentDistributionIntoDB = async (
  id: string,
  payload: TOtPaymentDistributionActionPayload,
  actionBy?: string,
) => {
  return updateDistributionStatus({
    id,
    allowedStatuses: ["locked"],
    nextStatus: "approved",
    action: "unlocked",
    actionBy,
    note: payload?.note,
    lockValue: false,
  });
};

const getBulkActionFilter = (payload: TOtPaymentDistributionBulkActionPayload) => {
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
      paymentMode: payload.paymentMode,
    }),
  };
};

const applyBulkAction = async ({
  payload,
  actionBy,
  actionType,
}: {
  payload: TOtPaymentDistributionBulkActionPayload;
  actionBy?: string;
  actionType: TOtPaymentDistributionBulkActionType;
}) => {
  const { payrollMonth, filter } = getBulkActionFilter(payload);
  const rows = await OtPaymentDistribution.find(filter).sort({ employee: 1 });

  if (!rows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No OT Payment Distribution records found for selected filters.",
    );
  }

  const strict = payload.strict !== false;
  const actionUser = buildActionBy(actionBy);
  const now = new Date();
  const updatedRows = [];
  const skippedRows = [];

  const actionConfig: Record<
    TOtPaymentDistributionBulkActionType,
    {
      allowedStatuses: TOtPaymentDistributionStatus[];
      nextStatus: TOtPaymentDistributionStatus;
      auditAction: "processed" | "approved" | "locked" | "unlocked";
      lockValue?: boolean;
    }
  > = {
    process: {
      allowedStatuses: ["draft"],
      nextStatus: "processed",
      auditAction: "processed",
    },
    approve: {
      allowedStatuses: ["processed"],
      nextStatus: "approved",
      auditAction: "approved",
    },
    lock: {
      allowedStatuses: ["approved"],
      nextStatus: "locked",
      auditAction: "locked",
      lockValue: true,
    },
    unlock: {
      allowedStatuses: ["locked"],
      nextStatus: "approved",
      auditAction: "unlocked",
      lockValue: false,
    },
  };

  const config = actionConfig[actionType];

  if (strict && actionType === "lock") {
    const blockers = rows.filter(
      (row) => row.status !== "approved" || row.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Bulk OT Payment Distribution lock blocked. Every selected record must be approved and unlocked before lock. Blocked records: ${blockers.length}.`,
      );
    }
  }

  for (const row of rows) {
    const fromStatus = row.status;

    if (actionType !== "unlock" && row.isLocked) {
      skippedRows.push({
        id: row._id,
        employee: row.employee,
        reason: "Record is locked.",
      });
      continue;
    }

    if (!config.allowedStatuses.includes(row.status)) {
      skippedRows.push({
        id: row._id,
        employee: row.employee,
        reason: `Current status is ${row.status}. Required: ${config.allowedStatuses.join(" or ")}.`,
      });
      continue;
    }

    row.status = config.nextStatus;

    if (config.lockValue !== undefined) {
      row.isLocked = config.lockValue;
    }

    if (actionType === "process") {
      row.processedBy = actionUser;
      row.processedAt = now;
    }

    if (actionType === "approve") {
      row.approvedBy = actionUser;
      row.approvedAt = now;
    }

    if (actionType === "lock") {
      row.lockedBy = actionUser;
      row.lockedAt = now;
    }

    if (actionType === "unlock") {
      row.lockedBy = null;
      row.lockedAt = null;
    }

    row.auditLogs.push({
      action: config.auditAction,
      fromStatus,
      toStatus: config.nextStatus,
      actionBy: actionUser,
      actionAt: now,
      note: payload.note || "",
    });

    await row.save();
    updatedRows.push(row);
  }

  const allRowsAfterAction = await populateOtPaymentDistributionQuery(
    OtPaymentDistribution.find(filter).sort({ employee: 1 }),
  );

  return {
    payrollMonth,
    actionType,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
      paymentMode: payload.paymentMode || null,
    },
    summary: {
      selected: rows.length,
      updated: updatedRows.length,
      skipped: skippedRows.length,
    },
    totals: summarizeRows(allRowsAfterAction),
    statusSummary: buildStatusSummary(allRowsAfterAction),
    paymentModeSummary: buildPaymentModeSummary(allRowsAfterAction),
    otPaymentSheetReadiness: buildOtPaymentSheetReadiness(allRowsAfterAction),
    skippedRows,
    data: updatedRows,
  };
};

const bulkProcessOtPaymentDistributionsIntoDB = async (
  payload: TOtPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "process" });
};

const bulkApproveOtPaymentDistributionsIntoDB = async (
  payload: TOtPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "approve" });
};

const bulkLockOtPaymentDistributionsIntoDB = async (
  payload: TOtPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "lock" });
};

const bulkUnlockOtPaymentDistributionsIntoDB = async (
  payload: TOtPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "unlock" });
};

export const OtPaymentDistributionServices = {
  generateMonthlyOtPaymentDistributionIntoDB,
  getAllOtPaymentDistributionsFromDB,
  getSingleOtPaymentDistributionFromDB,
  getOtPaymentDistributionOperationalSummaryFromDB,
  processOtPaymentDistributionIntoDB,
  approveOtPaymentDistributionIntoDB,
  lockOtPaymentDistributionIntoDB,
  unlockOtPaymentDistributionIntoDB,
  bulkProcessOtPaymentDistributionsIntoDB,
  bulkApproveOtPaymentDistributionsIntoDB,
  bulkLockOtPaymentDistributionsIntoDB,
  bulkUnlockOtPaymentDistributionsIntoDB,
};

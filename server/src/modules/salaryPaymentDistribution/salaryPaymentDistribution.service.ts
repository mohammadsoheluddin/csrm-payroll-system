import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import SalaryStatement from "../salaryStatement/salaryStatement.model";
import {
  generateSalaryPaymentDistributionCsv,
  generateSalaryPaymentDistributionExcel,
  generateSalaryPaymentDistributionPDF,
} from "./salaryPaymentDistribution.export";
import {
  TGenerateSalaryPaymentDistributionPayload,
  TSalaryPaymentDistribution,
  TSalaryPaymentDistributionActionPayload,
  TSalaryPaymentDistributionBulkActionPayload,
  TSalaryPaymentDistributionBulkActionType,
  TSalaryPaymentDistributionExportQuery,
  TSalaryPaymentDistributionPaymentMode,
  TSalaryPaymentDistributionQuery,
  TSalaryPaymentDistributionStatus,
  TSalaryPaymentDistributionSummaryQuery,
} from "./salaryPaymentDistribution.interface";
import SalaryPaymentDistribution from "./salaryPaymentDistribution.model";

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
  paymentMode?: TSalaryPaymentDistributionPaymentMode;
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

const populateSalaryStatementQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salarySheet")
    .populate("attendanceFinalization")
    .populate("salaryStructure");
};

const populateSalaryPaymentDistributionQuery = (query: any) => {
  return query
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salaryStatement")
    .populate("salarySheet")
    .populate("attendanceFinalization")
    .populate("salaryStructure")
    .populate("paymentInfo");
};

const buildSalaryStatementFilter = (
  payload: TGenerateSalaryPaymentDistributionPayload,
) => {
  return buildBaseFilter({
    payrollMonth: buildPayrollMonth(payload.month, payload.year),
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    branch: payload.branch,
    employee: payload.employee,
  });
};

const ensureSalaryStatementsReadyForPaymentDistribution = (
  salaryStatements: any[],
) => {
  const blockers = salaryStatements
    .filter(
      (salaryStatement) =>
        salaryStatement.status !== "locked" || !salaryStatement.isLocked,
    )
    .map((salaryStatement) => ({
      employeeId: salaryStatement?.employee?.employeeId || "",
      employeeName: getEmployeeFullName(salaryStatement?.employee),
      reason: `Salary Statement is ${salaryStatement.status} and locked=${salaryStatement.isLocked}.`,
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
      `Salary Payment Distribution generation blocked. Locked Salary Statement is required for every selected employee before Salary Bank/Cash/Mobile payment processing. Blockers: ${blockerPreview}${
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
    paymentMode: "cash" as TSalaryPaymentDistributionPaymentMode,
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
    cashPayReason:
      "No active primary payment information found during salary payment distribution generation.",
    effectiveFrom: "",
    effectiveTo: "",
    source: "fallback_cash" as const,
    warning:
      "Employee has no active payment info. Marked as cash fallback for manual review.",
  };
};

const createSalaryPaymentDistributionSnapshot = ({
  salaryStatement,
  paymentInfoSnapshot,
}: {
  salaryStatement: any;
  paymentInfoSnapshot: ReturnType<typeof buildPaymentInfoSnapshot>;
}) => {
  const employee = salaryStatement?.employee;

  return {
    employee: {
      employeeDbId: getObjectIdString(employee?._id),
      employeeId: employee?.employeeId || "",
      employeeName: getEmployeeFullName(employee),
      officeId: employee?.officeId || "",
      cardNo: employee?.cardNo || "",
      company: getIdNameSnapshot(salaryStatement?.company || employee?.company),
      majorDepartment: getIdNameSnapshot(
        salaryStatement?.majorDepartment || employee?.majorDepartment,
      ),
      department: getIdNameSnapshot(
        salaryStatement?.department || employee?.department,
      ),
      designation: getIdNameSnapshot(
        salaryStatement?.designation || employee?.designation,
      ),
      branch: getIdNameSnapshot(salaryStatement?.branch || employee?.branch),
      serviceType: employee?.serviceType || "",
      payType: employee?.payType || "",
      employmentStatus: employee?.employmentStatus || "",
      joiningDate: employee?.joiningDate || "",
    },
    salaryStatement: {
      salaryStatementId: getObjectIdString(salaryStatement?._id),
      payrollMonth: salaryStatement?.payrollMonth || "",
      status: salaryStatement?.status || "",
      isLocked: Boolean(salaryStatement?.isLocked),
      salarySheetId: getObjectIdString(salaryStatement?.salarySheet),
      attendanceFinalizationId: getObjectIdString(
        salaryStatement?.attendanceFinalization,
      ),
      salaryStructureId: getObjectIdString(salaryStatement?.salaryStructure),
      basicSalary: Number(salaryStatement?.basicSalary || 0),
      houseRent: Number(salaryStatement?.houseRent || 0),
      medicalAllowance: Number(salaryStatement?.medicalAllowance || 0),
      transportAllowance: Number(salaryStatement?.transportAllowance || 0),
      otherAllowance: Number(salaryStatement?.otherAllowance || 0),
      grossSalary: Number(salaryStatement?.grossSalary || 0),
      fixedDeduction: Number(salaryStatement?.fixedDeduction || 0),
      attendanceDeduction: Number(salaryStatement?.attendanceDeduction || 0),
      totalDeduction: Number(salaryStatement?.totalDeduction || 0),
      netSalary: Number(salaryStatement?.netSalary || 0),
      payableSalary: Number(salaryStatement?.payableSalary || 0),
      totalPayableDays: Number(salaryStatement?.totalPayableDays || 0),
      totalDeductionDays: Number(salaryStatement?.totalDeductionDays || 0),
      totalAbsentDays: Number(salaryStatement?.totalAbsentDays || 0),
      totalPaidLeaveDays: Number(salaryStatement?.totalPaidLeaveDays || 0),
      totalUnpaidLeaveDays: Number(salaryStatement?.totalUnpaidLeaveDays || 0),
    },
    paymentInfo: paymentInfoSnapshot,
  };
};

const buildSalaryPaymentDistributionPayload = ({
  salaryStatement,
  paymentInfo,
  paymentInfoSnapshot,
  snapshot,
  actionBy,
  remarks,
}: {
  salaryStatement: any;
  paymentInfo: any;
  paymentInfoSnapshot: NonNullable<ReturnType<typeof buildPaymentInfoSnapshot>>;
  snapshot: ReturnType<typeof createSalaryPaymentDistributionSnapshot>;
  actionBy?: string;
  remarks?: string;
}) => {
  const payableSalary = Number(salaryStatement.payableSalary || 0);
  const paymentMode = paymentInfoSnapshot.paymentMode;

  return {
    employee: salaryStatement.employee?._id || salaryStatement.employee,
    company: salaryStatement.company?._id || salaryStatement.company,
    majorDepartment:
      salaryStatement.majorDepartment?._id || salaryStatement.majorDepartment,
    department: salaryStatement.department?._id || salaryStatement.department,
    designation: salaryStatement.designation?._id || salaryStatement.designation,
    branch: salaryStatement.branch?._id || salaryStatement.branch,
    payrollMonth: salaryStatement.payrollMonth,
    month: salaryStatement.month,
    year: salaryStatement.year,
    periodStartDate: salaryStatement.periodStartDate,
    periodEndDate: salaryStatement.periodEndDate,
    salaryStatement: salaryStatement._id,
    salarySheet: salaryStatement.salarySheet?._id || salaryStatement.salarySheet,
    attendanceFinalization:
      salaryStatement.attendanceFinalization?._id ||
      salaryStatement.attendanceFinalization,
    salaryStructure:
      salaryStatement.salaryStructure?._id || salaryStatement.salaryStructure,
    basicSalary: Number(salaryStatement.basicSalary || 0),
    houseRent: Number(salaryStatement.houseRent || 0),
    medicalAllowance: Number(salaryStatement.medicalAllowance || 0),
    transportAllowance: Number(salaryStatement.transportAllowance || 0),
    otherAllowance: Number(salaryStatement.otherAllowance || 0),
    grossSalary: Number(salaryStatement.grossSalary || 0),
    fixedDeduction: Number(salaryStatement.fixedDeduction || 0),
    attendanceDeduction: Number(salaryStatement.attendanceDeduction || 0),
    totalDeduction: Number(salaryStatement.totalDeduction || 0),
    netSalary: Number(salaryStatement.netSalary || 0),
    payableSalary,
    totalPayableDays: Number(salaryStatement.totalPayableDays || 0),
    totalDeductionDays: Number(salaryStatement.totalDeductionDays || 0),
    totalAbsentDays: Number(salaryStatement.totalAbsentDays || 0),
    totalPaidLeaveDays: Number(salaryStatement.totalPaidLeaveDays || 0),
    totalUnpaidLeaveDays: Number(salaryStatement.totalUnpaidLeaveDays || 0),
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
    bankAmount: paymentMode === "bank" ? payableSalary : 0,
    cashAmount: paymentMode === "cash" ? payableSalary : 0,
    mobileBankingAmount: paymentMode === "mobile_banking" ? payableSalary : 0,
    status: "draft" as TSalaryPaymentDistributionStatus,
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
    totalPayableSalary: rows.reduce(
      (sum, row) => sum + Number(row.payableSalary || 0),
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
    totalGrossSalary: rows.reduce(
      (sum, row) => sum + Number(row.grossSalary || 0),
      0,
    ),
    totalDeduction: rows.reduce(
      (sum, row) => sum + Number(row.totalDeduction || 0),
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
    const paymentMode = row.paymentMode as TSalaryPaymentDistributionPaymentMode;

    if (paymentMode in summary) {
      summary[paymentMode].totalRecords += 1;
      summary[paymentMode].totalAmount += Number(row.payableSalary || 0);
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
      totalPayableSalary: 0,
      totalBankAmount: 0,
      totalCashAmount: 0,
      totalMobileBankingAmount: 0,
      fallbackCashCount: 0,
    };

    current.totalRecords += 1;
    current.totalPayableSalary += Number(row.payableSalary || 0);
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

const buildSalaryPaymentSheetReadiness = (rows: any[]) => {
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
    blockers.push("Salary Payment Distribution has not been generated yet.");
  }

  if (isGenerated && !isFullyProcessed) {
    blockers.push("Some Salary Payment Distribution records are still in draft status.");
  }

  if (isGenerated && !isFullyApproved) {
    blockers.push("Some Salary Payment Distribution records are not approved yet.");
  }

  if (isGenerated && !isFullyLocked) {
    blockers.push("Some Salary Payment Distribution records are not locked yet.");
  }

  if (fallbackCashCount > 0) {
    warnings.push(
      `${fallbackCashCount} employee(s) are using fallback cash because active payment info was not found.`,
    );
  }

  let nextRequiredAction = "generate_salary_payment_distribution";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_salary_payment_distribution";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_salary_payment_distribution";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_salary_payment_distribution";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_salary_bank_cash_mobile_sheets";
  }

  return {
    canProcessSalaryPaymentSheet: isFullyLocked,
    canProcessBankSheet: isFullyLocked,
    canProcessCashSheet: isFullyLocked,
    canProcessMobileBankingSheet: isFullyLocked,
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

const generateMonthlySalaryPaymentDistributionIntoDB = async (
  payload: TGenerateSalaryPaymentDistributionPayload,
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
  const salaryStatementFilter = buildSalaryStatementFilter(payload);
  const salaryStatements = await populateSalaryStatementQuery(
    SalaryStatement.find(salaryStatementFilter).sort({ employee: 1 }),
  );

  if (!salaryStatements.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Statement records found for Salary Payment Distribution generation.",
    );
  }

  ensureSalaryStatementsReadyForPaymentDistribution(salaryStatements);

  const generatedDistributions: any[] = [];
  const regeneratedDistributions: any[] = [];
  const skippedRows: any[] = [];

  for (const salaryStatement of salaryStatements) {
    const employeeId = getObjectIdString(
      salaryStatement.employee?._id || salaryStatement.employee,
    );
    const companyId = getObjectIdString(
      salaryStatement.company?._id || salaryStatement.company,
    );
    const existingDistribution = await SalaryPaymentDistribution.findOne({
      employee: salaryStatement.employee?._id || salaryStatement.employee,
      payrollMonth,
      isDeleted: false,
    });

    if (existingDistribution && !payload.overwrite) {
      skippedRows.push({
        employeeId: salaryStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(salaryStatement?.employee),
        reason: "Salary Payment Distribution already exists.",
      });
      continue;
    }

    if (existingDistribution && existingDistribution.isLocked) {
      skippedRows.push({
        employeeId: salaryStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(salaryStatement?.employee),
        reason: "Locked Salary Payment Distribution cannot be overwritten.",
      });
      continue;
    }

    if (existingDistribution && existingDistribution.status !== "draft") {
      skippedRows.push({
        employeeId: salaryStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(salaryStatement?.employee),
        reason: "Only draft Salary Payment Distribution can be overwritten.",
      });
      continue;
    }

    const paymentInfo = await findPaymentInfoForEmployee({
      employee: employeeId,
      company: companyId,
      periodStartDate: salaryStatement.periodStartDate,
      periodEndDate: salaryStatement.periodEndDate,
    });

    const paymentInfoSnapshot = buildPaymentInfoSnapshot({
      paymentInfo,
      allowCashFallback,
    });

    if (!paymentInfoSnapshot) {
      skippedRows.push({
        employeeId: salaryStatement?.employee?.employeeId || "",
        employeeName: getEmployeeFullName(salaryStatement?.employee),
        reason: "No active payment info found and cash fallback is disabled.",
      });
      continue;
    }

    const snapshot = createSalaryPaymentDistributionSnapshot({
      salaryStatement,
      paymentInfoSnapshot,
    });
    const distributionPayload = buildSalaryPaymentDistributionPayload({
      salaryStatement,
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
              "Salary Payment Distribution regenerated from locked Salary Statement.",
          },
        ],
      });

      await existingDistribution.save();
      regeneratedDistributions.push(existingDistribution);
      continue;
    }

    const newDistribution = await SalaryPaymentDistribution.create({
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
            "Salary Payment Distribution generated from locked Salary Statement.",
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
    periodStartDate: salaryStatements[0]?.periodStartDate || "",
    periodEndDate: salaryStatements[0]?.periodEndDate || "",
    filters: {
      company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
      allowCashFallback,
    },
    salaryStatementReadiness: {
      consumedLockedSalaryStatements: salaryStatements.length,
    },
    totals: summarizeRows(affectedRows),
    totalGenerated: generatedDistributions.length,
    totalRegenerated: regeneratedDistributions.length,
    totalSkipped: skippedRows.length,
    skippedRows,
    data: affectedRows,
  };
};

const getAllSalaryPaymentDistributionsFromDB = async (
  query: TSalaryPaymentDistributionQuery,
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

  return populateSalaryPaymentDistributionQuery(
    SalaryPaymentDistribution.find(filter).sort({ employee: 1 }),
  );
};

const getSingleSalaryPaymentDistributionFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Salary Payment Distribution id is invalid.",
    );
  }

  const result = await populateSalaryPaymentDistributionQuery(
    SalaryPaymentDistribution.findOne({
      _id: id,
      isDeleted: false,
    }),
  );

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Salary Payment Distribution not found.",
    );
  }

  return result;
};

const getSalaryPaymentDistributionOperationalSummaryFromDB = async (
  query: TSalaryPaymentDistributionSummaryQuery,
) => {
  validateMonthlyQuery(query);

  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const rows = await populateSalaryPaymentDistributionQuery(
    SalaryPaymentDistribution.find(
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
    readiness: buildSalaryPaymentSheetReadiness(rows),
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
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Salary Payment Distribution id is invalid.",
    );
  }

  const existingDistribution = await SalaryPaymentDistribution.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingDistribution) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Salary Payment Distribution not found.",
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
  allowedStatuses: TSalaryPaymentDistributionStatus[];
  nextStatus: TSalaryPaymentDistributionStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
  actionBy?: string;
  note?: string;
  lockValue?: boolean;
}) => {
  const existingDistribution = await getExistingDistributionOrThrow(id);

  if (action !== "unlocked" && existingDistribution.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked Salary Payment Distribution cannot be modified.",
    );
  }

  if (!allowedStatuses.includes(existingDistribution.status)) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Salary Payment Distribution must be ${allowedStatuses.join(" or ")} before this action. Current status is ${existingDistribution.status}.`,
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

  return getSingleSalaryPaymentDistributionFromDB(id);
};

const processSalaryPaymentDistributionIntoDB = async (
  id: string,
  payload: TSalaryPaymentDistributionActionPayload,
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

const approveSalaryPaymentDistributionIntoDB = async (
  id: string,
  payload: TSalaryPaymentDistributionActionPayload,
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

const lockSalaryPaymentDistributionIntoDB = async (
  id: string,
  payload: TSalaryPaymentDistributionActionPayload,
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

const unlockSalaryPaymentDistributionIntoDB = async (
  id: string,
  payload: TSalaryPaymentDistributionActionPayload,
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

const getBulkActionFilter = (
  payload: TSalaryPaymentDistributionBulkActionPayload,
) => {
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
  payload: TSalaryPaymentDistributionBulkActionPayload;
  actionBy?: string;
  actionType: TSalaryPaymentDistributionBulkActionType;
}) => {
  const { payrollMonth, filter } = getBulkActionFilter(payload);
  const rows = await SalaryPaymentDistribution.find(filter).sort({ employee: 1 });

  if (!rows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Payment Distribution records found for selected filters.",
    );
  }

  const strict = payload.strict !== false;
  const actionUser = buildActionBy(actionBy);
  const now = new Date();
  const updatedRows: any[] = [];
  const skippedRows: any[] = [];

  const actionConfig: Record<
    TSalaryPaymentDistributionBulkActionType,
    {
      allowedStatuses: TSalaryPaymentDistributionStatus[];
      nextStatus: TSalaryPaymentDistributionStatus;
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
        `Bulk Salary Payment Distribution lock blocked. Every selected record must be approved and unlocked before lock. Blocked records: ${blockers.length}.`,
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

  const allRowsAfterAction = await populateSalaryPaymentDistributionQuery(
    SalaryPaymentDistribution.find(filter).sort({ employee: 1 }),
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
    salaryPaymentSheetReadiness:
      buildSalaryPaymentSheetReadiness(allRowsAfterAction),
    skippedRows,
    data: updatedRows,
  };
};

const bulkProcessSalaryPaymentDistributionsIntoDB = async (
  payload: TSalaryPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "process" });
};

const bulkApproveSalaryPaymentDistributionsIntoDB = async (
  payload: TSalaryPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "approve" });
};

const bulkLockSalaryPaymentDistributionsIntoDB = async (
  payload: TSalaryPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "lock" });
};

const bulkUnlockSalaryPaymentDistributionsIntoDB = async (
  payload: TSalaryPaymentDistributionBulkActionPayload,
  actionBy?: string,
) => {
  return applyBulkAction({ payload, actionBy, actionType: "unlock" });
};


const getExportPayableAmount = (row: any) => {
  if (row.paymentMode === "bank") {
    return Number(row.bankAmount || 0);
  }

  if (row.paymentMode === "mobile_banking") {
    return Number(row.mobileBankingAmount || 0);
  }

  return Number(row.cashAmount || 0);
};

const getSnapshotName = (row: any, fieldName: string) => {
  const snapshotValue = row?.snapshot?.employee?.[fieldName]?.name;

  if (snapshotValue) {
    return snapshotValue;
  }

  return row?.[fieldName]?.name || "";
};

const buildSalaryPaymentDistributionExportRows = (rows: any[]) => {
  return rows.map((row, index) => ({
    slNo: index + 1,
    salaryPaymentDistributionId: getObjectIdString(row?._id),
    employeeId:
      row?.snapshot?.employee?.employeeId || row?.employee?.employeeId || "",
    employeeName:
      row?.snapshot?.employee?.employeeName || getEmployeeFullName(row?.employee),
    officeId: row?.snapshot?.employee?.officeId || row?.employee?.officeId || "",
    cardNo: row?.snapshot?.employee?.cardNo || row?.employee?.cardNo || "",
    designation: getSnapshotName(row, "designation"),
    department: getSnapshotName(row, "department"),
    majorDepartment: getSnapshotName(row, "majorDepartment"),
    branch: getSnapshotName(row, "branch"),
    paymentMode: row.paymentMode,
    accountName: row.accountName || "",
    bankName: row.bankName || "",
    bankBranchName: row.bankBranchName || "",
    bankBranchCode: row.bankBranchCode || "",
    accountNo: row.accountNo || "",
    processBankBranchNo: row.processBankBranchNo || "",
    routingNo: row.routingNo || "",
    mobileBankingProvider: row.mobileBankingProvider || "",
    mobileBankingNo: row.mobileBankingNo || "",
    cashPayReason: row.cashPayReason || "",
    paymentInfoSource: row.paymentInfoSource,
    paymentInfoWarning: row.paymentInfoWarning || "",
    grossSalary: Number(row.grossSalary || 0),
    attendanceDeduction: Number(row.attendanceDeduction || 0),
    fixedDeduction: Number(row.fixedDeduction || 0),
    totalDeduction: Number(row.totalDeduction || 0),
    netSalary: Number(row.netSalary || 0),
    payableSalary: Number(row.payableSalary || 0),
    payableAmount: getExportPayableAmount(row),
  }));
};

const ensureRowsReadyForExport = ({ rows }: { rows: any[] }) => {
  const blockers = rows
    .filter((row) => row.status !== "locked" || !row.isLocked)
    .map((row) => ({
      employeeId:
        row?.snapshot?.employee?.employeeId || row?.employee?.employeeId || "",
      employeeName:
        row?.snapshot?.employee?.employeeName || getEmployeeFullName(row?.employee),
      reason: `Salary Payment Distribution is ${row.status} and locked=${row.isLocked}.`,
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
      `Salary Bank/Cash/Mobile sheet export blocked. Locked Salary Payment Distribution is required for every selected employee. Blockers: ${blockerPreview}${
        blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."
      }`,
    );
  }
};

const buildSalaryPaymentDistributionExportPreviewFromDB = async (
  query: TSalaryPaymentDistributionExportQuery,
) => {
  validateMonthlyQuery(query);

  if (!query.paymentMode) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Payment mode is required.");
  }

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

  const rows = await populateSalaryPaymentDistributionQuery(
    SalaryPaymentDistribution.find(filter).sort({ employee: 1 }),
  );

  if (!rows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Payment Distribution records found for selected export filters.",
    );
  }

  ensureRowsReadyForExport({ rows });

  const exportRows = buildSalaryPaymentDistributionExportRows(rows).filter(
    (row) => row.payableAmount > 0,
  );

  if (!exportRows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No payable salary rows found for selected payment mode.",
    );
  }

  const { month, year } = parsePayrollMonth(payrollMonth);

  return {
    payrollMonth,
    filters: {
      company: query.company,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      employee: query.employee || null,
      paymentMode: query.paymentMode,
    },
    summary: {
      payrollMonth,
      month,
      year,
      paymentMode: query.paymentMode,
      totalEmployees: exportRows.length,
      totalAmount: exportRows.reduce(
        (sum, row) => sum + Number(row.payableAmount || 0),
        0,
      ),
      totalGrossSalary: exportRows.reduce(
        (sum, row) => sum + Number(row.grossSalary || 0),
        0,
      ),
      totalDeduction: exportRows.reduce(
        (sum, row) => sum + Number(row.totalDeduction || 0),
        0,
      ),
      totalNetSalary: exportRows.reduce(
        (sum, row) => sum + Number(row.netSalary || 0),
        0,
      ),
      fallbackCashCount: exportRows.filter(
        (row) => row.paymentInfoSource === "fallback_cash",
      ).length,
      generatedAt: new Date().toISOString(),
    },
    readiness: {
      canExport: true,
      blockers: [],
    },
    rows: exportRows,
  };
};

const exportSalaryPaymentDistributionCsvFromDB = async (
  query: TSalaryPaymentDistributionExportQuery,
) => {
  const preview = await buildSalaryPaymentDistributionExportPreviewFromDB(query);

  return generateSalaryPaymentDistributionCsv(preview);
};

const exportSalaryPaymentDistributionExcelFromDB = async (
  query: TSalaryPaymentDistributionExportQuery,
) => {
  const preview = await buildSalaryPaymentDistributionExportPreviewFromDB(query);

  return generateSalaryPaymentDistributionExcel(preview);
};

const exportSalaryPaymentDistributionPdfFromDB = async (
  query: TSalaryPaymentDistributionExportQuery,
) => {
  const preview = await buildSalaryPaymentDistributionExportPreviewFromDB(query);

  return generateSalaryPaymentDistributionPDF(preview);
};

export const SalaryPaymentDistributionServices = {
  generateMonthlySalaryPaymentDistributionIntoDB,
  getAllSalaryPaymentDistributionsFromDB,
  getSingleSalaryPaymentDistributionFromDB,
  getSalaryPaymentDistributionOperationalSummaryFromDB,
  processSalaryPaymentDistributionIntoDB,
  approveSalaryPaymentDistributionIntoDB,
  lockSalaryPaymentDistributionIntoDB,
  unlockSalaryPaymentDistributionIntoDB,
  bulkProcessSalaryPaymentDistributionsIntoDB,
  bulkApproveSalaryPaymentDistributionsIntoDB,
  bulkLockSalaryPaymentDistributionsIntoDB,
  bulkUnlockSalaryPaymentDistributionsIntoDB,
  buildSalaryPaymentDistributionExportPreviewFromDB,
  exportSalaryPaymentDistributionCsvFromDB,
  exportSalaryPaymentDistributionExcelFromDB,
  exportSalaryPaymentDistributionPdfFromDB,
};

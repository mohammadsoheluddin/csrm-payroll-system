import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import OtPaymentDistribution from "../otPaymentDistribution/otPaymentDistribution.model";
import SalaryPaymentDistribution from "../salaryPaymentDistribution/salaryPaymentDistribution.model";
import {
  generateSalarySummaryCsv,
  generateSalarySummaryExcel,
  generateSalarySummaryPdf,
} from "./salarySummary.export";
import {
  TSalarySummaryAmountTotals,
  TSalarySummaryCombinedTotals,
  TSalarySummaryGroupBy,
  TSalarySummaryGroupRow,
  TSalarySummaryOtGroupRow,
  TSalarySummaryOtSection,
  TSalarySummaryOtTotals,
  TSalarySummaryPreview,
  TSalarySummaryQuery,
  TSalarySummarySection,
} from "./salarySummary.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const GROUP_BY_FIELDS: TSalarySummaryGroupBy[] = [
  "company",
  "majorDepartment",
  "department",
  "branch",
];

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const parsePayrollMonth = (payrollMonth: string) => {
  const [yearText, monthText] = payrollMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!month || !year || month < 1 || month > 12 || year < 2000 || year > 2100) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Payroll month must follow YYYY-MM format.",
    );
  }

  return { month, year };
};

const normalizePayrollMonthFromQuery = (query: TSalarySummaryQuery) => {
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

const assertObjectId = (value: string | undefined, fieldName: string) => {
  if (!value) {
    return;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }
};

const getGroupBy = (value: unknown): TSalarySummaryGroupBy => {
  if (typeof value === "string" && GROUP_BY_FIELDS.includes(value as TSalarySummaryGroupBy)) {
    return value as TSalarySummaryGroupBy;
  }

  return "majorDepartment";
};

const parseBooleanLike = (value: unknown) => value === true || value === "true";

const buildBaseFilter = ({
  payrollMonth,
  company,
  majorDepartment,
  department,
  branch,
  includeUnlocked,
}: {
  payrollMonth: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  includeUnlocked: boolean;
}) => {
  const filter: Record<string, unknown> = {
    payrollMonth,
    isDeleted: false,
  };

  if (!includeUnlocked) {
    filter.status = "locked";
    filter.isLocked = true;
  }

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

  return filter;
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

  const valueRecord = value as {
    _id?: Types.ObjectId | string;
    id?: string;
    toString?: () => string;
  };

  if (valueRecord._id) {
    return getObjectIdString(valueRecord._id);
  }

  if (valueRecord.id) {
    return valueRecord.id;
  }

  if (typeof valueRecord.toString === "function") {
    return valueRecord.toString();
  }

  return "";
};

const getSnapshotEntity = (row: Record<string, any>, fieldName: string) => {
  const employeeSnapshot = row.snapshot?.employee as
    | Record<string, { id?: string; name?: string } | string | null>
    | undefined;

  const snapshotValue = employeeSnapshot?.[fieldName];

  if (snapshotValue && typeof snapshotValue === "object") {
    return {
      id: snapshotValue.id || "",
      name: snapshotValue.name || "",
    };
  }

  const directValue = row[fieldName] as
    | { _id?: Types.ObjectId | string; name?: string }
    | Types.ObjectId
    | string
    | undefined;

  if (directValue && typeof directValue === "object" && !(directValue instanceof Types.ObjectId)) {
    return {
      id: getObjectIdString(directValue._id),
      name: directValue.name || "",
    };
  }

  return {
    id: getObjectIdString(directValue),
    name: "",
  };
};

const getEntitySnapshot = (
  row: Record<string, any>,
  fieldName: TSalarySummaryGroupBy,
  fallbackLabel: string,
) => {
  const entity = getSnapshotEntity(row, fieldName);
  const id = entity.id || `${fieldName}:unknown`;
  const name = entity.name || fallbackLabel;

  return { id, name };
};

const getCompanySnapshot = (row: Record<string, any>) => {
  const company = getSnapshotEntity(row, "company");

  return {
    id: company.id || "company:unknown",
    name: company.name || "Unknown Company",
  };
};

const toNumber = (value: unknown) => {
  const numericValue = Number(value || 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const roundAmount = (value: number) => Math.round(value * 100) / 100;

const getFirstNumericValue = (
  row: Record<string, any>,
  possibleKeys: string[],
) => {
  for (const key of possibleKeys) {
    const value = row[key];

    if (value !== undefined && value !== null && value !== "") {
      return toNumber(value);
    }

    const snapshotValue = row.snapshot?.salaryStatement?.[key]
      ?? row.snapshot?.salarySheet?.[key]
      ?? row.snapshot?.otStatement?.[key];

    if (snapshotValue !== undefined && snapshotValue !== null && snapshotValue !== "") {
      return toNumber(snapshotValue);
    }
  }

  return 0;
};

const getSalarySuspenseAmount = (row: Record<string, any>) => {
  const explicitSuspense = getFirstNumericValue(row, [
    "suspenseAmount",
    "suspense",
    "holdAmount",
    "withheldAmount",
  ]);

  if (explicitSuspense > 0) {
    return explicitSuspense;
  }

  const payableSalary = toNumber(row.payableSalary);
  const paidByDistribution =
    toNumber(row.bankAmount) +
    toNumber(row.mobileBankingAmount) +
    toNumber(row.cashAmount);

  return Math.max(payableSalary - paidByDistribution, 0);
};

const createEmptySalaryTotals = (): TSalarySummaryAmountTotals => ({
  employeeCount: 0,
  grossAmount: 0,
  netAmount: 0,
  bankAmount: 0,
  mobileBankingAmount: 0,
  bankAndMobileAmount: 0,
  cashAmount: 0,
  aitAmount: 0,
  loanAmount: 0,
  suspenseAmount: 0,
  totalDeduction: 0,
});

const createEmptyOtTotals = (): TSalarySummaryOtTotals => ({
  employeeCount: 0,
  grossAmount: 0,
  otAmount: 0,
  tiffinAmount: 0,
  totalPayableAmount: 0,
  bankAmount: 0,
  mobileBankingAmount: 0,
  bankAndMobileAmount: 0,
  cashAmount: 0,
});

const roundSalaryTotals = <T extends TSalarySummaryAmountTotals>(totals: T): T => {
  totals.grossAmount = roundAmount(totals.grossAmount);
  totals.netAmount = roundAmount(totals.netAmount);
  totals.bankAmount = roundAmount(totals.bankAmount);
  totals.mobileBankingAmount = roundAmount(totals.mobileBankingAmount);
  totals.bankAndMobileAmount = roundAmount(
    totals.bankAmount + totals.mobileBankingAmount,
  );
  totals.cashAmount = roundAmount(totals.cashAmount);
  totals.aitAmount = roundAmount(totals.aitAmount);
  totals.loanAmount = roundAmount(totals.loanAmount);
  totals.suspenseAmount = roundAmount(totals.suspenseAmount);
  totals.totalDeduction = roundAmount(totals.totalDeduction);

  return totals;
};

const roundOtTotals = <T extends TSalarySummaryOtTotals>(totals: T): T => {
  totals.grossAmount = roundAmount(totals.grossAmount);
  totals.otAmount = roundAmount(totals.otAmount);
  totals.tiffinAmount = roundAmount(totals.tiffinAmount);
  totals.totalPayableAmount = roundAmount(totals.totalPayableAmount);
  totals.bankAmount = roundAmount(totals.bankAmount);
  totals.mobileBankingAmount = roundAmount(totals.mobileBankingAmount);
  totals.bankAndMobileAmount = roundAmount(
    totals.bankAmount + totals.mobileBankingAmount,
  );
  totals.cashAmount = roundAmount(totals.cashAmount);

  return totals;
};

const addSalaryRowToTotals = (
  totals: TSalarySummaryAmountTotals,
  row: Record<string, any>,
) => {
  totals.employeeCount += 1;
  totals.grossAmount += toNumber(row.grossSalary);
  totals.netAmount += toNumber(row.netSalary);
  totals.bankAmount += toNumber(row.bankAmount);
  totals.mobileBankingAmount += toNumber(row.mobileBankingAmount);
  totals.cashAmount += toNumber(row.cashAmount);
  totals.aitAmount += getFirstNumericValue(row, ["aitAmount", "taxAmount", "incomeTax", "tdsAmount"]);
  totals.loanAmount += getFirstNumericValue(row, ["loanAmount", "advanceLoan", "loanDeduction"]);
  totals.suspenseAmount += getSalarySuspenseAmount(row);
  totals.totalDeduction += toNumber(row.totalDeduction);
};

const addOtRowToTotals = (
  totals: TSalarySummaryOtTotals,
  row: Record<string, any>,
) => {
  totals.employeeCount += 1;
  totals.grossAmount += toNumber(row.totalPayableAmount || row.otAmount);
  totals.otAmount += toNumber(row.otAmount);
  totals.tiffinAmount += toNumber(row.tiffinAmount);
  totals.totalPayableAmount += toNumber(row.totalPayableAmount);
  totals.bankAmount += toNumber(row.bankAmount);
  totals.mobileBankingAmount += toNumber(row.mobileBankingAmount);
  totals.cashAmount += toNumber(row.cashAmount);
};

const buildSalarySections = (
  rows: Record<string, any>[],
  groupBy: TSalarySummaryGroupBy,
): TSalarySummarySection[] => {
  const sectionMap = new Map<string, TSalarySummarySection>();

  for (const row of rows) {
    const company = getCompanySnapshot(row);
    const group = getEntitySnapshot(row, groupBy, "Unknown Group");
    const section = sectionMap.get(company.id) || {
      source: "salary_and_wages" as const,
      sectionKey: company.id,
      title: `${company.name} (Salary & Wages)`,
      companyKey: company.id,
      companyName: company.name,
      rows: [],
      grandTotal: createEmptySalaryTotals(),
    };

    let groupRow = section.rows.find((item) => item.groupKey === group.id);

    if (!groupRow) {
      groupRow = {
        groupKey: group.id,
        groupName: group.name,
        companyKey: company.id,
        companyName: company.name,
        ...createEmptySalaryTotals(),
      };
      section.rows.push(groupRow);
    }

    addSalaryRowToTotals(groupRow, row);
    addSalaryRowToTotals(section.grandTotal, row);
    sectionMap.set(company.id, section);
  }

  return Array.from(sectionMap.values())
    .map((section) => ({
      ...section,
      rows: section.rows
        .map((row) => roundSalaryTotals(row))
        .sort((a, b) => a.groupName.localeCompare(b.groupName)),
      grandTotal: roundSalaryTotals(section.grandTotal),
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
};

const buildOtSections = (
  rows: Record<string, any>[],
  groupBy: TSalarySummaryGroupBy,
): TSalarySummaryOtSection[] => {
  const sectionMap = new Map<string, TSalarySummaryOtSection>();

  for (const row of rows) {
    const company = getCompanySnapshot(row);
    const group = getEntitySnapshot(row, groupBy, "Unknown Group");
    const section = sectionMap.get(company.id) || {
      source: "ot" as const,
      sectionKey: company.id,
      title: `${company.name} (OT)`,
      companyKey: company.id,
      companyName: company.name,
      rows: [],
      grandTotal: createEmptyOtTotals(),
    };

    let groupRow = section.rows.find((item) => item.groupKey === group.id);

    if (!groupRow) {
      groupRow = {
        groupKey: group.id,
        groupName: group.name,
        companyKey: company.id,
        companyName: company.name,
        ...createEmptyOtTotals(),
      };
      section.rows.push(groupRow);
    }

    addOtRowToTotals(groupRow, row);
    addOtRowToTotals(section.grandTotal, row);
    sectionMap.set(company.id, section);
  }

  return Array.from(sectionMap.values())
    .map((section) => ({
      ...section,
      rows: section.rows
        .map((row) => roundOtTotals(row))
        .sort((a, b) => a.groupName.localeCompare(b.groupName)),
      grandTotal: roundOtTotals(section.grandTotal),
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
};

const buildSalaryGrandTotal = (
  sections: TSalarySummarySection[],
): TSalarySummaryAmountTotals => {
  const total = createEmptySalaryTotals();

  sections.forEach((section) => {
    total.employeeCount += section.grandTotal.employeeCount;
    total.grossAmount += section.grandTotal.grossAmount;
    total.netAmount += section.grandTotal.netAmount;
    total.bankAmount += section.grandTotal.bankAmount;
    total.mobileBankingAmount += section.grandTotal.mobileBankingAmount;
    total.cashAmount += section.grandTotal.cashAmount;
    total.aitAmount += section.grandTotal.aitAmount;
    total.loanAmount += section.grandTotal.loanAmount;
    total.suspenseAmount += section.grandTotal.suspenseAmount;
    total.totalDeduction += section.grandTotal.totalDeduction;
  });

  return roundSalaryTotals(total);
};

const buildOtGrandTotal = (
  sections: TSalarySummaryOtSection[],
): TSalarySummaryOtTotals => {
  const total = createEmptyOtTotals();

  sections.forEach((section) => {
    total.employeeCount += section.grandTotal.employeeCount;
    total.grossAmount += section.grandTotal.grossAmount;
    total.otAmount += section.grandTotal.otAmount;
    total.tiffinAmount += section.grandTotal.tiffinAmount;
    total.totalPayableAmount += section.grandTotal.totalPayableAmount;
    total.bankAmount += section.grandTotal.bankAmount;
    total.mobileBankingAmount += section.grandTotal.mobileBankingAmount;
    total.cashAmount += section.grandTotal.cashAmount;
  });

  return roundOtTotals(total);
};

const buildCombinedTotals = (
  salarySections: TSalarySummarySection[],
  otSections: TSalarySummaryOtSection[],
): TSalarySummaryCombinedTotals => {
  const salaryAndWages = buildSalaryGrandTotal(salarySections);
  const overtime = buildOtGrandTotal(otSections);

  return {
    salaryAndWages,
    overtime,
    groupTotal: {
      grossAmount: roundAmount(
        salaryAndWages.grossAmount + overtime.grossAmount,
      ),
      netAmount: roundAmount(salaryAndWages.netAmount + overtime.grossAmount),
      bankAmount: roundAmount(salaryAndWages.bankAmount + overtime.bankAmount),
      mobileBankingAmount: roundAmount(
        salaryAndWages.mobileBankingAmount + overtime.mobileBankingAmount,
      ),
      bankAndMobileAmount: roundAmount(
        salaryAndWages.bankAndMobileAmount + overtime.bankAndMobileAmount,
      ),
      cashAmount: roundAmount(salaryAndWages.cashAmount + overtime.cashAmount),
    },
  };
};

const buildDataSourceReadiness = (
  source: "salary_payment_distribution" | "ot_payment_distribution",
  rows: Record<string, any>[],
) => {
  const totalRecords = rows.length;
  const lockedRecords = rows.filter(
    (row) => row.status === "locked" && row.isLocked === true,
  ).length;
  const unlockedRecords = Math.max(totalRecords - lockedRecords, 0);

  return {
    source,
    totalRecords,
    lockedRecords,
    unlockedRecords,
    isGenerated: totalRecords > 0,
    isFullyLocked: totalRecords > 0 && unlockedRecords === 0,
  };
};

const buildReadiness = ({
  salaryRows,
  otRows,
  includeUnlocked,
}: {
  salaryRows: Record<string, any>[];
  otRows: Record<string, any>[];
  includeUnlocked: boolean;
}) => {
  const salaryPaymentDistribution = buildDataSourceReadiness(
    "salary_payment_distribution",
    salaryRows,
  );
  const otPaymentDistribution = buildDataSourceReadiness(
    "ot_payment_distribution",
    otRows,
  );
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!salaryPaymentDistribution.isGenerated) {
    blockers.push("Salary Payment Distribution has not been generated for this period/filter.");
  }

  if (salaryPaymentDistribution.isGenerated && !salaryPaymentDistribution.isFullyLocked) {
    blockers.push(
      `${salaryPaymentDistribution.unlockedRecords} Salary Payment Distribution record(s) are not locked.`,
    );
  }

  if (otPaymentDistribution.isGenerated && !otPaymentDistribution.isFullyLocked) {
    blockers.push(
      `${otPaymentDistribution.unlockedRecords} OT Payment Distribution record(s) are not locked.`,
    );
  }

  if (!otPaymentDistribution.isGenerated) {
    warnings.push("No OT Payment Distribution data found. Salary summary will show salary/wages only.");
  }

  if (includeUnlocked) {
    warnings.push(
      "includeUnlocked=true was used. Preview can include draft/processed/approved records; export still requires locked data.",
    );
  }

  return {
    canExport: blockers.length === 0,
    blockers,
    warnings,
    salaryPaymentDistribution,
    otPaymentDistribution,
  };
};

const validateQuery = (query: TSalarySummaryQuery) => {
  assertObjectId(query.company, "Company");
  assertObjectId(query.majorDepartment, "Major department");
  assertObjectId(query.department, "Department");
  assertObjectId(query.branch, "Branch");
};

const buildSalarySummaryPreviewFromDB = async (
  query: TSalarySummaryQuery,
): Promise<TSalarySummaryPreview> => {
  validateQuery(query);

  const payrollMonth = normalizePayrollMonthFromQuery(query);
  const { month, year } = parsePayrollMonth(payrollMonth);
  const groupBy = getGroupBy(query.groupBy);
  const includeUnlocked = parseBooleanLike(query.includeUnlocked);
  const baseFilter = buildBaseFilter({
    payrollMonth,
    company: query.company,
    majorDepartment: query.majorDepartment,
    department: query.department,
    branch: query.branch,
    includeUnlocked,
  });

  const salaryRows = await SalaryPaymentDistribution.find(baseFilter)
    .sort({ company: 1, majorDepartment: 1, department: 1, branch: 1, employee: 1 })
    .lean<Record<string, any>[]>();

  const otRows = await OtPaymentDistribution.find(baseFilter)
    .sort({ company: 1, majorDepartment: 1, department: 1, branch: 1, employee: 1 })
    .lean<Record<string, any>[]>();

  if (!salaryRows.length && !otRows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Payment Distribution or OT Payment Distribution records found for selected Salary Summary filters.",
    );
  }

  const salaryAndWagesSections = buildSalarySections(salaryRows, groupBy);
  const overtimeSections = buildOtSections(otRows, groupBy);
  const readiness = buildReadiness({ salaryRows, otRows, includeUnlocked });

  return {
    payrollMonth,
    month,
    year,
    filters: {
      company: query.company || null,
      majorDepartment: query.majorDepartment || null,
      department: query.department || null,
      branch: query.branch || null,
      groupBy,
      includeUnlocked,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      sourceNote:
        "Salary Summary is generated from Salary Payment Distribution and OT Payment Distribution records.",
      deductionBreakdownNote:
        "AIT, loan and suspense amounts are mapped from available payroll fields when present. Suspense also includes unpaid payable balance when payment split is lower than payable salary.",
      reportNote:
        "Exports are audit-ready only when selected Salary Payment Distribution records are locked and selected OT Payment Distribution records, if any, are locked.",
    },
    readiness,
    salaryAndWagesSections,
    overtimeSections,
    combinedTotals: buildCombinedTotals(salaryAndWagesSections, overtimeSections),
  };
};

const assertReadyForExport = (preview: TSalarySummaryPreview) => {
  if (preview.readiness.canExport) {
    return;
  }

  throw new AppError(
    HTTP_STATUS.CONFLICT,
    `Salary Summary export blocked. ${preview.readiness.blockers.join(" ")}`,
  );
};

const exportSalarySummaryCsvFromDB = async (query: TSalarySummaryQuery) => {
  const preview = await buildSalarySummaryPreviewFromDB({
    ...query,
    includeUnlocked: false,
  });

  assertReadyForExport(preview);

  return generateSalarySummaryCsv(preview);
};

const exportSalarySummaryExcelFromDB = async (query: TSalarySummaryQuery) => {
  const preview = await buildSalarySummaryPreviewFromDB({
    ...query,
    includeUnlocked: false,
  });

  assertReadyForExport(preview);

  return generateSalarySummaryExcel(preview);
};

const exportSalarySummaryPdfFromDB = async (query: TSalarySummaryQuery) => {
  const preview = await buildSalarySummaryPreviewFromDB({
    ...query,
    includeUnlocked: false,
  });

  assertReadyForExport(preview);

  return generateSalarySummaryPdf(preview);
};

export const SalarySummaryServices = {
  buildSalarySummaryPreviewFromDB,
  exportSalarySummaryCsvFromDB,
  exportSalarySummaryExcelFromDB,
  exportSalarySummaryPdfFromDB,
};

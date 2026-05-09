import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import type { TEmployee } from "../employee/employee.interface";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import type { TSalaryStructure } from "../salaryStructure/salaryStructure.interface";
import BonusSheet from "./bonusSheet.model";
import {
  TBonusCalculationBasis,
  TBonusSheet,
  TBonusSheetActionPayload,
  TBonusSheetBulkActionPayload,
  TBonusSheetBulkActionType,
  TBonusSheetQuery,
  TBonusSheetStatus,
  TBonusSheetSummaryQuery,
  TGenerateBonusSheetPayload,
} from "./bonusSheet.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const BONUS_RULE_VERSION = "BONUS_ENGINE_V1";

const buildBonusMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const getMonthEndDate = (month: number, year: number) => {
  return new Date(year, month, 0);
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

const getNameFromPopulatedDoc = (value: unknown) => {
  if (!value || value instanceof Types.ObjectId || typeof value === "string") {
    return "";
  }

  const record = value as {
    name?: string;
    shortName?: string;
    code?: string;
  };

  return record.name || record.shortName || record.code || "";
};

const buildEmployeeFullName = (employee: TEmployee) => {
  return [
    employee.name?.firstName,
    employee.name?.middleName,
    employee.name?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
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

const resolveBonusMonthFromQuery = (
  query: TBonusSheetQuery | TBonusSheetSummaryQuery,
) => {
  if (query.bonusMonth) {
    return query.bonusMonth;
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

    return buildBonusMonth(month, year);
  }

  return "";
};

const buildBonusSheetFilter = (
  query: TBonusSheetQuery | TBonusSheetSummaryQuery,
) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  const bonusMonth = resolveBonusMonthFromQuery(query);

  if (bonusMonth) {
    filter.bonusMonth = bonusMonth;
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

  if (query.bonusName) {
    filter.bonusName = query.bonusName;
  }

  if (query.bonusType) {
    filter.bonusType = query.bonusType;
  }

  if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if ("isLocked" in query && query.isLocked !== undefined) {
    filter.isLocked = query.isLocked === "true";
  }

  return filter;
};

const buildEmployeeFilterFromPayload = (payload: TGenerateBonusSheetPayload) => {
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

  const bonusMonth = buildBonusMonth(month, year);

  const filter: Record<string, unknown> = {
    company: new Types.ObjectId(company),
    status: "active",
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
    filter._id = new Types.ObjectId(payload.employee);
  }

  return {
    bonusMonth,
    filter,
  };
};

type TEmployeeRecord = TEmployee & {
  _id: Types.ObjectId;
};

type TSalaryStructureRecord = TSalaryStructure & {
  _id: Types.ObjectId;
};

const getActiveSalaryStructure = async (
  employeeId: Types.ObjectId,
  monthEndDate: Date,
) => {
  return SalaryStructure.findOne({
    employee: employeeId,
    isActive: true,
    isDeleted: false,
    effectiveFrom: { $lte: monthEndDate.toISOString().slice(0, 10) },
  }).sort({ effectiveFrom: -1, createdAt: -1 });
};

const calculateServiceDays = (joiningDate: string | undefined, asOfDate: Date) => {
  if (!joiningDate) {
    return 0;
  }

  const joinDate = new Date(joiningDate);

  if (Number.isNaN(joinDate.getTime())) {
    return 0;
  }

  const diffMs = asOfDate.getTime() - joinDate.getTime();

  if (diffMs < 0) {
    return 0;
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const resolveBaseAmount = ({
  calculationBasis,
  basicSalary,
  grossSalary,
  fixedAmount,
}: {
  calculationBasis: TBonusCalculationBasis;
  basicSalary: number;
  grossSalary: number;
  fixedAmount: number;
}) => {
  if (calculationBasis === "basic_salary" || calculationBasis === "percentage_of_basic") {
    return basicSalary;
  }

  if (calculationBasis === "fixed_amount") {
    return fixedAmount;
  }

  return grossSalary;
};

const calculateBonusAmount = ({
  calculationBasis,
  baseAmount,
  bonusPercentage,
  fixedAmount,
}: {
  calculationBasis: TBonusCalculationBasis;
  baseAmount: number;
  bonusPercentage: number;
  fixedAmount: number;
}) => {
  if (calculationBasis === "fixed_amount") {
    return Math.round(fixedAmount);
  }

  if (
    calculationBasis === "percentage_of_gross" ||
    calculationBasis === "percentage_of_basic"
  ) {
    return Math.round((baseAmount * bonusPercentage) / 100);
  }

  return Math.round(baseAmount);
};

const getEligibility = ({
  employee,
  serviceDays,
  minimumServiceDays,
  includeProbation,
}: {
  employee: TEmployeeRecord;
  serviceDays: number;
  minimumServiceDays: number;
  includeProbation: boolean;
}) => {
  if (!["active", "confirmed", "probation"].includes(employee.employmentStatus)) {
    return {
      isEligible: false,
      reason: `Employment status ${employee.employmentStatus} is not eligible for bonus.`,
    };
  }

  if (!includeProbation && employee.employmentStatus === "probation") {
    return {
      isEligible: false,
      reason: "Probation employee is excluded by this bonus rule.",
    };
  }

  if (serviceDays < minimumServiceDays) {
    return {
      isEligible: false,
      reason: `Minimum service requirement not met. Required ${minimumServiceDays} day(s), found ${serviceDays} day(s).`,
    };
  }

  return {
    isEligible: true,
    reason: "Eligible",
  };
};

const createEmployeeSnapshot = (employee: TEmployeeRecord) => {
  return {
    employeeDbId: getObjectIdString(employee._id),
    employeeId: employee.employeeId,
    employeeName: buildEmployeeFullName(employee),
    officeId: employee.officeId || "",
    cardNo: employee.cardNo || "",
    company: {
      id: getObjectIdString(employee.company),
      name: getNameFromPopulatedDoc(employee.company),
    },
    majorDepartment: {
      id: getObjectIdString(employee.majorDepartment),
      name: getNameFromPopulatedDoc(employee.majorDepartment),
    },
    department: {
      id: getObjectIdString(employee.department),
      name: getNameFromPopulatedDoc(employee.department),
    },
    designation: {
      id: getObjectIdString(employee.designation),
      name: getNameFromPopulatedDoc(employee.designation),
    },
    branch: {
      id: getObjectIdString(employee.branch),
      name: getNameFromPopulatedDoc(employee.branch),
    },
    serviceType: employee.serviceType,
    payType: employee.payType,
    employmentStatus: employee.employmentStatus,
    joiningDate: employee.joiningDate,
  };
};

const createBonusSheetSnapshot = ({
  employee,
  salaryStructure,
  payload,
  serviceDays,
  baseAmount,
  calculatedBonusAmount,
  payableBonusAmount,
  isEligible,
  eligibilityReason,
}: {
  employee: TEmployeeRecord;
  salaryStructure: TSalaryStructureRecord;
  payload: TGenerateBonusSheetPayload;
  serviceDays: number;
  baseAmount: number;
  calculatedBonusAmount: number;
  payableBonusAmount: number;
  isEligible: boolean;
  eligibilityReason: string;
}) => {
  return {
    employee: createEmployeeSnapshot(employee),
    salaryStructure: {
      salaryStructureId: getObjectIdString(salaryStructure._id),
      basicSalary: Number(salaryStructure.basicSalary || 0),
      grossSalary: Number(salaryStructure.grossSalary || 0),
      effectiveFrom: salaryStructure.effectiveFrom,
    },
    rule: {
      bonusName: payload.bonusName,
      bonusType: payload.bonusType,
      calculationBasis: payload.calculationBasis,
      bonusPercentage: Number(payload.bonusPercentage || 0),
      fixedAmount: Number(payload.fixedAmount || 0),
      minimumServiceDays: Number(payload.minimumServiceDays || 0),
      includeProbation: payload.includeProbation !== false,
      ruleVersion: BONUS_RULE_VERSION,
    },
    calculation: {
      serviceDays,
      baseAmount,
      calculatedBonusAmount,
      payableBonusAmount,
      isEligible,
      eligibilityReason,
    },
  };
};

const buildBonusSheetDocumentPayload = ({
  employee,
  salaryStructure,
  payload,
  bonusMonth,
  actionBy,
}: {
  employee: TEmployeeRecord;
  salaryStructure: TSalaryStructureRecord;
  payload: TGenerateBonusSheetPayload;
  bonusMonth: string;
  actionBy?: string;
}) => {
  const monthEndDate = getMonthEndDate(payload.month, payload.year);
  const basicSalary = Number(salaryStructure.basicSalary || 0);
  const grossSalary = Number(salaryStructure.grossSalary || 0);
  const fixedAmount = Number(payload.fixedAmount || 0);
  const bonusPercentage = Number(payload.bonusPercentage || 0);
  const minimumServiceDays = Number(payload.minimumServiceDays || 0);
  const includeProbation = payload.includeProbation !== false;
  const serviceDays = calculateServiceDays(employee.joiningDate, monthEndDate);
  const eligibility = getEligibility({
    employee,
    serviceDays,
    minimumServiceDays,
    includeProbation,
  });
  const baseAmount = resolveBaseAmount({
    calculationBasis: payload.calculationBasis,
    basicSalary,
    grossSalary,
    fixedAmount,
  });
  const calculatedBonusAmount = calculateBonusAmount({
    calculationBasis: payload.calculationBasis,
    baseAmount,
    bonusPercentage,
    fixedAmount,
  });
  const payableBonusAmount = eligibility.isEligible ? calculatedBonusAmount : 0;

  return {
    employee: employee._id,
    company: employee.company,
    majorDepartment: employee.majorDepartment,
    department: employee.department,
    designation: employee.designation,
    branch: employee.branch,
    bonusMonth,
    month: payload.month,
    year: payload.year,
    bonusName: payload.bonusName,
    bonusType: payload.bonusType,
    calculationBasis: payload.calculationBasis,
    bonusPercentage,
    fixedAmount,
    minimumServiceDays,
    includeProbation,
    salaryStructure: salaryStructure._id,
    basicSalary,
    grossSalary,
    serviceDays,
    baseAmount,
    calculatedBonusAmount,
    payableBonusAmount,
    isEligible: eligibility.isEligible,
    eligibilityReason: eligibility.reason,
    status: "draft" as TBonusSheetStatus,
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
    snapshot: createBonusSheetSnapshot({
      employee,
      salaryStructure,
      payload,
      serviceDays,
      baseAmount,
      calculatedBonusAmount,
      payableBonusAmount,
      isEligible: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
    }),
    remarks: payload.remarks || "",
    isDeleted: false,
  };
};

const buildResultItem = (record: any) => {
  return {
    bonusSheetId: record._id,
    employeeId: record.snapshot?.employee?.employeeId || "",
    employeeName: record.snapshot?.employee?.employeeName || "",
    bonusMonth: record.bonusMonth,
    bonusName: record.bonusName,
    bonusType: record.bonusType,
    calculationBasis: record.calculationBasis,
    grossSalary: record.grossSalary,
    basicSalary: record.basicSalary,
    calculatedBonusAmount: record.calculatedBonusAmount,
    payableBonusAmount: record.payableBonusAmount,
    isEligible: record.isEligible,
    eligibilityReason: record.eligibilityReason,
    status: record.status,
    isLocked: record.isLocked,
  };
};

const generateMonthlyBonusSheetIntoDB = async (
  payload: TGenerateBonusSheetPayload,
  actionBy?: string,
) => {
  const { bonusMonth, filter } = buildEmployeeFilterFromPayload(payload);
  const monthEndDate = getMonthEndDate(payload.month, payload.year);

  const employees = await Employee.find(filter)
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ employeeId: 1, createdAt: 1 });

  if (!employees.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No active employees found for Bonus Sheet generation.",
    );
  }

  const generatedBonusSheets = [];
  const regeneratedBonusSheets = [];
  const skippedEmployees = [];

  for (const employee of employees as TEmployeeRecord[]) {
    const employeeId = employee.employeeId;
    const employeeName = buildEmployeeFullName(employee);

    const salaryStructure = await getActiveSalaryStructure(
      employee._id,
      monthEndDate,
    );

    if (!salaryStructure) {
      skippedEmployees.push({
        employeeId,
        employeeName,
        reason: "Active salary structure not found for selected bonus month.",
      });
      continue;
    }

    const existingBonusSheet = await BonusSheet.findOne({
      employee: employee._id,
      bonusMonth,
      bonusName: payload.bonusName,
      isDeleted: false,
    });

    if (existingBonusSheet && !payload.overwrite) {
      skippedEmployees.push({
        employeeId,
        employeeName,
        reason: "Bonus Sheet already exists.",
      });
      continue;
    }

    if (existingBonusSheet?.isLocked) {
      skippedEmployees.push({
        employeeId,
        employeeName,
        reason: "Locked Bonus Sheet cannot be overwritten.",
      });
      continue;
    }

    const documentPayload = buildBonusSheetDocumentPayload({
      employee,
      salaryStructure: salaryStructure as TSalaryStructureRecord,
      payload,
      bonusMonth,
      actionBy,
    });

    if (existingBonusSheet && payload.overwrite) {
      const previousStatus = existingBonusSheet.status;
      existingBonusSheet.set({
        ...documentPayload,
        auditLogs: [
          ...existingBonusSheet.auditLogs,
          {
            action: "regenerated",
            fromStatus: previousStatus,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note:
              payload.remarks ||
              `Bonus Sheet regenerated for ${payload.bonusName} ${bonusMonth}`,
          },
        ],
      });

      await existingBonusSheet.save();
      regeneratedBonusSheets.push(buildResultItem(existingBonusSheet));
      continue;
    }

    const bonusSheet = await BonusSheet.create({
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
            `Bonus Sheet generated for ${payload.bonusName} ${bonusMonth}`,
        },
      ],
    });

    generatedBonusSheets.push(buildResultItem(bonusSheet));
  }

  const allGeneratedItems = [...generatedBonusSheets, ...regeneratedBonusSheets];

  const totals = allGeneratedItems.reduce(
    (acc, item) => {
      acc.totalGrossSalary += Number(item.grossSalary || 0);
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
      totalGrossSalary: 0,
      totalCalculatedBonus: 0,
      totalPayableBonus: 0,
      totalEligible: 0,
      totalIneligible: 0,
    },
  );

  return {
    bonusMonth,
    bonusName: payload.bonusName,
    bonusType: payload.bonusType,
    calculationBasis: payload.calculationBasis,
    filters: {
      company: payload.company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    employeeReadiness: {
      totalEmployeesFound: employees.length,
      totalEmployeesWithGeneratedBonus: allGeneratedItems.length,
      totalEmployeesSkipped: skippedEmployees.length,
    },
    totalGenerated: generatedBonusSheets.length,
    totalRegenerated: regeneratedBonusSheets.length,
    totalSkipped: skippedEmployees.length,
    totals,
    generatedBonusSheets,
    regeneratedBonusSheets,
    skippedEmployees,
  };
};

const getAllBonusSheetsFromDB = async (query: TBonusSheetQuery) => {
  const filter = buildBonusSheetFilter(query);

  return BonusSheet.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salaryStructure")
    .sort({ bonusMonth: -1, bonusName: 1, "snapshot.employee.employeeId": 1 });
};

const getSingleBonusSheetFromDB = async (id: string) => {
  assertObjectId(id, "Bonus Sheet id");

  const result = await BonusSheet.findOne({ _id: id, isDeleted: false })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("salaryStructure");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Bonus Sheet not found.");
  }

  return result;
};

const getBonusSheetOperationalSummaryFromDB = async (
  query: TBonusSheetSummaryQuery,
) => {
  const filter = buildBonusSheetFilter(query);
  const bonusMonth = resolveBonusMonthFromQuery(query);

  if (!bonusMonth) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either bonusMonth or both month and year are required.",
    );
  }

  const bonusSheets = await BonusSheet.find(filter).lean<TBonusSheet[]>();

  const statusSummary: Record<TBonusSheetStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = bonusSheets.reduce(
    (acc, item) => {
      statusSummary[item.status] += 1;

      if (item.isLocked) {
        lockSummary.locked += 1;
      } else {
        lockSummary.unlocked += 1;
      }

      acc.totalGrossSalary += Number(item.grossSalary || 0);
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
      totalGrossSalary: 0,
      totalCalculatedBonus: 0,
      totalPayableBonus: 0,
      totalEligible: 0,
      totalIneligible: 0,
    },
  );

  const blockers: string[] = [];
  const totalRecords = bonusSheets.length;

  if (!totalRecords) {
    blockers.push("Bonus Sheet has not been generated for the selected filters.");
  }

  if (totalRecords && statusSummary.draft > 0) {
    blockers.push(`${statusSummary.draft} Bonus Sheet record(s) still in draft.`);
  }

  if (totalRecords && statusSummary.processed > 0) {
    blockers.push(
      `${statusSummary.processed} Bonus Sheet record(s) processed but not approved.`,
    );
  }

  if (totalRecords && statusSummary.approved > 0) {
    blockers.push(
      `${statusSummary.approved} Bonus Sheet record(s) approved but not locked.`,
    );
  }

  const isGenerated = totalRecords > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0;
  const isFullyLocked = isGenerated && statusSummary.locked === totalRecords;

  let nextRequiredAction = "generate_bonus_sheet";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_bonus_sheet";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_bonus_sheet";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_bonus_sheet";
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
      canProcessBonusStatement: isFullyLocked,
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

const buildBonusSheetBulkActionFilter = (
  payload: TBonusSheetBulkActionPayload,
) => {
  if (!payload.company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  assertObjectId(payload.company, "Company");
  assertObjectId(payload.majorDepartment, "Major department");
  assertObjectId(payload.department, "Department");
  assertObjectId(payload.branch, "Branch");
  assertObjectId(payload.employee, "Employee");

  let bonusMonth = payload.bonusMonth;

  if (!bonusMonth) {
    if (!payload.month || !payload.year) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Either bonusMonth or both month and year are required.",
      );
    }

    bonusMonth = buildBonusMonth(payload.month, payload.year);
  }

  const filter: Record<string, unknown> = {
    bonusMonth,
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

  if (payload.bonusName) {
    filter.bonusName = payload.bonusName;
  }

  if (payload.bonusType) {
    filter.bonusType = payload.bonusType;
  }

  return {
    bonusMonth,
    filter,
  };
};

const buildBonusSheetStatusSummary = (records: TBonusSheet[]) => {
  const statusSummary: Record<TBonusSheetStatus, number> = {
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

const getBonusSheetBulkActionConfig = (action: TBonusSheetBulkActionType) => {
  const config: Record<
    TBonusSheetBulkActionType,
    {
      auditAction: "processed" | "approved" | "locked" | "unlocked";
      allowedStatus: TBonusSheetStatus;
      targetStatus: TBonusSheetStatus;
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

const isBonusSheetEligibleForBulkAction = (
  record: TBonusSheet,
  action: TBonusSheetBulkActionType,
) => {
  const config = getBonusSheetBulkActionConfig(action);

  if (action === "unlock") {
    return record.status === "locked" && record.isLocked;
  }

  if (record.isLocked) {
    return false;
  }

  return record.status === config.allowedStatus;
};

const buildBonusSheetBulkSkippedReason = (
  record: TBonusSheet,
  action: TBonusSheetBulkActionType,
) => {
  if (action !== "unlock" && record.isLocked) {
    return "Record is locked.";
  }

  if (action === "unlock") {
    return "Only locked Bonus Sheet records can be unlocked.";
  }

  const config = getBonusSheetBulkActionConfig(action);
  return `Only ${config.allowedStatus} Bonus Sheet records can be ${config.description.toLowerCase()}.`;
};

const buildBonusSheetBulkUpdatePayload = ({
  record,
  action,
  actionBy,
  note,
}: {
  record: TBonusSheet;
  action: TBonusSheetBulkActionType;
  actionBy?: string;
  note?: string;
}): Partial<TBonusSheet> => {
  const config = getBonusSheetBulkActionConfig(action);
  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  const updatePayload: Partial<TBonusSheet> = {
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
        note: note || `${config.description} for ${record.bonusMonth}.`,
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
      sourceModule: "bonus_sheet",
      sealedBy: userObjectId,
      note: note || "Bonus Sheet locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlock") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
    updatePayload.immutableSeal = null;
  }

  return updatePayload;
};

const buildBonusSheetBulkResultItem = (record: any) => {
  return {
    id: getObjectIdString(record._id),
    employee: getObjectIdString(record.employee),
    employeeId: record.snapshot?.employee?.employeeId || "",
    employeeName: record.snapshot?.employee?.employeeName || "",
    bonusMonth: record.bonusMonth,
    bonusName: record.bonusName,
    bonusType: record.bonusType,
    status: record.status,
    isLocked: record.isLocked,
    grossSalary: record.grossSalary,
    basicSalary: record.basicSalary,
    calculatedBonusAmount: record.calculatedBonusAmount,
    payableBonusAmount: record.payableBonusAmount,
    isEligible: record.isEligible,
  };
};

const bulkChangeBonusSheetStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TBonusSheetBulkActionType;
  payload: TBonusSheetBulkActionPayload;
  actionBy?: string;
}) => {
  const { bonusMonth, filter } = buildBonusSheetBulkActionFilter(payload);
  const records = await BonusSheet.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Bonus Sheet records found for the selected month and filters.",
    );
  }

  const statusSummaryBefore = buildBonusSheetStatusSummary(
    records as TBonusSheet[],
  );

  if (action === "lock" && payload.strict !== false) {
    const blockers = records.filter(
      (record) => record.status !== "approved" || record.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Bonus payment readiness lock rejected. ${blockers.length} Bonus Sheet record(s) are not ready for lock. Process and approve every selected Bonus Sheet first, or pass strict=false for partial lock.`,
      );
    }
  }

  const processedRecords = [];
  const skippedRecords = [];

  for (const record of records) {
    if (!isBonusSheetEligibleForBulkAction(record as TBonusSheet, action)) {
      skippedRecords.push({
        ...buildBonusSheetBulkResultItem(record),
        reason: buildBonusSheetBulkSkippedReason(record as TBonusSheet, action),
      });
      continue;
    }

    const updatedRecord = await BonusSheet.findOneAndUpdate(
      {
        _id: record._id,
        isDeleted: false,
      },
      buildBonusSheetBulkUpdatePayload({
        record: record as TBonusSheet,
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
      .populate("salaryStructure");

    if (updatedRecord) {
      processedRecords.push(updatedRecord);
    }
  }

  const refreshedRecords = await BonusSheet.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  const refreshedStatusSummary = buildBonusSheetStatusSummary(
    refreshedRecords as TBonusSheet[],
  );
  const totalLocked = refreshedRecords.filter((record) => record.isLocked).length;
  const isFullyLocked =
    refreshedRecords.length > 0 && totalLocked === refreshedRecords.length;

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
    bonusPaymentReadiness: {
      canProcessBonusStatement: isFullyLocked,
      canProcessBonusPaymentDistribution: isFullyLocked,
      canProcessBonusBankSheet: isFullyLocked,
      canProcessBonusCashSheet: isFullyLocked,
      canProcessBonusMobileBankingSheet: isFullyLocked,
      totalRecords: refreshedRecords.length,
      totalLocked,
      blockers: isFullyLocked
        ? []
        : [
            "All selected Bonus Sheet records must be locked before Bonus Statement or Bonus Payment Distribution processing.",
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
  payload?: TBonusSheetActionPayload;
  actionBy?: string;
  expectedStatus: TBonusSheetStatus;
  nextStatus: TBonusSheetStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Bonus Sheet id");

  const bonusSheet = await BonusSheet.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!bonusSheet) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Bonus Sheet not found.");
  }

  if (action !== "unlocked" && bonusSheet.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked Bonus Sheet cannot be changed.",
    );
  }

  if (bonusSheet.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Bonus Sheet must be ${expectedStatus} before it can be ${action}. Current status is ${bonusSheet.status}.`,
    );
  }

  const previousStatus = bonusSheet.status;
  bonusSheet.status = nextStatus;

  if (action === "processed") {
    bonusSheet.processedBy = buildActionBy(actionBy);
    bonusSheet.processedAt = new Date();
  }

  if (action === "approved") {
    bonusSheet.approvedBy = buildActionBy(actionBy);
    bonusSheet.approvedAt = new Date();
  }

  if (action === "locked") {
    bonusSheet.isLocked = true;
    bonusSheet.lockedBy = buildActionBy(actionBy);
    bonusSheet.lockedAt = new Date();
    bonusSheet.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: bonusSheet as unknown as Record<string, unknown>,
      sourceModule: "bonus_sheet",
      sealedBy: buildActionBy(actionBy),
      note: payload?.note || "Bonus Sheet locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlocked") {
    bonusSheet.isLocked = false;
    bonusSheet.lockedBy = null;
    bonusSheet.lockedAt = null;
    bonusSheet.immutableSeal = null;
  }

  bonusSheet.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: buildActionBy(actionBy),
    actionAt: new Date(),
    note: payload?.note || "",
  });

  await bonusSheet.save();

  return bonusSheet;
};

const processBonusSheetIntoDB = async (
  id: string,
  payload?: TBonusSheetActionPayload,
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

const approveBonusSheetIntoDB = async (
  id: string,
  payload?: TBonusSheetActionPayload,
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

const lockBonusSheetIntoDB = async (
  id: string,
  payload?: TBonusSheetActionPayload,
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

const unlockBonusSheetIntoDB = async (
  id: string,
  payload?: TBonusSheetActionPayload,
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

const bulkProcessBonusSheetsIntoDB = async (
  payload: TBonusSheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusSheetStatusIntoDB({ action: "process", payload, actionBy });
};

const bulkApproveBonusSheetsIntoDB = async (
  payload: TBonusSheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusSheetStatusIntoDB({ action: "approve", payload, actionBy });
};

const bulkLockBonusSheetsIntoDB = async (
  payload: TBonusSheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusSheetStatusIntoDB({ action: "lock", payload, actionBy });
};

const bulkUnlockBonusSheetsIntoDB = async (
  payload: TBonusSheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeBonusSheetStatusIntoDB({ action: "unlock", payload, actionBy });
};

export const BonusSheetServices = {
  generateMonthlyBonusSheetIntoDB,
  getAllBonusSheetsFromDB,
  getSingleBonusSheetFromDB,
  getBonusSheetOperationalSummaryFromDB,
  processBonusSheetIntoDB,
  approveBonusSheetIntoDB,
  lockBonusSheetIntoDB,
  unlockBonusSheetIntoDB,
  bulkProcessBonusSheetsIntoDB,
  bulkApproveBonusSheetsIntoDB,
  bulkLockBonusSheetsIntoDB,
  bulkUnlockBonusSheetsIntoDB,
};

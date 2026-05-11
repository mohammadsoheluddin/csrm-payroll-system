import { Types } from "mongoose";
import { buildPayrollImmutableSealFromRecord } from "../../utils/payrollImmutableSeal";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import type { TAttendanceFinalization } from "../attendanceFinalization/attendanceFinalization.interface";
import Employee from "../employee/employee.model";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import SalarySheet from "./salarySheet.model";
import {
  TGenerateSalarySheetPayload,
  TSalarySheet,
  TSalarySheetActionPayload,
  TSalarySheetBulkActionPayload,
  TSalarySheetBulkActionType,
  TSalarySheetQuery,
  TSalarySheetStatus,
  TSalarySheetSummaryQuery,
} from "./salarySheet.interface";

import { createFinancialRecordSoftDeleteHandlers } from "../../common/financialRecordSoftDelete";
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const SALARY_SHEET_RULE_VERSION = "SALARY_SHEET_V1";

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
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

const roundCurrency = (value: number) => {
  return Math.round(value);
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
  query: TSalarySheetQuery | TSalarySheetSummaryQuery,
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

const buildEmployeeFilter = ({
  company,
  majorDepartment,
  department,
  branch,
  employee,
  periodEndDate,
}: {
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  periodEndDate: string;
}) => {
  const filter: Record<string, unknown> = {
    company: new Types.ObjectId(company),
    status: "active",
    isDeleted: false,
    employmentStatus: {
      $nin: ["resigned", "terminated", "retired", "suspended"],
    },
    joiningDate: {
      $lte: periodEndDate,
    },
  };

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
    filter._id = new Types.ObjectId(employee);
  }

  return filter;
};

const buildSalarySheetFilter = (
  query: TSalarySheetQuery | TSalarySheetSummaryQuery,
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

type TAttendanceFinalizationRecord = TAttendanceFinalization & {
  _id: Types.ObjectId;
};

const buildLockedAttendanceFinalizationMap = async ({
  employees,
  company,
  payrollMonth,
}: {
  employees: any[];
  company: string;
  payrollMonth: string;
}) => {
  const employeeIds = employees.map((employee) => employee._id);

  const finalizations = await AttendanceFinalization.find({
    employee: { $in: employeeIds },
    company: new Types.ObjectId(company),
    payrollMonth,
    isDeleted: false,
  })
    .sort({ "employeeSnapshot.employeeId": 1 })
    .lean<TAttendanceFinalizationRecord[]>();

  const finalizationByEmployee = new Map<string, TAttendanceFinalizationRecord>();

  for (const finalization of finalizations) {
    finalizationByEmployee.set(
      getObjectIdString(finalization.employee),
      finalization,
    );
  }

  const blockers: Array<{
    employeeId: string;
    employeeName: string;
    reason: string;
  }> = [];

  for (const employee of employees) {
    const employeeKey = getObjectIdString(employee._id);
    const finalization = finalizationByEmployee.get(employeeKey);

    if (!finalization) {
      blockers.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Locked attendance finalization not found.",
      });
      continue;
    }

    if (finalization.status !== "locked" || !finalization.isLocked) {
      blockers.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: `Attendance finalization is ${finalization.status} and locked=${finalization.isLocked}.`,
      });
    }
  }

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
      `Salary Sheet generation blocked. Locked attendance finalization is required for every selected employee before salary sheet processing. Blockers: ${blockerPreview}${
        blockers.length > 10 ? `; and ${blockers.length - 10} more.` : "."
      }`,
    );
  }

  return {
    finalizationByEmployee,
    readiness: {
      totalEmployees: employees.length,
      totalFinalizationsFound: finalizations.length,
      totalLockedFinalizations: finalizations.filter(
        (finalization) =>
          finalization.status === "locked" && finalization.isLocked,
      ).length,
      totalPayableDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalPayableDays || 0),
        0,
      ),
      totalDeductionDays: finalizations.reduce(
        (sum, finalization) =>
          sum + Number(finalization.totalDeductionDays || 0),
        0,
      ),
      totalAbsentDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalAbsentDays || 0),
        0,
      ),
    },
  };
};

const calculateSalarySheetValues = ({
  salaryStructure,
  attendanceFinalization,
}: {
  salaryStructure: any;
  attendanceFinalization: TAttendanceFinalizationRecord;
}) => {
  const basicSalary = Number(salaryStructure?.basicSalary || 0);
  const houseRent = Number(salaryStructure?.houseRent || 0);
  const medicalAllowance = Number(salaryStructure?.medicalAllowance || 0);
  const transportAllowance = Number(salaryStructure?.transportAllowance || 0);
  const otherAllowance = Number(salaryStructure?.otherAllowance || 0);
  const grossSalary = Number(
    salaryStructure?.grossSalary ||
      basicSalary +
        houseRent +
        medicalAllowance +
        transportAllowance +
        otherAllowance,
  );

  const taxDeduction = Number(salaryStructure?.taxDeduction || 0);
  const providentFund = Number(salaryStructure?.providentFund || 0);
  const loanDeduction = Number(salaryStructure?.loanDeduction || 0);
  const otherDeduction = Number(salaryStructure?.otherDeduction || 0);
  const fixedDeduction =
    taxDeduction + providentFund + loanDeduction + otherDeduction;

  const perDaySalary = grossSalary / 30;
  const attendanceDeduction = roundCurrency(
    perDaySalary * Number(attendanceFinalization.totalDeductionDays || 0),
  );
  const totalDeduction = fixedDeduction + attendanceDeduction;
  const netSalary = grossSalary - totalDeduction;
  const payableSalary = Math.max(netSalary, 0);

  return {
    basicSalary,
    houseRent,
    medicalAllowance,
    transportAllowance,
    otherAllowance,
    grossSalary,
    taxDeduction,
    providentFund,
    loanDeduction,
    otherDeduction,
    fixedDeduction,
    perDaySalary,
    attendanceDeduction,
    totalDeduction,
    netSalary,
    payableSalary,
  };
};

const createSalarySheetSnapshot = ({
  employee,
  salaryStructure,
  attendanceFinalization,
  calculatedValues,
}: {
  employee: any;
  salaryStructure: any;
  attendanceFinalization: TAttendanceFinalizationRecord;
  calculatedValues: ReturnType<typeof calculateSalarySheetValues>;
}) => {
  return {
    employee: {
      employeeDbId: getObjectIdString(employee?._id),
      employeeId: employee?.employeeId || "",
      employeeName: getEmployeeFullName(employee),
      officeId: employee?.officeId || "",
      cardNo: employee?.cardNo || "",
      company: getIdNameSnapshot(employee?.company),
      majorDepartment: getIdNameSnapshot(employee?.majorDepartment),
      department: getIdNameSnapshot(employee?.department),
      designation: getIdNameSnapshot(employee?.designation),
      branch: getIdNameSnapshot(employee?.branch),
      serviceType: employee?.serviceType || "",
      payType: employee?.payType || "",
      employmentStatus: employee?.employmentStatus || "",
      joiningDate: employee?.joiningDate || "",
      dutyHourPerDay: Number(employee?.dutyHourPerDay || 0),
    },
    attendance: {
      attendanceFinalizationId: getObjectIdString(attendanceFinalization._id),
      payrollMonth: attendanceFinalization.payrollMonth,
      status: attendanceFinalization.status,
      isLocked: attendanceFinalization.isLocked,
      periodStartDate: attendanceFinalization.periodStartDate,
      periodEndDate: attendanceFinalization.periodEndDate,
      totalCalendarDays: Number(attendanceFinalization.totalCalendarDays || 0),
      totalDutyDays: Number(attendanceFinalization.totalDutyDays || 0),
      totalPayableDays: Number(attendanceFinalization.totalPayableDays || 0),
      totalDeductionDays: Number(attendanceFinalization.totalDeductionDays || 0),
      totalAbsentDays: Number(attendanceFinalization.totalAbsentDays || 0),
      totalPaidLeaveDays: Number(attendanceFinalization.totalPaidLeaveDays || 0),
      totalUnpaidLeaveDays: Number(attendanceFinalization.totalUnpaidLeaveDays || 0),
      totalLeaveDays: Number(attendanceFinalization.totalLeaveDays || 0),
      generatedRuleVersion:
        attendanceFinalization.sourceSummary?.generatedRuleVersion || "",
    },
    salaryStructure: {
      salaryStructureId: getObjectIdString(salaryStructure?._id),
      basicSalary: calculatedValues.basicSalary,
      houseRent: calculatedValues.houseRent,
      medicalAllowance: calculatedValues.medicalAllowance,
      transportAllowance: calculatedValues.transportAllowance,
      otherAllowance: calculatedValues.otherAllowance,
      grossSalary: calculatedValues.grossSalary,
      taxDeduction: calculatedValues.taxDeduction,
      providentFund: calculatedValues.providentFund,
      loanDeduction: calculatedValues.loanDeduction,
      otherDeduction: calculatedValues.otherDeduction,
      fixedDeduction: calculatedValues.fixedDeduction,
      effectiveFrom: salaryStructure?.effectiveFrom || "",
    },
    calculation: {
      perDaySalary: calculatedValues.perDaySalary,
      attendanceDeduction: calculatedValues.attendanceDeduction,
      totalDeduction: calculatedValues.totalDeduction,
      netSalary: calculatedValues.netSalary,
      payableSalary: calculatedValues.payableSalary,
      calculationRuleVersion: SALARY_SHEET_RULE_VERSION,
    },
  };
};

const buildSalarySheetDocumentPayload = ({
  employee,
  salaryStructure,
  attendanceFinalization,
  month,
  year,
  payrollMonth,
  periodStartDate,
  periodEndDate,
  calculatedValues,
  snapshot,
  actionBy,
  remarks,
}: {
  employee: any;
  salaryStructure: any;
  attendanceFinalization: TAttendanceFinalizationRecord;
  month: number;
  year: number;
  payrollMonth: string;
  periodStartDate: string;
  periodEndDate: string;
  calculatedValues: ReturnType<typeof calculateSalarySheetValues>;
  snapshot: ReturnType<typeof createSalarySheetSnapshot>;
  actionBy?: string;
  remarks?: string;
}) => {
  return {
    employee: employee._id,
    company: employee.company?._id || employee.company,
    majorDepartment: employee.majorDepartment?._id || employee.majorDepartment,
    department: employee.department?._id || employee.department,
    designation: employee.designation?._id || employee.designation,
    branch: employee.branch?._id || employee.branch,
    payrollMonth,
    month,
    year,
    periodStartDate,
    periodEndDate,
    attendanceFinalization: attendanceFinalization._id,
    salaryStructure: salaryStructure._id,
    basicSalary: calculatedValues.basicSalary,
    houseRent: calculatedValues.houseRent,
    medicalAllowance: calculatedValues.medicalAllowance,
    transportAllowance: calculatedValues.transportAllowance,
    otherAllowance: calculatedValues.otherAllowance,
    grossSalary: calculatedValues.grossSalary,
    taxDeduction: calculatedValues.taxDeduction,
    providentFund: calculatedValues.providentFund,
    loanDeduction: calculatedValues.loanDeduction,
    otherDeduction: calculatedValues.otherDeduction,
    fixedDeduction: calculatedValues.fixedDeduction,
    perDaySalary: calculatedValues.perDaySalary,
    attendanceDeduction: calculatedValues.attendanceDeduction,
    totalDeduction: calculatedValues.totalDeduction,
    netSalary: calculatedValues.netSalary,
    payableSalary: calculatedValues.payableSalary,
    totalCalendarDays: Number(attendanceFinalization.totalCalendarDays || 0),
    totalDutyDays: Number(attendanceFinalization.totalDutyDays || 0),
    totalPayableDays: Number(attendanceFinalization.totalPayableDays || 0),
    totalDeductionDays: Number(attendanceFinalization.totalDeductionDays || 0),
    totalAbsentDays: Number(attendanceFinalization.totalAbsentDays || 0),
    totalPaidLeaveDays: Number(attendanceFinalization.totalPaidLeaveDays || 0),
    totalUnpaidLeaveDays: Number(attendanceFinalization.totalUnpaidLeaveDays || 0),
    totalLeaveDays: Number(attendanceFinalization.totalLeaveDays || 0),
    status: "draft" as TSalarySheetStatus,
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

const getActiveSalaryStructure = async (employeeId: Types.ObjectId, periodEndDate: string) => {
  return SalaryStructure.findOne({
    employee: employeeId,
    isActive: true,
    isDeleted: false,
    effectiveFrom: { $lte: periodEndDate },
  }).sort({ effectiveFrom: -1, createdAt: -1 });
};

const generateMonthlySalarySheetIntoDB = async (
  payload: TGenerateSalarySheetPayload,
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

  const employees = await Employee.find(
    buildEmployeeFilter({
      company,
      majorDepartment: payload.majorDepartment,
      department: payload.department,
      branch: payload.branch,
      employee: payload.employee,
      periodEndDate,
    }),
  )
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ employeeId: 1 });

  if (!employees.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No active employee found for Salary Sheet generation.",
    );
  }

  const { finalizationByEmployee, readiness } =
    await buildLockedAttendanceFinalizationMap({
      employees,
      company,
      payrollMonth,
    });

  const generatedSalarySheets = [];
  const regeneratedSalarySheets = [];
  const skippedEmployees = [];

  for (const employee of employees) {
    const existingSalarySheet = await SalarySheet.findOne({
      employee: employee._id,
      payrollMonth,
      isDeleted: false,
    });

    if (existingSalarySheet && !payload.overwrite) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Salary Sheet already exists.",
      });
      continue;
    }

    if (existingSalarySheet?.isLocked) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Locked Salary Sheet cannot be overwritten.",
      });
      continue;
    }

    const salaryStructure = await getActiveSalaryStructure(
      employee._id,
      periodEndDate,
    );

    if (!salaryStructure) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Active salary structure not found for selected month.",
      });
      continue;
    }

    const attendanceFinalization = finalizationByEmployee.get(
      getObjectIdString(employee._id),
    );

    if (!attendanceFinalization) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Locked attendance finalization not found.",
      });
      continue;
    }

    const calculatedValues = calculateSalarySheetValues({
      salaryStructure,
      attendanceFinalization,
    });

    const snapshot = createSalarySheetSnapshot({
      employee,
      salaryStructure,
      attendanceFinalization,
      calculatedValues,
    });

    const documentPayload = buildSalarySheetDocumentPayload({
      employee,
      salaryStructure,
      attendanceFinalization,
      month,
      year,
      payrollMonth,
      periodStartDate,
      periodEndDate,
      calculatedValues,
      snapshot,
      actionBy,
      remarks: payload.remarks,
    });

    if (existingSalarySheet && payload.overwrite) {
      const previousStatus = existingSalarySheet.status;
      existingSalarySheet.set({
        ...documentPayload,
        auditLogs: [
          ...existingSalarySheet.auditLogs,
          {
            action: "regenerated",
            fromStatus: previousStatus,
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note: payload.remarks || `Salary Sheet regenerated for ${payrollMonth}`,
          },
        ],
      });

      await existingSalarySheet.save();

      regeneratedSalarySheets.push({
        salarySheetId: existingSalarySheet._id,
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        payrollMonth,
        grossSalary: existingSalarySheet.grossSalary,
        attendanceDeduction: existingSalarySheet.attendanceDeduction,
        payableSalary: existingSalarySheet.payableSalary,
        status: existingSalarySheet.status,
      });

      continue;
    }

    const salarySheet = await SalarySheet.create({
      ...documentPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note: payload.remarks || `Salary Sheet generated for ${payrollMonth}`,
        },
      ],
    });

    generatedSalarySheets.push({
      salarySheetId: salarySheet._id,
      employeeId: employee.employeeId,
      employeeName: getEmployeeFullName(employee),
      payrollMonth,
      grossSalary: salarySheet.grossSalary,
      attendanceDeduction: salarySheet.attendanceDeduction,
      payableSalary: salarySheet.payableSalary,
      attendanceFinalizationId: getObjectIdString(salarySheet.attendanceFinalization),
      status: salarySheet.status,
    });
  }

  const totals = [...generatedSalarySheets, ...regeneratedSalarySheets].reduce(
    (acc, item) => {
      acc.grossSalary += Number(item.grossSalary || 0);
      acc.attendanceDeduction += Number(item.attendanceDeduction || 0);
      acc.payableSalary += Number(item.payableSalary || 0);
      return acc;
    },
    { grossSalary: 0, attendanceDeduction: 0, payableSalary: 0 },
  );

  return {
    payrollMonth,
    filters: {
      company,
      majorDepartment: payload.majorDepartment || null,
      department: payload.department || null,
      branch: payload.branch || null,
      employee: payload.employee || null,
    },
    totalEmployees: employees.length,
    totalGenerated: generatedSalarySheets.length,
    totalRegenerated: regeneratedSalarySheets.length,
    totalSkipped: skippedEmployees.length,
    attendanceFinalizationReadiness: readiness,
    totals,
    generatedSalarySheets,
    regeneratedSalarySheets,
    skippedEmployees,
  };
};

const getAllSalarySheetsFromDB = async (query: TSalarySheetQuery) => {
  const filter = buildSalarySheetFilter(query);

  return SalarySheet.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .sort({ payrollMonth: -1, "snapshot.employee.employeeId": 1 });
};

const getSingleSalarySheetFromDB = async (id: string) => {
  assertObjectId(id, "Salary Sheet id");

  const result = await SalarySheet.findOne({ _id: id, isDeleted: false })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Salary Sheet not found.");
  }

  return result;
};

const getSalarySheetOperationalSummaryFromDB = async (
  query: TSalarySheetSummaryQuery,
) => {
  const filter = buildSalarySheetFilter(query);
  const payrollMonth = resolvePayrollMonthFromQuery(query);

  if (!payrollMonth) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  const salarySheets = await SalarySheet.find(filter).lean<TSalarySheet[]>();

  const statusSummary = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = salarySheets.reduce(
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
      acc.totalPayableDays += Number(item.totalPayableDays || 0);
      acc.totalDeductionDays += Number(item.totalDeductionDays || 0);
      return acc;
    },
    {
      totalGrossSalary: 0,
      totalFixedDeduction: 0,
      totalAttendanceDeduction: 0,
      totalDeduction: 0,
      totalNetSalary: 0,
      totalPayableSalary: 0,
      totalPayableDays: 0,
      totalDeductionDays: 0,
    },
  );

  const blockers: string[] = [];
  const totalRecords = salarySheets.length;

  if (!totalRecords) {
    blockers.push("Salary Sheet has not been generated for the selected filters.");
  }

  if (totalRecords && statusSummary.draft > 0) {
    blockers.push(`${statusSummary.draft} Salary Sheet record(s) still in draft.`);
  }

  if (totalRecords && statusSummary.processed > 0) {
    blockers.push(
      `${statusSummary.processed} Salary Sheet record(s) processed but not approved.`,
    );
  }

  if (totalRecords && statusSummary.approved > 0) {
    blockers.push(
      `${statusSummary.approved} Salary Sheet record(s) approved but not locked.`,
    );
  }

  const isGenerated = totalRecords > 0;
  const isFullyProcessed = isGenerated && statusSummary.draft === 0;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0;
  const isFullyLocked = isGenerated && statusSummary.locked === totalRecords;

  let nextRequiredAction = "generate_salary_sheet";

  if (isGenerated && !isFullyProcessed) {
    nextRequiredAction = "process_salary_sheet";
  } else if (isFullyProcessed && !isFullyApproved) {
    nextRequiredAction = "approve_salary_sheet";
  } else if (isFullyApproved && !isFullyLocked) {
    nextRequiredAction = "lock_salary_sheet";
  } else if (isFullyLocked) {
    nextRequiredAction = "ready_for_salary_statement";
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
      canProcessSalaryStatement: isFullyLocked,
      canProcessSalaryPaymentDistribution: isFullyLocked,
      canProcessBankSheet: isFullyLocked,
      canProcessCashSheet: isFullyLocked,
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


const buildSalarySheetBulkActionFilter = (
  payload: TSalarySheetBulkActionPayload,
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

const buildSalarySheetStatusSummary = (records: TSalarySheet[]) => {
  const statusSummary: Record<TSalarySheetStatus, number> = {
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

const getSalarySheetBulkActionConfig = (
  action: TSalarySheetBulkActionType,
) => {
  const config: Record<
    TSalarySheetBulkActionType,
    {
      auditAction: "processed" | "approved" | "locked" | "unlocked";
      allowedStatus: TSalarySheetStatus;
      targetStatus: TSalarySheetStatus;
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

const isSalarySheetEligibleForBulkAction = (
  record: TSalarySheet,
  action: TSalarySheetBulkActionType,
) => {
  const config = getSalarySheetBulkActionConfig(action);

  if (action === "unlock") {
    return record.status === "locked" && record.isLocked;
  }

  if (record.isLocked) {
    return false;
  }

  return record.status === config.allowedStatus;
};

const buildSalarySheetBulkSkippedReason = (
  record: TSalarySheet,
  action: TSalarySheetBulkActionType,
) => {
  if (action !== "unlock" && record.isLocked) {
    return "Record is locked.";
  }

  if (action === "unlock") {
    return "Only locked Salary Sheet records can be unlocked.";
  }

  const config = getSalarySheetBulkActionConfig(action);
  return `Only ${config.allowedStatus} Salary Sheet records can be ${config.description.toLowerCase()}.`;
};

const buildSalarySheetBulkUpdatePayload = ({
  record,
  action,
  actionBy,
  note,
}: {
  record: TSalarySheet;
  action: TSalarySheetBulkActionType;
  actionBy?: string;
  note?: string;
}): Partial<TSalarySheet> => {
  const config = getSalarySheetBulkActionConfig(action);
  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  const updatePayload: Partial<TSalarySheet> = {
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
      sourceModule: "salary_sheet",
      sealedBy: userObjectId,
      note: note || "Salary Sheet locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlock") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
    updatePayload.immutableSeal = null;
  }

  return updatePayload;
};

const buildSalarySheetBulkResultItem = (record: any) => {
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
    payableSalary: record.payableSalary,
  };
};

const bulkChangeSalarySheetStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TSalarySheetBulkActionType;
  payload: TSalarySheetBulkActionPayload;
  actionBy?: string;
}) => {
  const { payrollMonth, filter } = buildSalarySheetBulkActionFilter(payload);
  const records = await SalarySheet.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Salary Sheet records found for the selected month and filters.",
    );
  }

  const statusSummaryBefore = buildSalarySheetStatusSummary(
    records as TSalarySheet[],
  );

  if (action === "lock" && payload.strict !== false) {
    const blockers = records.filter(
      (record) => record.status !== "approved" || record.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `Salary Statement readiness lock rejected. ${blockers.length} Salary Sheet record(s) are not ready for lock. Process and approve every selected Salary Sheet first, or pass strict=false for partial lock.`,
      );
    }
  }

  const processedRecords = [];
  const skippedRecords = [];

  for (const record of records) {
    if (!isSalarySheetEligibleForBulkAction(record as TSalarySheet, action)) {
      skippedRecords.push({
        ...buildSalarySheetBulkResultItem(record),
        reason: buildSalarySheetBulkSkippedReason(
          record as TSalarySheet,
          action,
        ),
      });
      continue;
    }

    const updatedRecord = await SalarySheet.findOneAndUpdate(
      {
        _id: record._id,
        isDeleted: false,
      },
      buildSalarySheetBulkUpdatePayload({
        record: record as TSalarySheet,
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
      .populate("attendanceFinalization")
      .populate("salaryStructure");

    if (updatedRecord) {
      processedRecords.push(updatedRecord);
    }
  }

  const refreshedRecords = await SalarySheet.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  const refreshedStatusSummary = buildSalarySheetStatusSummary(
    refreshedRecords as TSalarySheet[],
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
    salaryStatementReadiness: {
      canProcessSalaryStatement: isFullyLocked,
      canProcessSalaryPaymentDistribution: isFullyLocked,
      canProcessBankSheet: isFullyLocked,
      canProcessCashSheet: isFullyLocked,
      canProcessMobileBankingSheet: isFullyLocked,
      totalRecords: refreshedRecords.length,
      totalLocked,
      blockers: isFullyLocked
        ? []
        : [
            "All selected Salary Sheet records must be locked before Salary Statement processing.",
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
  payload?: TSalarySheetActionPayload;
  actionBy?: string;
  expectedStatus: TSalarySheetStatus;
  nextStatus: TSalarySheetStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Salary Sheet id");

  const salarySheet = await SalarySheet.findOne({ _id: id, isDeleted: false });

  if (!salarySheet) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Salary Sheet not found.");
  }

  if (action !== "unlocked" && salarySheet.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked Salary Sheet cannot be changed.",
    );
  }

  if (salarySheet.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Salary Sheet must be ${expectedStatus} before it can be ${action}. Current status is ${salarySheet.status}.`,
    );
  }

  const previousStatus = salarySheet.status;
  salarySheet.status = nextStatus;

  if (action === "processed") {
    salarySheet.processedBy = buildActionBy(actionBy);
    salarySheet.processedAt = new Date();
  }

  if (action === "approved") {
    salarySheet.approvedBy = buildActionBy(actionBy);
    salarySheet.approvedAt = new Date();
  }

  if (action === "locked") {
    salarySheet.isLocked = true;
    salarySheet.lockedBy = buildActionBy(actionBy);
    salarySheet.lockedAt = new Date();
    salarySheet.immutableSeal = buildPayrollImmutableSealFromRecord({
      record: salarySheet as unknown as Record<string, unknown>,
      sourceModule: "salary_sheet",
      sealedBy: buildActionBy(actionBy),
      note: payload?.note || "Salary Sheet locked and immutable snapshot sealed.",
    });
  }

  if (action === "unlocked") {
    salarySheet.isLocked = false;
    salarySheet.lockedBy = null;
    salarySheet.lockedAt = null;
    salarySheet.immutableSeal = null;
  }

  salarySheet.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: buildActionBy(actionBy),
    actionAt: new Date(),
    note: payload?.note || "",
  });

  await salarySheet.save();

  return salarySheet;
};

const processSalarySheetIntoDB = async (
  id: string,
  payload?: TSalarySheetActionPayload,
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

const approveSalarySheetIntoDB = async (
  id: string,
  payload?: TSalarySheetActionPayload,
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

const lockSalarySheetIntoDB = async (
  id: string,
  payload?: TSalarySheetActionPayload,
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

const unlockSalarySheetIntoDB = async (
  id: string,
  payload?: TSalarySheetActionPayload,
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


const bulkProcessSalarySheetsIntoDB = async (
  payload: TSalarySheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalarySheetStatusIntoDB({
    action: "process",
    payload,
    actionBy,
  });
};

const bulkApproveSalarySheetsIntoDB = async (
  payload: TSalarySheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalarySheetStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockSalarySheetsIntoDB = async (
  payload: TSalarySheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalarySheetStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockSalarySheetsIntoDB = async (
  payload: TSalarySheetBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeSalarySheetStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};


const {
  getDeletedRecordsFromDB: getDeletedSalarySheetsFromDB,
  softDeleteRecordFromDB: softDeleteSalarySheetFromDB,
  restoreRecordIntoDB: restoreSalarySheetIntoDB,
} = createFinancialRecordSoftDeleteHandlers({
  model: SalarySheet,
  recordName: "Salary Sheet",
  queryFields: ['employee', 'company', 'payrollMonth', 'status'],
  restoreUniqueFields: ['employee', 'payrollMonth'],
});

export const SalarySheetServices = {
  generateMonthlySalarySheetIntoDB,
  getAllSalarySheetsFromDB,
  getSingleSalarySheetFromDB,
  getSalarySheetOperationalSummaryFromDB,
  processSalarySheetIntoDB,
  approveSalarySheetIntoDB,
  lockSalarySheetIntoDB,
  unlockSalarySheetIntoDB,
  bulkProcessSalarySheetsIntoDB,
  bulkApproveSalarySheetsIntoDB,
  bulkLockSalarySheetsIntoDB,
  bulkUnlockSalarySheetsIntoDB,

  getDeletedSalarySheetsFromDB,
  softDeleteSalarySheetFromDB,
  restoreSalarySheetIntoDB,
};

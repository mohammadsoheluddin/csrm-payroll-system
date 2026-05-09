import { Model, Types } from "mongoose";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import Employee from "../employee/employee.model";
import OtPaymentDistribution from "../otPaymentDistribution/otPaymentDistribution.model";
import OtStatement from "../otStatement/otStatement.model";
import SalaryPaymentDistribution from "../salaryPaymentDistribution/salaryPaymentDistribution.model";
import SalarySheet from "../salarySheet/salarySheet.model";
import SalaryStatement from "../salaryStatement/salaryStatement.model";
import TimeBill from "../timeBill/timeBill.model";
import {
  TMonthEndProcessChecklistItem,
  TMonthEndProcessControlQuery,
  TMonthEndProcessStageKey,
  TMonthEndProcessStageSummary,
  TMonthEndProcessStatusSummary,
} from "./monthEndProcessControl.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
};

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

  return {
    month,
    year,
  };
};

const validateMonthYear = (month: number, year: number) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Month must be an integer between 1 and 12.",
    );
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Year must be an integer between 2000 and 2100.",
    );
  }
};

const toObjectId = (value: string, fieldName: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `${fieldName} is invalid.`);
  }

  return new Types.ObjectId(value);
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const getPayrollMonthFromQuery = (query: TMonthEndProcessControlQuery) => {
  if (query.payrollMonth) {
    const parsed = parsePayrollMonth(query.payrollMonth);

    return {
      payrollMonth: query.payrollMonth,
      month: parsed.month,
      year: parsed.year,
    };
  }

  if (!query.month || !query.year) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Either payrollMonth or both month and year are required.",
    );
  }

  const month = Number(query.month);
  const year = Number(query.year);
  validateMonthYear(month, year);

  return {
    payrollMonth: buildPayrollMonth(month, year),
    month,
    year,
  };
};

const buildCommonFilter = (query: TMonthEndProcessControlQuery) => {
  const { payrollMonth, month, year } = getPayrollMonthFromQuery(query);
  const companyId = toObjectId(query.company, "Company id");

  const filter: Record<string, unknown> = {
    payrollMonth,
    company: companyId,
    isDeleted: false,
  };

  if (query.majorDepartment) {
    filter.majorDepartment = toObjectId(query.majorDepartment, "Major department id");
  }

  if (query.department) {
    filter.department = toObjectId(query.department, "Department id");
  }

  if (query.branch) {
    filter.branch = toObjectId(query.branch, "Branch id");
  }

  if (query.employee) {
    filter.employee = toObjectId(query.employee, "Employee id");
  }

  return {
    payrollMonth,
    month,
    year,
    filter,
  };
};

const buildExpectedEmployeeFilter = (
  query: TMonthEndProcessControlQuery,
  periodEndDate: string,
) => {
  const employeeFilter: Record<string, unknown> = {
    company: toObjectId(query.company, "Company id"),
    status: "active",
    isDeleted: false,
    joiningDate: {
      $lte: periodEndDate,
    },
    employmentStatus: {
      $nin: ["resigned", "terminated", "retired", "suspended"],
    },
  };

  if (query.majorDepartment) {
    employeeFilter.majorDepartment = toObjectId(
      query.majorDepartment,
      "Major department id",
    );
  }

  if (query.department) {
    employeeFilter.department = toObjectId(query.department, "Department id");
  }

  if (query.branch) {
    employeeFilter.branch = toObjectId(query.branch, "Branch id");
  }

  if (query.employee) {
    employeeFilter._id = toObjectId(query.employee, "Employee id");
  }

  return employeeFilter;
};

const getMonthEndDate = (month: number, year: number) => {
  const endDate = new Date(Date.UTC(year, month, 0));

  return endDate.toISOString().slice(0, 10);
};

const buildStatusSummary = <TRecord extends { status?: string }>(
  records: TRecord[],
): TMonthEndProcessStatusSummary => {
  const summary: TMonthEndProcessStatusSummary = {};

  for (const record of records) {
    const status = record.status || "unknown";
    summary[status] = (summary[status] || 0) + 1;
  }

  return summary;
};

const buildLockSummary = <TRecord extends { isLocked?: boolean }>(
  records: TRecord[],
) => {
  let locked = 0;
  let unlocked = 0;

  for (const record of records) {
    if (record.isLocked) {
      locked += 1;
    } else {
      unlocked += 1;
    }
  }

  return {
    locked,
    unlocked,
  };
};

const createNumericTotals = <TRecord extends Record<string, unknown>>(
  records: TRecord[],
  fields: string[],
) => {
  const totals: Record<string, number> = {};

  for (const field of fields) {
    totals[field] = 0;
  }

  for (const record of records) {
    for (const field of fields) {
      totals[field] += Number(record[field] || 0);
    }
  }

  for (const field of fields) {
    totals[field] = roundToTwoDecimals(totals[field]);
  }

  return totals;
};

type TStageConfig = {
  key: TMonthEndProcessStageKey;
  name: string;
  modulePath: string;
  sequence: number;
  model: Model<any>;
  sourceStage?: TMonthEndProcessStageKey;
  sourceReady?: boolean;
  expectedEmployeeCount: number;
  numericFields: string[];
};

const buildStageSummary = async ({
  key,
  name,
  modulePath,
  sequence,
  model,
  sourceReady = true,
  expectedEmployeeCount,
  numericFields,
  filter,
}: TStageConfig & { filter: Record<string, unknown> }): Promise<TMonthEndProcessStageSummary> => {
  const records = await model.find(filter).lean<Record<string, unknown>[]>();
  const totalRecords = records.length;
  const lockSummary = buildLockSummary(records);
  const statusSummary = buildStatusSummary(records);
  const missingRecordCount = Math.max(expectedEmployeeCount - totalRecords, 0);
  const isGenerated = totalRecords > 0;
  const isFullyLocked = totalRecords > 0 && lockSummary.locked === totalRecords;
  const blockers: string[] = [];

  if (!sourceReady) {
    blockers.push("Required upstream source stage is not fully locked.");
  }

  if (!isGenerated) {
    blockers.push(`${name} has not been generated for this selection.`);
  }

  if (missingRecordCount > 0) {
    blockers.push(
      `${missingRecordCount} expected employee record(s) are missing in ${name}.`,
    );
  }

  if (totalRecords > 0 && !isFullyLocked) {
    blockers.push(
      `${lockSummary.unlocked} ${name} record(s) are not locked yet.`,
    );
  }

  return {
    key,
    name,
    modulePath,
    sequence,
    totalRecords,
    expectedEmployeeCount,
    missingRecordCount,
    statusSummary,
    lockSummary,
    isGenerated,
    isFullyLocked,
    canUseAsSource: isFullyLocked,
    blockers,
    totals: createNumericTotals(records, numericFields),
  };
};

const getStageBlocker = (stage: TMonthEndProcessStageSummary) => {
  return stage.blockers[0] || `${stage.name} is not ready.`;
};

const buildSalaryFlowReadiness = (
  attendanceFinalization: TMonthEndProcessStageSummary,
  salarySheet: TMonthEndProcessStageSummary,
  salaryStatement: TMonthEndProcessStageSummary,
  salaryPaymentDistribution: TMonthEndProcessStageSummary,
) => {
  const canGenerateSalarySheet = attendanceFinalization.isFullyLocked;
  const canGenerateSalaryStatement = salarySheet.isFullyLocked;
  const canGenerateSalaryPaymentDistribution = salaryStatement.isFullyLocked;
  const canExportSalarySheets = salaryPaymentDistribution.isFullyLocked;
  const blockers: string[] = [];
  let nextRequiredAction = "salary_flow_complete";

  if (!attendanceFinalization.isFullyLocked) {
    blockers.push(getStageBlocker(attendanceFinalization));
    nextRequiredAction = "complete_attendance_finalization";
  } else if (!salarySheet.isGenerated) {
    blockers.push("Salary Sheet has not been generated yet.");
    nextRequiredAction = "generate_salary_sheet";
  } else if (!salarySheet.isFullyLocked) {
    blockers.push(getStageBlocker(salarySheet));
    nextRequiredAction = "complete_salary_sheet";
  } else if (!salaryStatement.isGenerated) {
    blockers.push("Salary Statement has not been generated yet.");
    nextRequiredAction = "generate_salary_statement";
  } else if (!salaryStatement.isFullyLocked) {
    blockers.push(getStageBlocker(salaryStatement));
    nextRequiredAction = "complete_salary_statement";
  } else if (!salaryPaymentDistribution.isGenerated) {
    blockers.push("Salary Payment Distribution has not been generated yet.");
    nextRequiredAction = "generate_salary_payment_distribution";
  } else if (!salaryPaymentDistribution.isFullyLocked) {
    blockers.push(getStageBlocker(salaryPaymentDistribution));
    nextRequiredAction = "complete_salary_payment_distribution";
  }

  return {
    canGenerateSalarySheet,
    canGenerateSalaryStatement,
    canGenerateSalaryPaymentDistribution,
    canExportSalaryBankSheet: canExportSalarySheets,
    canExportSalaryCashSheet: canExportSalarySheets,
    canExportSalaryMobileBankingSheet: canExportSalarySheets,
    isSalaryFlowComplete: canExportSalarySheets,
    nextRequiredAction,
    blockers,
  };
};

const buildOtFlowReadiness = (
  attendanceFinalization: TMonthEndProcessStageSummary,
  timeBill: TMonthEndProcessStageSummary,
  otStatement: TMonthEndProcessStageSummary,
  otPaymentDistribution: TMonthEndProcessStageSummary,
) => {
  const canGenerateTimeBill = attendanceFinalization.isFullyLocked;
  const canGenerateOtStatement = timeBill.isFullyLocked;
  const canGenerateOtPaymentDistribution = otStatement.isFullyLocked;
  const canExportOtSheets = otPaymentDistribution.isFullyLocked;
  const blockers: string[] = [];
  let nextRequiredAction = "ot_flow_complete";

  if (!attendanceFinalization.isFullyLocked) {
    blockers.push(getStageBlocker(attendanceFinalization));
    nextRequiredAction = "complete_attendance_finalization";
  } else if (!timeBill.isGenerated) {
    blockers.push("Time Bill has not been generated yet.");
    nextRequiredAction = "generate_time_bill";
  } else if (!timeBill.isFullyLocked) {
    blockers.push(getStageBlocker(timeBill));
    nextRequiredAction = "complete_time_bill";
  } else if (!otStatement.isGenerated) {
    blockers.push("OT Statement has not been generated yet.");
    nextRequiredAction = "generate_ot_statement";
  } else if (!otStatement.isFullyLocked) {
    blockers.push(getStageBlocker(otStatement));
    nextRequiredAction = "complete_ot_statement";
  } else if (!otPaymentDistribution.isGenerated) {
    blockers.push("OT Payment Distribution has not been generated yet.");
    nextRequiredAction = "generate_ot_payment_distribution";
  } else if (!otPaymentDistribution.isFullyLocked) {
    blockers.push(getStageBlocker(otPaymentDistribution));
    nextRequiredAction = "complete_ot_payment_distribution";
  }

  return {
    canGenerateTimeBill,
    canGenerateOtStatement,
    canGenerateOtPaymentDistribution,
    canExportOtBankSheet: canExportOtSheets,
    canExportOtCashSheet: canExportOtSheets,
    canExportOtMobileBankingSheet: canExportOtSheets,
    isOtFlowComplete: canExportOtSheets,
    nextRequiredAction,
    blockers,
  };
};

const buildChecklist = (stages: Record<TMonthEndProcessStageKey, TMonthEndProcessStageSummary>) => {
  const attendanceFinalization = stages.attendance_finalization;
  const salarySheet = stages.salary_sheet;
  const salaryStatement = stages.salary_statement;
  const salaryPaymentDistribution = stages.salary_payment_distribution;
  const timeBill = stages.time_bill;
  const otStatement = stages.ot_statement;
  const otPaymentDistribution = stages.ot_payment_distribution;
  const items: TMonthEndProcessChecklistItem[] = [
    {
      sequence: 1,
      flow: "overall",
      key: "attendance_finalization_locked",
      title: "Attendance Finalization generated, approved and locked",
      isComplete: attendanceFinalization.isFullyLocked,
      isBlocked: false,
      blocker: attendanceFinalization.blockers[0],
      targetModulePath: attendanceFinalization.modulePath,
    },
    {
      sequence: 2,
      flow: "salary",
      key: "salary_sheet_locked",
      title: "Salary Sheet generated, approved and locked",
      isComplete: salarySheet.isFullyLocked,
      isBlocked: !attendanceFinalization.isFullyLocked,
      blocker: !attendanceFinalization.isFullyLocked
        ? "Locked Attendance Finalization is required first."
        : salarySheet.blockers[0],
      sourceStage: "attendance_finalization",
      targetModulePath: salarySheet.modulePath,
    },
    {
      sequence: 3,
      flow: "salary",
      key: "salary_statement_locked",
      title: "Salary Statement generated, approved and locked",
      isComplete: salaryStatement.isFullyLocked,
      isBlocked: !salarySheet.isFullyLocked,
      blocker: !salarySheet.isFullyLocked
        ? "Locked Salary Sheet is required first."
        : salaryStatement.blockers[0],
      sourceStage: "salary_sheet",
      targetModulePath: salaryStatement.modulePath,
    },
    {
      sequence: 4,
      flow: "salary",
      key: "salary_payment_distribution_locked",
      title: "Salary Payment Distribution generated, approved and locked",
      isComplete: salaryPaymentDistribution.isFullyLocked,
      isBlocked: !salaryStatement.isFullyLocked,
      blocker: !salaryStatement.isFullyLocked
        ? "Locked Salary Statement is required first."
        : salaryPaymentDistribution.blockers[0],
      sourceStage: "salary_statement",
      targetModulePath: salaryPaymentDistribution.modulePath,
    },
    {
      sequence: 5,
      flow: "ot",
      key: "time_bill_locked",
      title: "Time Bill generated, approved and locked",
      isComplete: timeBill.isFullyLocked,
      isBlocked: !attendanceFinalization.isFullyLocked,
      blocker: !attendanceFinalization.isFullyLocked
        ? "Locked Attendance Finalization is required first."
        : timeBill.blockers[0],
      sourceStage: "attendance_finalization",
      targetModulePath: timeBill.modulePath,
    },
    {
      sequence: 6,
      flow: "ot",
      key: "ot_statement_locked",
      title: "OT Statement generated, approved and locked",
      isComplete: otStatement.isFullyLocked,
      isBlocked: !timeBill.isFullyLocked,
      blocker: !timeBill.isFullyLocked
        ? "Locked Time Bill is required first."
        : otStatement.blockers[0],
      sourceStage: "time_bill",
      targetModulePath: otStatement.modulePath,
    },
    {
      sequence: 7,
      flow: "ot",
      key: "ot_payment_distribution_locked",
      title: "OT Payment Distribution generated, approved and locked",
      isComplete: otPaymentDistribution.isFullyLocked,
      isBlocked: !otStatement.isFullyLocked,
      blocker: !otStatement.isFullyLocked
        ? "Locked OT Statement is required first."
        : otPaymentDistribution.blockers[0],
      sourceStage: "ot_statement",
      targetModulePath: otPaymentDistribution.modulePath,
    },
  ];

  return items;
};

const getMonthEndProcessControlStatusFromDB = async (
  query: TMonthEndProcessControlQuery,
) => {
  const { payrollMonth, month, year, filter } = buildCommonFilter(query);
  const expectedEmployeeCount = await Employee.countDocuments(
    buildExpectedEmployeeFilter(query, getMonthEndDate(month, year)),
  );

  const attendanceFinalization = await buildStageSummary({
    key: "attendance_finalization",
    name: "Attendance Finalization",
    modulePath: "/api/v1/attendance-finalizations",
    sequence: 1,
    model: AttendanceFinalization,
    expectedEmployeeCount,
    numericFields: [
      "totalPresentDays",
      "totalAbsentDays",
      "totalLeaveDays",
      "totalPaidLeaveDays",
      "totalUnpaidLeaveDays",
      "totalDutyDays",
      "totalPayableDays",
      "totalDeductionDays",
      "totalOtHours",
      "totalTiffinDays",
      "totalHolidayDutyDays",
    ],
    filter,
  });

  const salarySheet = await buildStageSummary({
    key: "salary_sheet",
    name: "Salary Sheet",
    modulePath: "/api/v1/salary-sheets",
    sequence: 2,
    model: SalarySheet,
    sourceReady: attendanceFinalization.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "grossSalary",
      "attendanceDeduction",
      "fixedDeduction",
      "totalDeduction",
      "netSalary",
      "payableSalary",
    ],
    filter,
  });

  const salaryStatement = await buildStageSummary({
    key: "salary_statement",
    name: "Salary Statement",
    modulePath: "/api/v1/salary-statements",
    sequence: 3,
    model: SalaryStatement,
    sourceReady: salarySheet.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "grossSalary",
      "attendanceDeduction",
      "fixedDeduction",
      "totalDeduction",
      "netSalary",
      "payableSalary",
    ],
    filter,
  });

  const salaryPaymentDistribution = await buildStageSummary({
    key: "salary_payment_distribution",
    name: "Salary Payment Distribution",
    modulePath: "/api/v1/salary-payment-distributions",
    sequence: 4,
    model: SalaryPaymentDistribution,
    sourceReady: salaryStatement.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "grossSalary",
      "netSalary",
      "payableSalary",
      "bankAmount",
      "cashAmount",
      "mobileBankingAmount",
    ],
    filter,
  });

  const timeBill = await buildStageSummary({
    key: "time_bill",
    name: "Time Bill",
    modulePath: "/api/v1/time-bills",
    sequence: 5,
    model: TimeBill,
    sourceReady: attendanceFinalization.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "grossSalary",
      "otHours",
      "otAmount",
      "tiffinDays",
      "tiffinAmount",
      "totalPayableAmount",
      "totalDutyDays",
      "totalPayableDays",
    ],
    filter,
  });

  const otStatement = await buildStageSummary({
    key: "ot_statement",
    name: "OT Statement",
    modulePath: "/api/v1/ot-statements",
    sequence: 6,
    model: OtStatement,
    sourceReady: timeBill.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "grossSalary",
      "otHours",
      "otAmount",
      "tiffinDays",
      "tiffinAmount",
      "totalPayableAmount",
    ],
    filter,
  });

  const otPaymentDistribution = await buildStageSummary({
    key: "ot_payment_distribution",
    name: "OT Payment Distribution",
    modulePath: "/api/v1/ot-payment-distributions",
    sequence: 7,
    model: OtPaymentDistribution,
    sourceReady: otStatement.isFullyLocked,
    expectedEmployeeCount,
    numericFields: [
      "totalPayableAmount",
      "otAmount",
      "tiffinAmount",
      "bankAmount",
      "cashAmount",
      "mobileBankingAmount",
    ],
    filter,
  });

  const stages = {
    attendance_finalization: attendanceFinalization,
    salary_sheet: salarySheet,
    salary_statement: salaryStatement,
    salary_payment_distribution: salaryPaymentDistribution,
    time_bill: timeBill,
    ot_statement: otStatement,
    ot_payment_distribution: otPaymentDistribution,
  };

  const salary = buildSalaryFlowReadiness(
    attendanceFinalization,
    salarySheet,
    salaryStatement,
    salaryPaymentDistribution,
  );

  const ot = buildOtFlowReadiness(
    attendanceFinalization,
    timeBill,
    otStatement,
    otPaymentDistribution,
  );

  const overallBlockers = [...salary.blockers, ...ot.blockers].filter(
    (blocker, index, blockers) => blockers.indexOf(blocker) === index,
  );

  const overall = {
    isAttendanceReady: attendanceFinalization.isFullyLocked,
    isSalaryFlowComplete: salary.isSalaryFlowComplete,
    isOtFlowComplete: ot.isOtFlowComplete,
    isMonthEndComplete: salary.isSalaryFlowComplete && ot.isOtFlowComplete,
    nextRequiredAction: !attendanceFinalization.isFullyLocked
      ? "complete_attendance_finalization"
      : !salary.isSalaryFlowComplete
        ? salary.nextRequiredAction
        : !ot.isOtFlowComplete
          ? ot.nextRequiredAction
          : "month_end_ready_for_final_exports_and_closing",
    blockers: overallBlockers,
  };

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
    expectedEmployeeCount,
    stages,
    flows: {
      salary,
      ot,
      overall,
    },
    checklist: buildChecklist(stages),
    generatedAt: new Date(),
  };
};

const getMonthEndProcessChecklistFromDB = async (
  query: TMonthEndProcessControlQuery,
) => {
  const status = await getMonthEndProcessControlStatusFromDB(query);

  return {
    payrollMonth: status.payrollMonth,
    month: status.month,
    year: status.year,
    filters: status.filters,
    expectedEmployeeCount: status.expectedEmployeeCount,
    overall: status.flows.overall,
    salary: status.flows.salary,
    ot: status.flows.ot,
    checklist: status.checklist,
    generatedAt: status.generatedAt,
  };
};

export const MonthEndProcessControlServices = {
  getMonthEndProcessControlStatusFromDB,
  getMonthEndProcessChecklistFromDB,
};

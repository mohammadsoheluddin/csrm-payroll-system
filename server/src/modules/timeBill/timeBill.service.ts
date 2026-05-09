import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import type { TAttendanceFinalization } from "../attendanceFinalization/attendanceFinalization.interface";
import Employee from "../employee/employee.model";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import TimeBill from "./timeBill.model";
import {
  TGenerateTimeBillPayload,
  TTimeBill,
  TTimeBillActionPayload,
  TTimeBillBulkActionPayload,
  TTimeBillBulkActionType,
  TTimeBillQuery,
  TTimeBillStatus,
  TTimeBillSummaryQuery,
} from "./timeBill.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

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

const buildTimeBillFilter = (query: TTimeBillQuery | TTimeBillSummaryQuery) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.payrollMonth) {
    filter.payrollMonth = query.payrollMonth;
  } else if (query.month && query.year) {
    const month = Number(query.month);
    const year = Number(query.year);

    if (!month || !year) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, "Valid month and year are required.");
    }

    filter.payrollMonth = buildPayrollMonth(month, year);
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

const calculateTimeBillValues = ({
  salaryStructure,
  attendanceFinalization,
  employee,
  tiffinRate,
}: {
  salaryStructure: any;
  attendanceFinalization: TAttendanceFinalizationRecord;
  employee: any;
  tiffinRate: number;
}) => {
  const grossSalary = Number(salaryStructure?.grossSalary || 0);
  const dutyHourPerDay = Number(
    attendanceFinalization.employeeSnapshot?.dutyHourPerDay ||
      employee?.dutyHourPerDay ||
      0,
  );
  const otHours = Number(attendanceFinalization.totalOtHours || 0);
  const tiffinDays = Number(attendanceFinalization.totalTiffinDays || 0);
  const otRate = dutyHourPerDay > 0 ? grossSalary / 30 / dutyHourPerDay : 0;
  const otAmount = roundCurrency(otHours * otRate);
  const tiffinAmount = roundCurrency(tiffinDays * tiffinRate);
  const totalPayableAmount = otAmount + tiffinAmount;

  return {
    grossSalary,
    dutyHourPerDay,
    otHours,
    otRate,
    otAmount,
    tiffinDays,
    tiffinRate,
    tiffinAmount,
    totalPayableAmount,
  };
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
    employee: {
      $in: employeeIds,
    },
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
      `Time Bill generation blocked. Locked attendance finalization is required for every selected employee before OT and tiffin processing. Blockers: ${blockerPreview}${
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
        (finalization) => finalization.status === "locked" && finalization.isLocked,
      ).length,
      totalOtHours: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalOtHours || 0),
        0,
      ),
      totalTiffinDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalTiffinDays || 0),
        0,
      ),
      totalDutyDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalDutyDays || 0),
        0,
      ),
    },
  };
};

const createTimeBillSnapshot = ({
  employee,
  salaryStructure,
  attendanceFinalization,
  calculatedValues,
}: {
  employee: any;
  salaryStructure: any;
  attendanceFinalization: TAttendanceFinalizationRecord;
  calculatedValues: ReturnType<typeof calculateTimeBillValues>;
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
      totalDutyDays: attendanceFinalization.totalDutyDays,
      totalPayableDays: attendanceFinalization.totalPayableDays,
      totalOtHours: attendanceFinalization.totalOtHours,
      totalTiffinDays: attendanceFinalization.totalTiffinDays,
      totalHolidayDutyDays: attendanceFinalization.totalHolidayDutyDays,
      generatedRuleVersion:
        attendanceFinalization.sourceSummary?.generatedRuleVersion || "",
    },
    salary: {
      salaryStructureId: getObjectIdString(salaryStructure?._id),
      grossSalary: calculatedValues.grossSalary,
      dutyHourPerDay: calculatedValues.dutyHourPerDay,
      otRate: calculatedValues.otRate,
      tiffinRate: calculatedValues.tiffinRate,
    },
  };
};

const buildTimeBillDocumentPayload = ({
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
  calculatedValues: ReturnType<typeof calculateTimeBillValues>;
  snapshot: ReturnType<typeof createTimeBillSnapshot>;
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
    grossSalary: calculatedValues.grossSalary,
    dutyHourPerDay: calculatedValues.dutyHourPerDay,
    otHours: calculatedValues.otHours,
    otRate: calculatedValues.otRate,
    otAmount: calculatedValues.otAmount,
    tiffinDays: calculatedValues.tiffinDays,
    tiffinRate: calculatedValues.tiffinRate,
    tiffinAmount: calculatedValues.tiffinAmount,
    totalPayableAmount: calculatedValues.totalPayableAmount,
    totalDutyDays: Number(attendanceFinalization.totalDutyDays || 0),
    totalPayableDays: Number(attendanceFinalization.totalPayableDays || 0),
    totalHolidayDutyDays: Number(attendanceFinalization.totalHolidayDutyDays || 0),
    status: "draft" as TTimeBillStatus,
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

const generateMonthlyTimeBillIntoDB = async (
  payload: TGenerateTimeBillPayload,
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
  const tiffinRate = Number(payload.tiffinRate || 0);

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
    .sort({
      employeeId: 1,
    });

  if (!employees.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No active employee found for Time Bill generation.",
    );
  }

  const { finalizationByEmployee, readiness } =
    await buildLockedAttendanceFinalizationMap({
      employees,
      company,
      payrollMonth,
    });

  const generatedTimeBills = [];
  const regeneratedTimeBills = [];
  const skippedEmployees = [];

  for (const employee of employees) {
    const existingTimeBill = await TimeBill.findOne({
      employee: employee._id,
      payrollMonth,
      isDeleted: false,
    });

    if (existingTimeBill && !payload.overwrite) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Time Bill already exists.",
      });
      continue;
    }

    if (existingTimeBill && existingTimeBill.isLocked) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Locked Time Bill cannot be overwritten.",
      });
      continue;
    }

    if (existingTimeBill && existingTimeBill.status !== "draft") {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Only draft Time Bill can be overwritten.",
      });
      continue;
    }

    const salaryStructure = await SalaryStructure.findOne({
      employee: employee._id,
      isActive: true,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    if (!salaryStructure) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Active salary structure not found.",
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

    const calculatedValues = calculateTimeBillValues({
      salaryStructure,
      attendanceFinalization,
      employee,
      tiffinRate,
    });

    const snapshot = createTimeBillSnapshot({
      employee,
      salaryStructure,
      attendanceFinalization,
      calculatedValues,
    });

    const timeBillPayload = buildTimeBillDocumentPayload({
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

    if (existingTimeBill) {
      existingTimeBill.set({
        ...timeBillPayload,
        auditLogs: [
          ...existingTimeBill.auditLogs,
          {
            action: "regenerated",
            fromStatus: "draft",
            toStatus: "draft",
            actionBy: buildActionBy(actionBy),
            actionAt: new Date(),
            note: `Time Bill regenerated for ${payrollMonth}`,
          },
        ],
      });

      const updatedTimeBill = await existingTimeBill.save();

      regeneratedTimeBills.push({
        timeBillId: getObjectIdString(updatedTimeBill._id),
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        payrollMonth,
        otHours: updatedTimeBill.otHours,
        otRate: updatedTimeBill.otRate,
        otAmount: updatedTimeBill.otAmount,
        tiffinDays: updatedTimeBill.tiffinDays,
        tiffinAmount: updatedTimeBill.tiffinAmount,
        totalPayableAmount: updatedTimeBill.totalPayableAmount,
        status: updatedTimeBill.status,
      });

      continue;
    }

    const timeBill = await TimeBill.create({
      ...timeBillPayload,
      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: buildActionBy(actionBy),
          actionAt: new Date(),
          note: `Time Bill generated for ${payrollMonth}`,
        },
      ],
    });

    generatedTimeBills.push({
      timeBillId: getObjectIdString(timeBill._id),
      employeeId: employee.employeeId,
      employeeName: getEmployeeFullName(employee),
      payrollMonth,
      otHours: timeBill.otHours,
      otRate: timeBill.otRate,
      otAmount: timeBill.otAmount,
      tiffinDays: timeBill.tiffinDays,
      tiffinAmount: timeBill.tiffinAmount,
      totalPayableAmount: timeBill.totalPayableAmount,
      status: timeBill.status,
    });
  }

  const allProcessedTimeBills = [...generatedTimeBills, ...regeneratedTimeBills];

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
    totalEmployees: employees.length,
    totalGenerated: generatedTimeBills.length,
    totalRegenerated: regeneratedTimeBills.length,
    totalSkipped: skippedEmployees.length,
    attendanceFinalizationReadiness: readiness,
    totals: {
      otHours: allProcessedTimeBills.reduce(
        (sum, item) => sum + Number(item.otHours || 0),
        0,
      ),
      otAmount: allProcessedTimeBills.reduce(
        (sum, item) => sum + Number(item.otAmount || 0),
        0,
      ),
      tiffinDays: allProcessedTimeBills.reduce(
        (sum, item) => sum + Number(item.tiffinDays || 0),
        0,
      ),
      tiffinAmount: allProcessedTimeBills.reduce(
        (sum, item) => sum + Number(item.tiffinAmount || 0),
        0,
      ),
      totalPayableAmount: allProcessedTimeBills.reduce(
        (sum, item) => sum + Number(item.totalPayableAmount || 0),
        0,
      ),
    },
    generatedTimeBills,
    regeneratedTimeBills,
    skippedEmployees,
  };
};

const getAllTimeBillsFromDB = async (query: TTimeBillQuery) => {
  const filter = buildTimeBillFilter(query);

  const result = await TimeBill.find(filter)
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("attendanceFinalization")
    .populate("salaryStructure")
    .sort({
      payrollMonth: -1,
      "snapshot.employee.employeeId": 1,
      createdAt: -1,
    });

  return result;
};

const getSingleTimeBillFromDB = async (id: string) => {
  assertObjectId(id, "Time Bill id");

  const result = await TimeBill.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("company")
    .populate("majorDepartment")
    .populate("department")
    .populate("designation")
    .populate("branch")
    .populate("attendanceFinalization")
    .populate("salaryStructure");

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Time Bill not found.");
  }

  return result;
};

const buildGroupKey = (timeBill: TTimeBill, groupName: "majorDepartment" | "department" | "branch") => {
  const snapshotSource = timeBill.snapshot?.employee?.[groupName];

  return {
    id: snapshotSource?.id || getObjectIdString(timeBill[groupName]),
    name: snapshotSource?.name || "Unknown",
  };
};

const addToGroup = (
  groups: Record<string, Record<string, unknown>>,
  keyData: { id: string; name: string },
  timeBill: TTimeBill,
) => {
  const key = keyData.id || keyData.name || "unknown";

  if (!groups[key]) {
    groups[key] = {
      id: keyData.id,
      name: keyData.name,
      totalRecords: 0,
      totalOtHours: 0,
      totalOtAmount: 0,
      totalTiffinDays: 0,
      totalTiffinAmount: 0,
      totalPayableAmount: 0,
    };
  }

  groups[key].totalRecords = Number(groups[key].totalRecords || 0) + 1;
  groups[key].totalOtHours =
    Number(groups[key].totalOtHours || 0) + Number(timeBill.otHours || 0);
  groups[key].totalOtAmount =
    Number(groups[key].totalOtAmount || 0) + Number(timeBill.otAmount || 0);
  groups[key].totalTiffinDays =
    Number(groups[key].totalTiffinDays || 0) + Number(timeBill.tiffinDays || 0);
  groups[key].totalTiffinAmount =
    Number(groups[key].totalTiffinAmount || 0) + Number(timeBill.tiffinAmount || 0);
  groups[key].totalPayableAmount =
    Number(groups[key].totalPayableAmount || 0) +
    Number(timeBill.totalPayableAmount || 0);
};

const getTimeBillOperationalSummaryFromDB = async (
  query: TTimeBillSummaryQuery,
) => {
  if (!query.company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  const filter = buildTimeBillFilter(query);
  const timeBills = await TimeBill.find(filter).lean<TTimeBill[]>();

  const statusSummary: Record<TTimeBillStatus, number> = {
    draft: 0,
    processed: 0,
    approved: 0,
    locked: 0,
  };

  const lockSummary = {
    locked: 0,
    unlocked: 0,
  };

  const totals = {
    totalRecords: timeBills.length,
    totalOtHours: 0,
    totalOtAmount: 0,
    totalTiffinDays: 0,
    totalTiffinAmount: 0,
    totalPayableAmount: 0,
  };

  const byMajorDepartment: Record<string, Record<string, unknown>> = {};
  const byDepartment: Record<string, Record<string, unknown>> = {};
  const byBranch: Record<string, Record<string, unknown>> = {};

  for (const timeBill of timeBills) {
    statusSummary[timeBill.status] += 1;

    if (timeBill.isLocked) {
      lockSummary.locked += 1;
    } else {
      lockSummary.unlocked += 1;
    }

    totals.totalOtHours += Number(timeBill.otHours || 0);
    totals.totalOtAmount += Number(timeBill.otAmount || 0);
    totals.totalTiffinDays += Number(timeBill.tiffinDays || 0);
    totals.totalTiffinAmount += Number(timeBill.tiffinAmount || 0);
    totals.totalPayableAmount += Number(timeBill.totalPayableAmount || 0);

    addToGroup(byMajorDepartment, buildGroupKey(timeBill, "majorDepartment"), timeBill);
    addToGroup(byDepartment, buildGroupKey(timeBill, "department"), timeBill);
    addToGroup(byBranch, buildGroupKey(timeBill, "branch"), timeBill);
  }

  const isGenerated = timeBills.length > 0;
  const isFullyProcessed =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed + statusSummary.approved + statusSummary.locked === timeBills.length;
  const isFullyApproved =
    isGenerated && statusSummary.draft === 0 && statusSummary.processed === 0 && statusSummary.approved + statusSummary.locked === timeBills.length;
  const isFullyLocked = isGenerated && lockSummary.locked === timeBills.length;

  const blockers = [];

  if (!isGenerated) {
    blockers.push("Time Bill has not been generated for the selected period.");
  }

  if (isGenerated && !isFullyProcessed) {
    blockers.push("Some Time Bill records are still in draft status.");
  }

  if (isGenerated && !isFullyApproved) {
    blockers.push("Some Time Bill records are not approved yet.");
  }

  if (isGenerated && !isFullyLocked) {
    blockers.push("Some Time Bill records are not locked yet.");
  }

  return {
    filters: query,
    readiness: {
      canProcessOtStatement: isFullyLocked,
      canProcessOtPaymentSheet: isFullyLocked,
      canProcessOtBankSheet: isFullyLocked,
      canProcessOtCashSheet: isFullyLocked,
      isGenerated,
      isFullyProcessed,
      isFullyApproved,
      isFullyLocked,
      nextRequiredAction: !isGenerated
        ? "generate_time_bill"
        : !isFullyProcessed
          ? "process_time_bill"
          : !isFullyApproved
            ? "approve_time_bill"
            : !isFullyLocked
              ? "lock_time_bill"
              : "ready_for_ot_statement",
      blockers,
    },
    statusSummary,
    lockSummary,
    totals,
    groupedSummary: {
      byMajorDepartment: Object.values(byMajorDepartment),
      byDepartment: Object.values(byDepartment),
      byBranch: Object.values(byBranch),
    },
  };
};


const buildTimeBillBulkActionFilter = (payload: TTimeBillBulkActionPayload) => {
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

const buildTimeBillStatusSummary = (records: TTimeBill[]) => {
  const statusSummary: Record<TTimeBillStatus, number> = {
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

const getTimeBillBulkActionConfig = (action: TTimeBillBulkActionType) => {
  const config: Record<
    TTimeBillBulkActionType,
    {
      auditAction: "processed" | "approved" | "locked" | "unlocked";
      allowedStatus: TTimeBillStatus;
      targetStatus: TTimeBillStatus;
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

const isTimeBillEligibleForBulkAction = (
  record: TTimeBill,
  action: TTimeBillBulkActionType,
) => {
  const config = getTimeBillBulkActionConfig(action);

  if (action === "unlock") {
    return record.status === "locked" && record.isLocked;
  }

  if (record.isLocked) {
    return false;
  }

  return record.status === config.allowedStatus;
};

const buildTimeBillBulkSkippedReason = (
  record: TTimeBill,
  action: TTimeBillBulkActionType,
) => {
  if (action !== "unlock" && record.isLocked) {
    return "Record is locked.";
  }

  if (action === "unlock") {
    return "Only locked Time Bill records can be unlocked.";
  }

  const config = getTimeBillBulkActionConfig(action);
  return `Only ${config.allowedStatus} Time Bill records can be ${config.description.toLowerCase()}.`;
};

const buildTimeBillBulkUpdatePayload = ({
  record,
  action,
  actionBy,
  note,
}: {
  record: TTimeBill;
  action: TTimeBillBulkActionType;
  actionBy?: string;
  note?: string;
}): Partial<TTimeBill> => {
  const config = getTimeBillBulkActionConfig(action);
  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  const updatePayload: Partial<TTimeBill> = {
    status: config.targetStatus,
    isLocked: action === "lock" ? true : action === "unlock" ? false : record.isLocked,
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
  }

  if (action === "unlock") {
    updatePayload.lockedBy = null;
    updatePayload.lockedAt = null;
  }

  return updatePayload;
};

const buildTimeBillBulkResultItem = (record: any) => {
  return {
    id: getObjectIdString(record._id),
    employee: getObjectIdString(record.employee),
    employeeId: record.snapshot?.employee?.employeeId || "",
    employeeName: record.snapshot?.employee?.employeeName || "",
    payrollMonth: record.payrollMonth,
    status: record.status,
    isLocked: record.isLocked,
    otHours: record.otHours,
    otAmount: record.otAmount,
    tiffinDays: record.tiffinDays,
    tiffinAmount: record.tiffinAmount,
    totalPayableAmount: record.totalPayableAmount,
  };
};

const bulkChangeTimeBillStatusIntoDB = async ({
  action,
  payload,
  actionBy,
}: {
  action: TTimeBillBulkActionType;
  payload: TTimeBillBulkActionPayload;
  actionBy?: string;
}) => {
  const { payrollMonth, filter } = buildTimeBillBulkActionFilter(payload);
  const records = await TimeBill.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  if (!records.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No Time Bill records found for the selected month and filters.",
    );
  }

  const statusSummaryBefore = buildTimeBillStatusSummary(records as TTimeBill[]);

  if (action === "lock" && payload.strict !== false) {
    const blockers = records.filter(
      (record) => record.status !== "approved" || record.isLocked,
    );

    if (blockers.length) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        `OT Statement readiness lock rejected. ${blockers.length} Time Bill record(s) are not ready for lock. Process and approve every selected Time Bill first, or pass strict=false for partial lock.`,
      );
    }
  }

  const processedRecords = [];
  const skippedRecords = [];

  for (const record of records) {
    if (!isTimeBillEligibleForBulkAction(record as TTimeBill, action)) {
      skippedRecords.push({
        ...buildTimeBillBulkResultItem(record),
        reason: buildTimeBillBulkSkippedReason(record as TTimeBill, action),
      });
      continue;
    }

    const updatedRecord = await TimeBill.findOneAndUpdate(
      {
        _id: record._id,
        isDeleted: false,
      },
      buildTimeBillBulkUpdatePayload({
        record: record as TTimeBill,
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

  const refreshedRecords = await TimeBill.find(filter).sort({
    "snapshot.employee.employeeId": 1,
    createdAt: 1,
  });

  const refreshedStatusSummary = buildTimeBillStatusSummary(
    refreshedRecords as TTimeBill[],
  );
  const totalLocked = refreshedRecords.filter((record) => record.isLocked).length;
  const isFullyLocked = refreshedRecords.length > 0 && totalLocked === refreshedRecords.length;

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
    otStatementReadiness: {
      canProcessOtStatement: isFullyLocked,
      canProcessOtPaymentSheet: isFullyLocked,
      totalRecords: refreshedRecords.length,
      totalLocked,
      blockers: isFullyLocked
        ? []
        : ["All selected Time Bill records must be locked before OT Statement processing."],
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

const transitionTimeBillStatusIntoDB = async ({
  id,
  payload,
  actionBy,
  expectedStatus,
  nextStatus,
  action,
}: {
  id: string;
  payload: TTimeBillActionPayload;
  actionBy?: string;
  expectedStatus: TTimeBillStatus;
  nextStatus: TTimeBillStatus;
  action: "processed" | "approved" | "locked" | "unlocked";
}) => {
  assertObjectId(id, "Time Bill id");

  const timeBill = await TimeBill.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!timeBill) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Time Bill not found.");
  }

  if (action !== "unlocked" && timeBill.isLocked) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Locked Time Bill cannot be changed before unlock.",
    );
  }

  if (action === "unlocked") {
    if (timeBill.status !== "locked" || !timeBill.isLocked) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Only locked Time Bill can be unlocked.",
      );
    }
  } else if (timeBill.status !== expectedStatus) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Time Bill must be ${expectedStatus} before it can be ${action}.`,
    );
  }

  const previousStatus = timeBill.status;
  const now = new Date();
  const userObjectId = buildActionBy(actionBy);

  timeBill.status = nextStatus;

  if (action === "processed") {
    timeBill.processedBy = userObjectId;
    timeBill.processedAt = now;
  }

  if (action === "approved") {
    timeBill.approvedBy = userObjectId;
    timeBill.approvedAt = now;
  }

  if (action === "locked") {
    timeBill.isLocked = true;
    timeBill.lockedBy = userObjectId;
    timeBill.lockedAt = now;
  }

  if (action === "unlocked") {
    timeBill.isLocked = false;
    timeBill.lockedBy = null;
    timeBill.lockedAt = null;
  }

  timeBill.auditLogs.push({
    action,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actionBy: userObjectId,
    actionAt: now,
    note: payload?.note || `Time Bill ${action}.`,
  });

  await timeBill.save();

  return timeBill;
};

const processTimeBillIntoDB = async (
  id: string,
  payload: TTimeBillActionPayload,
  actionBy?: string,
) => {
  return transitionTimeBillStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "draft",
    nextStatus: "processed",
    action: "processed",
  });
};

const approveTimeBillIntoDB = async (
  id: string,
  payload: TTimeBillActionPayload,
  actionBy?: string,
) => {
  return transitionTimeBillStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "processed",
    nextStatus: "approved",
    action: "approved",
  });
};

const lockTimeBillIntoDB = async (
  id: string,
  payload: TTimeBillActionPayload,
  actionBy?: string,
) => {
  return transitionTimeBillStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "approved",
    nextStatus: "locked",
    action: "locked",
  });
};

const unlockTimeBillIntoDB = async (
  id: string,
  payload: TTimeBillActionPayload,
  actionBy?: string,
) => {
  return transitionTimeBillStatusIntoDB({
    id,
    payload,
    actionBy,
    expectedStatus: "locked",
    nextStatus: "approved",
    action: "unlocked",
  });
};


const bulkProcessTimeBillsIntoDB = async (
  payload: TTimeBillBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeTimeBillStatusIntoDB({
    action: "process",
    payload,
    actionBy,
  });
};

const bulkApproveTimeBillsIntoDB = async (
  payload: TTimeBillBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeTimeBillStatusIntoDB({
    action: "approve",
    payload,
    actionBy,
  });
};

const bulkLockTimeBillsIntoDB = async (
  payload: TTimeBillBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeTimeBillStatusIntoDB({
    action: "lock",
    payload,
    actionBy,
  });
};

const bulkUnlockTimeBillsIntoDB = async (
  payload: TTimeBillBulkActionPayload,
  actionBy?: string,
) => {
  return bulkChangeTimeBillStatusIntoDB({
    action: "unlock",
    payload,
    actionBy,
  });
};

export const TimeBillServices = {
  generateMonthlyTimeBillIntoDB,
  getAllTimeBillsFromDB,
  getSingleTimeBillFromDB,
  getTimeBillOperationalSummaryFromDB,
  processTimeBillIntoDB,
  approveTimeBillIntoDB,
  lockTimeBillIntoDB,
  unlockTimeBillIntoDB,
  bulkProcessTimeBillsIntoDB,
  bulkApproveTimeBillsIntoDB,
  bulkLockTimeBillsIntoDB,
  bulkUnlockTimeBillsIntoDB,
};

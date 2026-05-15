import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import EmployeeDocument from "../employeeDocument/employeeDocument.model";
import { EmployeeMovement } from "../employeeMovement/employeeMovement.model";
import Employee from "../employee/employee.model";
import LeaveBalance from "../leaveBalance/leaveBalance.model";
import { LegacySalaryRecord } from "../legacySalaryImport/legacySalaryImport.model";
import { Payroll } from "../payroll/payroll.model";
import SalarySheet from "../salarySheet/salarySheet.model";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import {
  TEmployeeProfileDataGap,
  TEmployeeProfileQuery,
  TEmployeeProfileReference,
  TEmployeeProfileSummary,
  TEmployeeProfileTimelineEvent,
} from "./employeeProfile.interface";

type TObject = Record<string, any>;

const DEFAULT_HISTORY_LIMIT = 12;
const DEFAULT_MOVEMENT_LIMIT = 10;
const DEFAULT_LEGACY_LIMIT = 12;

const toNumber = (
  value: string | undefined,
  fallback: number,
  max: number,
): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
};

const getCurrentYear = () => new Date().getFullYear();

const normalizeEmployeeReference = (employeeRef: string) =>
  employeeRef.trim().toUpperCase();

const buildEmployeeLookupQuery = (employeeRef: string) => {
  const normalizedRef = normalizeEmployeeReference(employeeRef);

  if (mongoose.isValidObjectId(employeeRef)) {
    return {
      _id: employeeRef,
      isDeleted: false,
    };
  }

  return {
    isDeleted: false,
    $or: [
      { employeeId: normalizedRef },
      { officeId: normalizedRef },
      { cardNo: normalizedRef },
    ],
  };
};

const populateEmployeeQuery = () => [
  {
    path: "user",
    select: "name email role",
  },
  {
    path: "company",
  },
  {
    path: "majorDepartment",
  },
  {
    path: "department",
  },
  {
    path: "designation",
  },
  {
    path: "branch",
  },
  {
    path: "lifecycleChangedBy",
    select: "name email role",
  },
  {
    path: "deletedBy",
    select: "name email role",
  },
  {
    path: "restoredBy",
    select: "name email role",
  },
];

const toId = (value: unknown) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  const record = value as TObject;

  if (record._id) {
    return String(record._id);
  }

  if (record.id) {
    return String(record.id);
  }

  return String(value);
};

const toIdName = (value: unknown): TEmployeeProfileReference | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string" || value instanceof mongoose.Types.ObjectId) {
    return {
      id: toId(value),
      name: "",
    };
  }

  const record = value as TObject;

  return {
    id: toId(record),
    name:
      record.name ||
      record.title ||
      record.code ||
      record.email ||
      record.employeeId ||
      "",
    code: record.code,
  };
};

const getEmployeeFullName = (employee: TObject) => {
  const name = employee.name || {};

  return [name.firstName, name.middleName, name.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
};

const getDateOnly = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const buildProfileSummary = (employee: TObject): TEmployeeProfileSummary => ({
  employeeDbId: toId(employee),
  employeeId: employee.employeeId,
  officeId: employee.officeId,
  cardNo: employee.cardNo,
  employeeName: getEmployeeFullName(employee),
  status: employee.status,
  employmentStatus: employee.employmentStatus,
  serviceType: employee.serviceType,
  payType: employee.payType,
  joiningDate: employee.joiningDate,
  confirmationDate: employee.confirmationDate,
  separatedAt: employee.separatedAt,
  company: toIdName(employee.company),
  majorDepartment: toIdName(employee.majorDepartment),
  department: toIdName(employee.department),
  designation: toIdName(employee.designation),
  branch: toIdName(employee.branch),
});

const getLatestByPayrollMonth = (records: TObject[]) =>
  records.length ? records[0] : null;

const getPrimaryBankInfo = (bankInfos: TObject[]) =>
  bankInfos.find(
    (item) => item.isPrimary && item.status === "active" && !item.isDeleted,
  ) || bankInfos[0] || null;

const calculateLeaveSummary = (leaveBalances: TObject[]) => {
  const totals = leaveBalances.reduce(
    (acc, item) => {
      acc.openingBalance += Number(item.openingBalance || 0);
      acc.yearlyEntitlement += Number(item.yearlyEntitlement || 0);
      acc.earnedDays += Number(item.earnedDays || 0);
      acc.adjustedDays += Number(item.adjustedDays || 0);
      acc.approvedConsumedDays += Number(item.approvedConsumedDays || 0);
      acc.pendingDays += Number(item.pendingDays || 0);
      acc.remainingDays += Number(item.remainingDays || 0);
      acc.availableDays += Number(item.availableDays || 0);
      acc.overConsumedDays += Number(item.overConsumedDays || 0);

      return acc;
    },
    {
      openingBalance: 0,
      yearlyEntitlement: 0,
      earnedDays: 0,
      adjustedDays: 0,
      approvedConsumedDays: 0,
      pendingDays: 0,
      remainingDays: 0,
      availableDays: 0,
      overConsumedDays: 0,
    },
  );

  return {
    year: leaveBalances[0]?.year || null,
    leaveTypeCount: leaveBalances.length,
    totals,
    balances: leaveBalances,
  };
};

const buildDataGaps = (options: {
  employee: TObject;
  salaryStructures: TObject[];
  bankInfos: TObject[];
  documents: TObject[];
  leaveBalances: TObject[];
}): TEmployeeProfileDataGap[] => {
  const gaps: TEmployeeProfileDataGap[] = [];

  if (!options.employee.confirmationDate) {
    gaps.push({
      key: "confirmationDate",
      label: "Confirmation date missing",
      severity: "info",
      message:
        "Confirmation date is not set yet. This may be valid for probation/new employees.",
    });
  }

  if (!options.salaryStructures.length) {
    gaps.push({
      key: "salaryStructure",
      label: "Salary structure missing",
      severity: "critical",
      message:
        "No salary structure found for this employee. Payroll/salary profile may be incomplete.",
    });
  }

  if (!options.bankInfos.length) {
    gaps.push({
      key: "paymentInfo",
      label: "Payment information missing",
      severity: "warning",
      message:
        "No bank/cash/mobile payment information found for this employee.",
    });
  }

  if (!options.documents.length) {
    gaps.push({
      key: "employeeDocuments",
      label: "Employee document vault empty",
      severity: "warning",
      message:
        "No employee document record found. NID, appointment letter, certificates or HR letters may need to be archived.",
    });
  }

  if (!options.leaveBalances.length) {
    gaps.push({
      key: "leaveBalance",
      label: "Leave balance not generated",
      severity: "warning",
      message:
        "No leave balance record found for the selected year.",
    });
  }

  return gaps;
};

const buildTimeline = (options: {
  employee: TObject;
  movements: TObject[];
  salaryStructures: TObject[];
  payrollRecords: TObject[];
  legacySalaryRecords: TObject[];
  documents: TObject[];
}): TEmployeeProfileTimelineEvent[] => {
  const timeline: TEmployeeProfileTimelineEvent[] = [];

  if (options.employee.joiningDate) {
    timeline.push({
      type: "joining",
      title: "Employee joined",
      date: options.employee.joiningDate,
      status: options.employee.employmentStatus,
      description: `${options.employee.employeeId} joined the company.`,
    });
  }

  if (options.employee.confirmationDate) {
    timeline.push({
      type: "confirmation",
      title: "Employee confirmation date recorded",
      date: options.employee.confirmationDate,
      status: options.employee.employmentStatus,
    });
  }

  if (options.employee.lifecycleChangedAt) {
    timeline.push({
      type: "lifecycle",
      title: "Employee lifecycle changed",
      date: options.employee.lifecycleChangedAt,
      status: options.employee.employmentStatus,
      description: options.employee.lifecycleChangeReason,
      metadata: {
        effectiveDate: options.employee.lifecycleEffectiveDate,
        separatedAt: options.employee.separatedAt,
      },
    });
  }

  options.movements.forEach((movement) => {
    timeline.push({
      type: "movement",
      title: `Movement: ${movement.movementType || "employee movement"}`,
      date: movement.effectiveDate || movement.createdAt,
      status: movement.status,
      description: movement.reason || movement.remarks,
      referenceId: toId(movement),
    });
  });

  options.documents.forEach((document) => {
    timeline.push({
      type: "document",
      title: `Document: ${document.title || document.category}`,
      date: document.issueDate || document.createdAt,
      status: document.status,
      referenceId: toId(document),
      metadata: {
        category: document.category,
        documentNo: document.documentNo,
        expiryDate: document.expiryDate,
        confidentiality: document.confidentiality,
      },
    });
  });

  options.salaryStructures.forEach((salaryStructure) => {
    timeline.push({
      type: "salary_structure",
      title: salaryStructure.isActive
        ? "Active salary structure"
        : "Salary structure history",
      date: salaryStructure.effectiveFrom || salaryStructure.createdAt,
      status: salaryStructure.isActive ? "active" : "inactive",
      referenceId: toId(salaryStructure),
      metadata: {
        grossSalary: salaryStructure.grossSalary,
        netSalary: salaryStructure.netSalary,
      },
    });
  });

  options.payrollRecords.forEach((payroll) => {
    timeline.push({
      type: "payroll",
      title: `Payroll ${payroll.payrollMonth}`,
      date: payroll.payrollMonth,
      status: payroll.status,
      referenceId: toId(payroll),
      metadata: {
        grossSalary: payroll.grossSalary,
        payableSalary: payroll.payableSalary,
        finalPayableSalary: payroll.finalPayableSalary,
      },
    });
  });

  options.legacySalaryRecords.forEach((record) => {
    timeline.push({
      type: "legacy_salary",
      title: `Legacy salary archive ${record.payrollMonth}`,
      date: record.payrollMonth,
      status: record.status,
      referenceId: toId(record),
      metadata: {
        source: record.source,
        sheetType: record.sheetType,
        payableAmount: record.payableAmount,
        netAmount: record.netAmount,
      },
    });
  });

  return timeline.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;

    return dateB - dateA;
  });
};

const findEmployeeOrThrow = async (employeeRef: string) => {
  const employee = await Employee.findOne(buildEmployeeLookupQuery(employeeRef))
    .populate(populateEmployeeQuery())
    .lean<TObject>();

  if (!employee) {
    throw new AppError(404, "Employee profile not found");
  }

  return employee;
};

const getEmployeeProfileFromDB = async (
  employeeRef: string,
  query: TEmployeeProfileQuery = {},
) => {
  const employee = await findEmployeeOrThrow(employeeRef);
  const employeeObjectId = employee._id;
  const selectedYear = Number(query.year || getCurrentYear());
  const historyLimit = toNumber(query.historyLimit, DEFAULT_HISTORY_LIMIT, 36);
  const movementLimit = toNumber(query.movementLimit, DEFAULT_MOVEMENT_LIMIT, 50);
  const legacyLimit = toNumber(query.legacyLimit, DEFAULT_LEGACY_LIMIT, 100);

  const payrollMonthFilter = query.payrollMonth
    ? { payrollMonth: query.payrollMonth }
    : {};

  const [
    salaryStructures,
    bankInfos,
    documents,
    movements,
    leaveBalances,
    attendanceFinalizations,
    salarySheets,
    payrollRecords,
    legacySalaryRecords,
  ] = await Promise.all([
    SalaryStructure.find({
      employee: employeeObjectId,
      isDeleted: false,
    })
      .sort({ isActive: -1, effectiveFrom: -1, createdAt: -1 })
      .lean<TObject[]>(),

    EmployeeBankInfo.find({
      employee: employeeObjectId,
      isDeleted: false,
    })
      .sort({ isPrimary: -1, status: 1, effectiveFrom: -1, createdAt: -1 })
      .lean<TObject[]>(),

    EmployeeDocument.find({
      employee: employeeObjectId,
      isDeleted: false,
    })
      .sort({ status: 1, category: 1, createdAt: -1 })
      .limit(30)
      .lean<TObject[]>(),

    EmployeeMovement.find({
      employee: employeeObjectId,
      isDeleted: false,
    })
      .sort({ effectiveDate: -1, createdAt: -1 })
      .limit(movementLimit)
      .lean<TObject[]>(),

    LeaveBalance.find({
      employee: employeeObjectId,
      year: selectedYear,
      isDeleted: false,
    })
      .sort({ leaveType: 1 })
      .lean<TObject[]>(),

    AttendanceFinalization.find({
      employee: employeeObjectId,
      isDeleted: false,
      ...payrollMonthFilter,
    })
      .sort({ year: -1, month: -1, payrollMonth: -1, createdAt: -1 })
      .limit(historyLimit)
      .lean<TObject[]>(),

    SalarySheet.find({
      employee: employeeObjectId,
      isDeleted: false,
      ...payrollMonthFilter,
    })
      .sort({ year: -1, month: -1, payrollMonth: -1, createdAt: -1 })
      .limit(historyLimit)
      .lean<TObject[]>(),

    Payroll.find({
      employee: employeeObjectId,
      isDeleted: false,
      ...payrollMonthFilter,
    })
      .sort({ payrollMonth: -1, createdAt: -1 })
      .limit(historyLimit)
      .lean<TObject[]>(),

    LegacySalaryRecord.find({
      employee: employeeObjectId,
      isDeleted: false,
      ...payrollMonthFilter,
    })
      .sort({ year: -1, month: -1, payrollMonth: -1, rowNo: 1, createdAt: -1 })
      .limit(legacyLimit)
      .lean<TObject[]>(),
  ]);

  const activeSalaryStructure =
    salaryStructures.find((item) => item.isActive && !item.isDeleted) ||
    salaryStructures[0] ||
    null;
  const primaryBankInfo = getPrimaryBankInfo(bankInfos);
  const latestAttendanceFinalization = getLatestByPayrollMonth(
    attendanceFinalizations,
  );
  const latestSalarySheet = getLatestByPayrollMonth(salarySheets);
  const latestPayroll = getLatestByPayrollMonth(payrollRecords);
  const leaveSummary = calculateLeaveSummary(leaveBalances);
  const dataGaps = buildDataGaps({
    employee,
    salaryStructures,
    bankInfos,
    documents,
    leaveBalances,
  });
  const todayDate = getDateOnly(new Date()) || new Date().toISOString().slice(0, 10);
  const timeline = buildTimeline({
    employee,
    movements,
    salaryStructures: salaryStructures.slice(0, 5),
    payrollRecords: payrollRecords.slice(0, 5),
    legacySalaryRecords: legacySalaryRecords.slice(0, 5),
    documents: documents.slice(0, 8),
  });

  return {
    profileGeneratedAt: new Date().toISOString(),
    selectedYear,
    selectedPayrollMonth: query.payrollMonth || null,
    summary: buildProfileSummary(employee),
    sections: {
      personal: {
        name: employee.name,
        fullName: getEmployeeFullName(employee),
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        dateOfBirth: employee.dateOfBirth,
        user: employee.user || null,
      },
      office: {
        employeeId: employee.employeeId,
        officeId: employee.officeId,
        cardNo: employee.cardNo,
        company: toIdName(employee.company),
        majorDepartment: toIdName(employee.majorDepartment),
        department: toIdName(employee.department),
        designation: toIdName(employee.designation),
        branch: toIdName(employee.branch),
        joiningDate: employee.joiningDate,
        confirmationDate: employee.confirmationDate,
        serviceType: employee.serviceType,
        payType: employee.payType,
        dutyHourPerDay: employee.dutyHourPerDay,
        leaveDay: employee.leaveDay,
      },
      lifecycle: {
        status: employee.status,
        employmentStatus: employee.employmentStatus,
        lifecycleChangedAt: employee.lifecycleChangedAt,
        lifecycleChangedBy: employee.lifecycleChangedBy || null,
        lifecycleChangeReason: employee.lifecycleChangeReason,
        lifecycleEffectiveDate: employee.lifecycleEffectiveDate,
        separatedAt: employee.separatedAt,
        separationReason: employee.separationReason,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      },
      salary: {
        activeSalaryStructure,
        salaryStructureHistory: salaryStructures,
        latestSalarySheet,
        latestPayroll,
      },
      payment: {
        primaryBankInfo,
        paymentOptions: bankInfos,
      },
      documents: {
        count: documents.length,
        pendingCount: documents.filter((item) => item.status === "pending").length,
        verifiedCount: documents.filter((item) => item.status === "verified").length,
        rejectedCount: documents.filter((item) => item.status === "rejected").length,
        expiredCount: documents.filter(
          (item) => item.expiryDate && item.expiryDate < todayDate,
        ).length,
        records: documents,
      },
      attendance: {
        latestAttendanceFinalization,
        history: attendanceFinalizations,
      },
      leave: leaveSummary,
      movements: {
        count: movements.length,
        latest: movements[0] || null,
        history: movements,
      },
      payrollHistory: {
        nativePayroll: payrollRecords,
        salarySheets,
      },
      legacySalaryArchive: {
        count: legacySalaryRecords.length,
        records: legacySalaryRecords,
        note:
          "Legacy salary records are archive-only and are not used by native payroll calculation.",
      },
      dataGaps,
      timeline,
    },
  };
};

const getEmployeeProfileSummaryFromDB = async (employeeRef: string) => {
  const employee = await findEmployeeOrThrow(employeeRef);

  const [
    salaryStructureCount,
    bankInfoCount,
    documentCount,
    pendingDocumentCount,
    movementCount,
    payrollCount,
  ] = await Promise.all([
      SalaryStructure.countDocuments({
        employee: employee._id,
        isDeleted: false,
      }),
      EmployeeBankInfo.countDocuments({
        employee: employee._id,
        isDeleted: false,
      }),
      EmployeeDocument.countDocuments({
        employee: employee._id,
        isDeleted: false,
      }),
      EmployeeDocument.countDocuments({
        employee: employee._id,
        status: "pending",
        isDeleted: false,
      }),
      EmployeeMovement.countDocuments({
        employee: employee._id,
        isDeleted: false,
      }),
      Payroll.countDocuments({
        employee: employee._id,
        isDeleted: false,
      }),
    ]);

  return {
    profileGeneratedAt: new Date().toISOString(),
    summary: buildProfileSummary(employee),
    counters: {
      salaryStructureCount,
      bankInfoCount,
      documentCount,
      pendingDocumentCount,
      movementCount,
      payrollCount,
    },
    serviceBookReady: Boolean(salaryStructureCount && bankInfoCount && documentCount),
  };
};

export const EmployeeProfileServices = {
  getEmployeeProfileFromDB,
  getEmployeeProfileSummaryFromDB,
};

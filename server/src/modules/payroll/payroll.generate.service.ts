import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";
import type { TAttendanceFinalization } from "../attendanceFinalization/attendanceFinalization.interface";
import { Payroll } from "./payroll.model";

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

const roundCurrency = (value: number) => {
  return Math.round(value);
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

const calculateSalaryValues = (
  salaryStructure: any,
  attendanceFinalization: TAttendanceFinalizationRecord,
) => {
  const grossSalary = Number(salaryStructure?.grossSalary || 0);
  const perDaySalary = grossSalary / 30;

  const fixedDeduction =
    Number(salaryStructure?.taxDeduction || 0) +
    Number(salaryStructure?.providentFund || 0) +
    Number(salaryStructure?.loanDeduction || 0) +
    Number(salaryStructure?.otherDeduction || 0);

  const attendanceDeduction = roundCurrency(
    perDaySalary * Number(attendanceFinalization.totalDeductionDays || 0),
  );

  const netSalary = grossSalary - fixedDeduction - attendanceDeduction;

  const payableSalary = Math.max(netSalary, 0);

  return {
    grossSalary,
    perDaySalary,
    fixedDeduction,
    attendanceDeduction,
    netSalary,
    payableSalary,
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
      `Payroll generation blocked. Locked attendance finalization is required for every selected employee before salary sheet processing. Blockers: ${blockerPreview}${
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
      totalDeductionDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalDeductionDays || 0),
        0,
      ),
      totalPayableDays: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalPayableDays || 0),
        0,
      ),
      totalOtHours: finalizations.reduce(
        (sum, finalization) => sum + Number(finalization.totalOtHours || 0),
        0,
      ),
    },
  };
};

const getPrimaryPaymentInfo = async (employeeId: string, companyId: string) => {
  return EmployeeBankInfo.findOne({
    employee: employeeId,
    company: companyId,
    isPrimary: true,
    status: "active",
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

const createPayrollSnapshot = async ({
  employee,
  salaryStructure,
  paymentInfo,
  calculatedSalary,
  attendanceFinalization,
}: {
  employee: any;
  salaryStructure: any;
  paymentInfo: any;
  calculatedSalary: {
    grossSalary: number;
    perDaySalary: number;
    fixedDeduction: number;
    attendanceDeduction: number;
    netSalary: number;
    payableSalary: number;
  };
  attendanceFinalization: TAttendanceFinalizationRecord;
}) => {
  return {
    employee: {
      employeeDbId: employee?._id?.toString?.() || "",

      employeeId: employee?.employeeId || "",

      employeeName: getEmployeeFullName(employee),

      company: employee?.company
        ? {
            id: employee?.company?._id?.toString?.() || "",
            name: employee?.company?.name || "",
          }
        : null,

      branch: employee?.branch
        ? {
            id: employee?.branch?._id?.toString?.() || "",
            name: employee?.branch?.name || "",
          }
        : null,

      department: employee?.department
        ? {
            id: employee?.department?._id?.toString?.() || "",
            name: employee?.department?.name || "",
          }
        : null,

      designation: employee?.designation
        ? {
            id: employee?.designation?._id?.toString?.() || "",
            name: employee?.designation?.name || "",
          }
        : null,

      employmentType: employee?.serviceType || "",

      employmentStatus: employee?.employmentStatus || "",

      joiningDate: employee?.joiningDate
        ? new Date(employee.joiningDate)
        : null,
    },

    salary: {
      grossSalary: calculatedSalary.grossSalary,

      perDaySalary: calculatedSalary.perDaySalary,

      fixedDeduction: calculatedSalary.fixedDeduction,

      attendanceDeduction: calculatedSalary.attendanceDeduction,

      netSalary: calculatedSalary.netSalary,

      payableSalary: calculatedSalary.payableSalary,

      salaryStructureId: salaryStructure?._id?.toString?.() || "",
    },

    attendanceFinalization: {
      attendanceFinalizationId: getObjectIdString(attendanceFinalization._id),
      payrollMonth: attendanceFinalization.payrollMonth,
      status: attendanceFinalization.status,
      isLocked: attendanceFinalization.isLocked,
      periodStartDate: attendanceFinalization.periodStartDate,
      periodEndDate: attendanceFinalization.periodEndDate,
      totalCalendarDays: attendanceFinalization.totalCalendarDays,
      totalPayableDays: attendanceFinalization.totalPayableDays,
      totalDeductionDays: attendanceFinalization.totalDeductionDays,
      totalAbsentDays: attendanceFinalization.totalAbsentDays,
      totalPaidLeaveDays: attendanceFinalization.totalPaidLeaveDays,
      totalUnpaidLeaveDays: attendanceFinalization.totalUnpaidLeaveDays,
      totalDutyDays: attendanceFinalization.totalDutyDays,
      totalOtHours: attendanceFinalization.totalOtHours,
      totalTiffinDays: attendanceFinalization.totalTiffinDays,
      generatedRuleVersion:
        attendanceFinalization.sourceSummary?.generatedRuleVersion || "",
    },

    payment: paymentInfo
      ? {
          paymentMode: paymentInfo?.paymentMode || "",

          bankName: paymentInfo?.bankName || "",

          bankBranchName: paymentInfo?.bankBranchName || "",

          bankBranchCode: paymentInfo?.bankBranchCode || "",

          accountName: paymentInfo?.accountName || "",

          accountNo: paymentInfo?.accountNo || "",

          routingNo: paymentInfo?.routingNo || "",

          mobileBankingType: paymentInfo?.mobileBankingProvider || "",

          mobileBankingNo: paymentInfo?.mobileBankingNo || "",
        }
      : null,
  };
};

const generateMonthlyPayrollFromDB = async ({
  month,
  year,
  company,
  actionBy,
}: {
  month: number;
  year: number;
  company: string;
  actionBy?: string;
}) => {
  if (!month || !year) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Month and year are required.");
  }

  if (!company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  if (!Types.ObjectId.isValid(company)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid company id.");
  }

  const payrollMonth = buildPayrollMonth(month, year);
  const { periodEndDate } = getMonthDateRange(month, year);

  const employees = await Employee.find({
    company,
    status: "active",
    isDeleted: false,
    employmentStatus: {
      $nin: ["resigned", "terminated", "retired", "suspended"],
    },
    joiningDate: {
      $lte: periodEndDate,
    },
  })
    .populate("company")
    .populate("branch")
    .populate("department")
    .populate("designation")
    .sort({
      employeeId: 1,
    });

  if (!employees.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No active employee found for payroll generation.",
    );
  }

  const { finalizationByEmployee, readiness } =
    await buildLockedAttendanceFinalizationMap({
      employees,
      company,
      payrollMonth,
    });

  const generatedPayrolls = [];
  const skippedEmployees = [];

  for (const employee of employees) {
    const existingPayroll = await Payroll.findOne({
      employee: employee._id,
      payrollMonth,
      isDeleted: false,
    });

    if (existingPayroll) {
      skippedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: getEmployeeFullName(employee),
        reason: "Payroll already exists.",
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

    const calculatedSalary = calculateSalaryValues(
      salaryStructure,
      attendanceFinalization,
    );

    const paymentInfo = await getPrimaryPaymentInfo(
      employee._id.toString(),
      employee.company._id.toString(),
    );

    const snapshot = await createPayrollSnapshot({
      employee,
      salaryStructure,
      paymentInfo,
      calculatedSalary,
      attendanceFinalization,
    });

    const payroll = await Payroll.create({
      employee: employee._id,

      payrollMonth,

      salaryStructure: salaryStructure._id,

      attendanceFinalization: attendanceFinalization._id,

      totalPayableDays: attendanceFinalization.totalPayableDays,

      totalDeductionDays: attendanceFinalization.totalDeductionDays,

      totalAbsentDays: attendanceFinalization.totalAbsentDays,

      totalPaidLeaveDays: attendanceFinalization.totalPaidLeaveDays,

      totalUnpaidLeaveDays: attendanceFinalization.totalUnpaidLeaveDays,

      grossSalary: calculatedSalary.grossSalary,

      fixedDeduction: calculatedSalary.fixedDeduction,

      attendanceDeduction: calculatedSalary.attendanceDeduction,

      netSalary: calculatedSalary.netSalary,

      payableSalary: calculatedSalary.payableSalary,

      status: "draft",

      remarks: "",

      isLocked: false,

      snapshot,

      auditLogs: [
        {
          action: "generated",
          fromStatus: null,
          toStatus: "draft",
          actionBy: actionBy || null,
          actionAt: new Date(),
          note: `Payroll generated for ${payrollMonth}`,
        },
      ],

      isDeleted: false,
    });

    generatedPayrolls.push({
      payrollId: payroll._id,
      employeeId: employee.employeeId,
      employeeName: getEmployeeFullName(employee),
      payrollMonth,
      grossSalary: payroll.grossSalary,
      payableSalary: payroll.payableSalary,
      attendanceDeduction: payroll.attendanceDeduction,
      totalPayableDays: payroll.totalPayableDays,
      totalDeductionDays: payroll.totalDeductionDays,
      attendanceFinalizationId: getObjectIdString(payroll.attendanceFinalization),
      status: payroll.status,
    });
  }

  return {
    payrollMonth,
    totalEmployees: employees.length,
    totalGenerated: generatedPayrolls.length,
    totalSkipped: skippedEmployees.length,
    attendanceFinalizationReadiness: readiness,
    generatedPayrolls,
    skippedEmployees,
  };
};

export const PayrollGenerateService = {
  generateMonthlyPayrollFromDB,
};

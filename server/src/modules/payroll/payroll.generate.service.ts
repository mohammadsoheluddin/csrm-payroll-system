import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import Employee from "../employee/employee.model";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import SalaryStructure from "../salaryStructure/salaryStructure.model";
import { Payroll } from "./payroll.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

const buildPayrollMonth = (month: number, year: number) => {
  return `${year}-${String(month).padStart(2, "0")}`;
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

const calculateSalaryValues = (salaryStructure: any) => {
  const grossSalary = Number(salaryStructure?.grossSalary || 0);

  const fixedDeduction =
    Number(salaryStructure?.taxDeduction || 0) +
    Number(salaryStructure?.providentFund || 0) +
    Number(salaryStructure?.loanDeduction || 0) +
    Number(salaryStructure?.otherDeduction || 0);

  const attendanceDeduction = 0;

  const netSalary = grossSalary - fixedDeduction - attendanceDeduction;

  const payableSalary = Math.max(netSalary, 0);

  return {
    grossSalary,
    fixedDeduction,
    attendanceDeduction,
    netSalary,
    payableSalary,
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
}: {
  employee: any;
  salaryStructure: any;
  paymentInfo: any;
  calculatedSalary: {
    grossSalary: number;
    fixedDeduction: number;
    attendanceDeduction: number;
    netSalary: number;
    payableSalary: number;
  };
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

      fixedDeduction: calculatedSalary.fixedDeduction,

      attendanceDeduction: calculatedSalary.attendanceDeduction,

      netSalary: calculatedSalary.netSalary,

      payableSalary: calculatedSalary.payableSalary,

      salaryStructureId: salaryStructure?._id?.toString?.() || "",
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

  const employees = await Employee.find({
    company,
    status: "active",
    isDeleted: false,
    employmentStatus: {
      $nin: ["resigned", "terminated", "retired", "suspended"],
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

    const calculatedSalary = calculateSalaryValues(salaryStructure);

    const paymentInfo = await getPrimaryPaymentInfo(
      employee._id.toString(),
      employee.company._id.toString(),
    );

    const snapshot = await createPayrollSnapshot({
      employee,
      salaryStructure,
      paymentInfo,
      calculatedSalary,
    });

    const payroll = await Payroll.create({
      employee: employee._id,

      payrollMonth,

      salaryStructure: salaryStructure._id,

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
      status: payroll.status,
    });
  }

  return {
    payrollMonth,
    totalEmployees: employees.length,
    totalGenerated: generatedPayrolls.length,
    totalSkipped: skippedEmployees.length,
    generatedPayrolls,
    skippedEmployees,
  };
};

export const PayrollGenerateService = {
  generateMonthlyPayrollFromDB,
};

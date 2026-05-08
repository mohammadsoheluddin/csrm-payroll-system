import mongoose from "mongoose";

import AppError from "../../errors/AppError";

import Employee from "../employee/employee.model";

import SalaryStructure from "../salaryStructure/salaryStructure.model";

import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";

import { Payroll } from "./payroll.model";

import { TPayrollAuditAction, TPayrollStatus } from "./payroll.interface";

const calculateOTAmount = ({
  otHours,
  otRate,
}: {
  otHours: number;

  otRate: number;
}) => {
  return Number((Number(otHours || 0) * Number(otRate || 0)).toFixed(2));
};

const addPayrollAuditLog = ({
  payroll,
  action,
  fromStatus,
  toStatus,
  actionBy,
  note,
}: {
  payroll: any;

  action: TPayrollAuditAction;

  fromStatus?: TPayrollStatus | null;

  toStatus?: TPayrollStatus | null;

  actionBy?: string | null;

  note?: string;
}) => {
  payroll.auditLogs.push({
    action,

    fromStatus: fromStatus || null,

    toStatus: toStatus || null,

    actionBy:
      actionBy && mongoose.isValidObjectId(actionBy)
        ? new mongoose.Types.ObjectId(actionBy)
        : null,

    actionAt: new Date(),

    note: note || "",
  });
};

const createPayrollIntoDB = async (payload: any, actionBy?: string) => {
  const { employee, payrollMonth, remarks, otHours = 0, otRate = 0 } = payload;

  if (!mongoose.isValidObjectId(employee)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const existingPayroll = await Payroll.findOne({
    employee,
    payrollMonth,
    isDeleted: false,
  });

  if (existingPayroll) {
    throw new AppError(
      409,
      "Payroll already exists for this employee and month",
    );
  }

  const employeeData = await Employee.findOne({
    _id: employee,
    isDeleted: false,
  })
    .populate("company")
    .populate("branch")
    .populate("department")
    .populate("designation");

  if (!employeeData) {
    throw new AppError(404, "Employee not found");
  }

  const salaryStructure = await SalaryStructure.findOne({
    employee,
    isDeleted: false,
    isActive: true,
  });

  if (!salaryStructure) {
    throw new AppError(404, "Active salary structure not found");
  }

  const employeeBankInfo = await EmployeeBankInfo.findOne({
    employee,
    isDeleted: false,
    isActive: true,
  });

  const grossSalary = Number(salaryStructure.grossSalary || 0);

  const fixedDeduction = Number(salaryStructure.totalDeduction || 0);

  /*
      ATTENDANCE DEDUCTION
      FUTURE ENGINE PLACEHOLDER
    */

  const attendanceDeduction = 0;

  const netSalary = grossSalary - fixedDeduction - attendanceDeduction;

  /*
      OT SNAPSHOT
      (Currently optional compatibility layer)
    */

  const calculatedOTAmount = calculateOTAmount({
    otHours: Number(otHours || 0),

    otRate: Number(otRate || 0),
  });

  const finalPayableSalary = Number(
    (netSalary + calculatedOTAmount).toFixed(2),
  );

  const payroll = await Payroll.create({
    employee,

    payrollMonth,

    salaryStructure: salaryStructure._id,

    grossSalary,

    fixedDeduction,

    attendanceDeduction,

    netSalary,

    payableSalary: netSalary,

    /*
          OT SNAPSHOT
        */

    otHours: Number(otHours || 0),

    otRate: Number(otRate || 0),

    otAmount: calculatedOTAmount,

    finalPayableSalary,

    status: "draft",

    remarks: remarks || "",

    isLocked: false,

    auditLogs: [
      {
        action: "generated",

        fromStatus: null,

        toStatus: "draft",

        actionBy:
          actionBy && mongoose.isValidObjectId(actionBy)
            ? new mongoose.Types.ObjectId(actionBy)
            : null,

        actionAt: new Date(),

        note: "Payroll generated",
      },
    ],

    snapshot: {
      employee: {
        employeeDbId: employeeData?._id?.toString?.(),

        employeeId: employeeData?.employeeId || "",

        employeeName: [
          employeeData?.name?.firstName || "",

          employeeData?.name?.middleName || "",

          employeeData?.name?.lastName || "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim(),

        company: employeeData?.company
          ? {
              id: (employeeData.company as any)?._id?.toString?.() || "",

              name: (employeeData.company as any)?.name || "",
            }
          : null,

        branch: employeeData?.branch
          ? {
              id: (employeeData.branch as any)?._id?.toString?.() || "",

              name: (employeeData.branch as any)?.name || "",
            }
          : null,

        department: employeeData?.department
          ? {
              id: (employeeData.department as any)?._id?.toString?.() || "",

              name: (employeeData.department as any)?.name || "",
            }
          : null,

        designation: employeeData?.designation
          ? {
              id: (employeeData.designation as any)?._id?.toString?.() || "",

              name: (employeeData.designation as any)?.name || "",
            }
          : null,

        employmentStatus: employeeData?.employmentStatus || "",

        joiningDate: employeeData?.joiningDate || null,
      },

      salary: {
        grossSalary,

        fixedDeduction,

        attendanceDeduction,

        netSalary,

        payableSalary: netSalary,

        /*
              OT SNAPSHOT
            */

        otHours: Number(otHours || 0),

        otRate: Number(otRate || 0),

        otAmount: calculatedOTAmount,

        finalPayableSalary,

        salaryStructureId: salaryStructure?._id?.toString?.() || "",
      },

      payment: employeeBankInfo
        ? {
            paymentMode: employeeBankInfo.paymentMode || null,

            bankName: employeeBankInfo.bankName || null,

            bankBranchName: employeeBankInfo.bankBranchName || null,

            bankBranchCode: employeeBankInfo.bankBranchCode || null,

            accountName: employeeBankInfo.accountName || null,

            accountNo: employeeBankInfo.accountNo || null,

            routingNo: employeeBankInfo.routingNo || null,

            mobileBankingNo: employeeBankInfo.mobileBankingNo || null,
          }
        : null,
    },

    isDeleted: false,
  });

  return payroll;
};

const processPayrollIntoDB = async (id: string, actionBy?: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payroll) {
    throw new AppError(404, "Payroll not found");
  }

  if (payroll.isLocked) {
    throw new AppError(400, "Locked payroll cannot be processed");
  }

  const previousStatus = payroll.status;

  payroll.status = "processed";

  addPayrollAuditLog({
    payroll,

    action: "processed",

    fromStatus: previousStatus,

    toStatus: "processed",

    actionBy,

    note: "Payroll processed",
  });

  await payroll.save();

  return payroll;
};

const approvePayrollIntoDB = async (id: string, actionBy?: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payroll) {
    throw new AppError(404, "Payroll not found");
  }

  if (payroll.status !== "processed") {
    throw new AppError(400, "Only processed payroll can be approved");
  }

  const previousStatus = payroll.status;

  payroll.status = "approved";

  payroll.approvedBy =
    actionBy && mongoose.isValidObjectId(actionBy)
      ? new mongoose.Types.ObjectId(actionBy)
      : null;

  payroll.approvedAt = new Date();

  addPayrollAuditLog({
    payroll,

    action: "approved",

    fromStatus: previousStatus,

    toStatus: "approved",

    actionBy,

    note: "Payroll approved",
  });

  await payroll.save();

  return payroll;
};

const lockPayrollIntoDB = async (id: string, actionBy?: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payroll) {
    throw new AppError(404, "Payroll not found");
  }

  payroll.isLocked = true;

  payroll.lockedBy =
    actionBy && mongoose.isValidObjectId(actionBy)
      ? new mongoose.Types.ObjectId(actionBy)
      : null;

  payroll.lockedAt = new Date();

  addPayrollAuditLog({
    payroll,

    action: "locked",

    fromStatus: payroll.status,

    toStatus: payroll.status,

    actionBy,

    note: "Payroll locked",
  });

  await payroll.save();

  return payroll;
};

const getAllPayrollFromDB = async () => {
  return Payroll.find({
    isDeleted: false,
  })
    .populate("employee")
    .populate("salaryStructure")
    .sort({
      createdAt: -1,
    });
};

const getSinglePayrollFromDB = async (id: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("salaryStructure");

  if (!payroll) {
    throw new AppError(404, "Payroll not found");
  }

  return payroll;
};

const getPayrollAuditTimelineFromDB = async (id: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("auditLogs.actionBy")
    .populate("employee");

  if (!payroll) {
    throw new AppError(404, "Payroll not found");
  }

  return {
    payrollId: payroll?._id,

    employee: payroll?.employee,

    payrollMonth: payroll?.payrollMonth,

    status: payroll?.status,

    auditLogs: payroll?.auditLogs || [],
  };
};

export const PayrollServices = {
  /*
    CREATE
  */

  createPayrollIntoDB,

  /*
    CONTROLLER COMPATIBILITY
  */

  processPayrollByIdFromDB: processPayrollIntoDB,

  approvePayrollByIdFromDB: approvePayrollIntoDB,

  lockPayrollByIdFromDB: lockPayrollIntoDB,

  /*
    TEMP PLACEHOLDER METHODS
  */

  async markPayrollAsPaidFromDB() {
    throw new AppError(501, "markPayrollAsPaidFromDB is not implemented yet.");
  },

  async unlockPayrollByIdFromDB() {
    throw new AppError(501, "unlockPayrollByIdFromDB is not implemented yet.");
  },

  async approveMonthlyPayrollBatchFromDB() {
    throw new AppError(
      501,
      "approveMonthlyPayrollBatchFromDB is not implemented yet.",
    );
  },

  async lockMonthlyPayrollBatchFromDB() {
    throw new AppError(
      501,
      "lockMonthlyPayrollBatchFromDB is not implemented yet.",
    );
  },

  async updatePayrollByIdFromDB() {
    throw new AppError(501, "updatePayrollByIdFromDB is not implemented yet.");
  },

  /*
    READ
  */

  getAllPayrollFromDB,

  getSinglePayrollFromDB,

  getPayrollAuditTimelineFromDB,
};

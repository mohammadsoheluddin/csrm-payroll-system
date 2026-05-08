import { Types } from "mongoose";

import AppError from "../../errors/AppError";

import Employee from "../employee/employee.model";

import SalaryStructure from "../salaryStructure/salaryStructure.model";

import { EmployeeMovement } from "./employeeMovement.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
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

const createMovementSnapshot = async ({
  employee,
  movementType,
  payload,
}: {
  employee: any;
  movementType: string;
  payload: any;
}) => {
  const activeSalaryStructure = await SalaryStructure.findOne({
    employee: employee._id,
    isActive: true,
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });

  return {
    employeeId: employee?.employeeId || "",

    employeeName: getEmployeeFullName(employee),

    company: employee?.company
      ? {
          id: employee?.company?._id?.toString?.() || "",

          name: employee?.company?.name || "",
        }
      : null,

    fromDepartment: employee?.department
      ? {
          id: employee?.department?._id?.toString?.() || "",

          name: employee?.department?.name || "",
        }
      : null,

    toDepartment: payload?.snapshot?.toDepartment || null,

    fromDesignation: employee?.designation
      ? {
          id: employee?.designation?._id?.toString?.() || "",

          name: employee?.designation?.name || "",
        }
      : null,

    toDesignation: payload?.snapshot?.toDesignation || null,

    fromBranch: employee?.branch
      ? {
          id: employee?.branch?._id?.toString?.() || "",

          name: employee?.branch?.name || "",
        }
      : null,

    toBranch: payload?.snapshot?.toBranch || null,

    fromSalary: activeSalaryStructure
      ? {
          grossSalary: Number(activeSalaryStructure?.grossSalary || 0),

          basicSalary: Number(activeSalaryStructure?.basicSalary || 0),

          netSalary: Number(activeSalaryStructure?.netSalary || 0),
        }
      : null,

    toSalary: payload?.snapshot?.toSalary || null,
  };
};

const createEmployeeMovementIntoDB = async (
  payload: any,
  actionBy?: string,
) => {
  if (!payload?.employee) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Employee is required.");
  }

  if (!Types.ObjectId.isValid(payload.employee)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid employee id.");
  }

  const employee = await Employee.findOne({
    _id: payload.employee,
    isDeleted: false,
  })
    .populate("company")
    .populate("branch")
    .populate("department")
    .populate("designation");

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found.");
  }

  const snapshot = await createMovementSnapshot({
    employee,
    movementType: payload.movementType,
    payload,
  });

  const movement = await EmployeeMovement.create({
    employee: employee._id,

    movementType: payload.movementType,

    effectiveDate: new Date(payload.effectiveDate),

    reason: payload.reason || "",

    remarks: payload.remarks || "",

    referenceNo: payload.referenceNo || "",

    snapshot,

    status: "draft",

    approvedBy: null,

    approvedAt: null,

    appliedBy: null,

    appliedAt: null,

    auditLogs: [
      {
        action: "created",

        fromStatus: null,

        toStatus: "draft",

        actionBy: actionBy || null,

        actionAt: new Date(),

        note: `${payload.movementType} movement created.`,
      },
    ],

    isDeleted: false,
  });

  return movement;
};

const getAllEmployeeMovementsFromDB = async () => {
  return EmployeeMovement.find({
    isDeleted: false,
  })
    .populate("employee")
    .populate("approvedBy")
    .populate("appliedBy")
    .sort({
      createdAt: -1,
    });
};

const getSingleEmployeeMovementFromDB = async (id: string) => {
  const movement = await EmployeeMovement.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("approvedBy")
    .populate("appliedBy");

  if (!movement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee movement not found.");
  }

  return movement;
};

export const EmployeeMovementService = {
  createEmployeeMovementIntoDB,

  getAllEmployeeMovementsFromDB,

  getSingleEmployeeMovementFromDB,
};

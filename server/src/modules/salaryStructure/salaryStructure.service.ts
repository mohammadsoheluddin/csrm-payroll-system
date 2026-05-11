import mongoose from "mongoose";

import AppError from "../../errors/AppError";

import SalaryStructure from "./salaryStructure.model";

import { TSalaryStructure } from "./salaryStructure.interface";

import Employee from "../employee/employee.model";

import { createFinancialRecordSoftDeleteHandlers } from "../../common/financialRecordSoftDelete";
const calculateSalaryFields = (payload: Partial<TSalaryStructure>) => {
  const basicSalary = payload.basicSalary || 0;

  const houseRent = payload.houseRent || 0;

  const medicalAllowance = payload.medicalAllowance || 0;

  const transportAllowance = payload.transportAllowance || 0;

  const otherAllowance = payload.otherAllowance || 0;

  const taxDeduction = payload.taxDeduction || 0;

  const providentFund = payload.providentFund || 0;

  const loanDeduction = payload.loanDeduction || 0;

  const otherDeduction = payload.otherDeduction || 0;

  const grossSalary =
    basicSalary +
    houseRent +
    medicalAllowance +
    transportAllowance +
    otherAllowance;

  const totalDeduction =
    taxDeduction + providentFund + loanDeduction + otherDeduction;

  const netSalary = grossSalary - totalDeduction;

  return {
    grossSalary,

    totalDeduction,

    netSalary,
  };
};

const createSalaryStructureIntoDB = async (payload: TSalaryStructure) => {
  if (!mongoose.isValidObjectId(payload.employee)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const isEmployeeExists = await Employee.findOne({
    _id: payload.employee,
    isDeleted: false,
  });

  if (!isEmployeeExists) {
    throw new AppError(404, "Employee not found");
  }

  const existingActiveStructure = await SalaryStructure.findOne({
    employee: payload.employee,
    isDeleted: false,
    isActive: true,
  });

  if (existingActiveStructure && payload.isActive !== false) {
    throw new AppError(
      409,
      "Active salary structure already exists for this employee",
    );
  }

  const calculatedFields = calculateSalaryFields(payload);

  const result = await SalaryStructure.create({
    ...payload,
    ...calculatedFields,
  });

  const populatedResult = await SalaryStructure.findById(result._id).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  return populatedResult;
};

const getAllSalaryStructureFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.employee) {
    filter.employee = query.employee;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.effectiveFrom) {
    filter.effectiveFrom = query.effectiveFrom;
  }

  const result = await SalaryStructure.find(filter)
    .populate({
      path: "employee",
      populate: [{ path: "branch" }, { path: "department" }],
    })
    .sort({
      createdAt: -1,
    });

  return result;
};

const getSingleSalaryStructureFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid salary structure ID");
  }

  const result = await SalaryStructure.findOne({
    _id: id,
    isDeleted: false,
  }).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  if (!result) {
    throw new AppError(404, "Salary structure not found");
  }

  return result;
};

const getSalaryStructureHistoryFromDB = async (employeeId: string) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError(400, "Invalid employee ID");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  const salaryHistory = await SalaryStructure.find({
    employee: employeeId,
    isDeleted: false,
  })
    .populate({
      path: "employee",
      populate: [
        { path: "branch" },
        { path: "department" },
        { path: "designation" },
      ],
    })
    .sort({
      effectiveFrom: 1,
      createdAt: 1,
    });

  return salaryHistory.map((item: any) => ({
    salaryStructureId: item?._id?.toString(),

    effectiveFrom: item?.effectiveFrom,

    basicSalary: item?.basicSalary || 0,

    grossSalary: item?.grossSalary || 0,

    totalDeduction: item?.totalDeduction || 0,

    netSalary: item?.netSalary || 0,

    houseRent: item?.houseRent || 0,

    medicalAllowance: item?.medicalAllowance || 0,

    transportAllowance: item?.transportAllowance || 0,

    otherAllowance: item?.otherAllowance || 0,

    taxDeduction: item?.taxDeduction || 0,

    providentFund: item?.providentFund || 0,

    loanDeduction: item?.loanDeduction || 0,

    otherDeduction: item?.otherDeduction || 0,

    isActive: item?.isActive || false,

    remarks: item?.remarks || "",

    createdAt: item?.createdAt,
  }));
};

const updateSalaryStructureIntoDB = async (
  id: string,
  payload: Partial<TSalaryStructure>,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid salary structure ID");
  }

  const existingStructure = await SalaryStructure.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingStructure) {
    throw new AppError(404, "Salary structure not found");
  }

  if (payload.employee) {
    if (!mongoose.isValidObjectId(payload.employee)) {
      throw new AppError(400, "Invalid employee ID");
    }

    const isEmployeeExists = await Employee.findOne({
      _id: payload.employee,
      isDeleted: false,
    });

    if (!isEmployeeExists) {
      throw new AppError(404, "Employee not found");
    }
  }

  const mergedPayload = {
    employee: payload.employee ?? existingStructure.employee,

    basicSalary: payload.basicSalary ?? existingStructure.basicSalary,

    houseRent: payload.houseRent ?? existingStructure.houseRent,

    medicalAllowance:
      payload.medicalAllowance ?? existingStructure.medicalAllowance,

    transportAllowance:
      payload.transportAllowance ?? existingStructure.transportAllowance,

    otherAllowance: payload.otherAllowance ?? existingStructure.otherAllowance,

    taxDeduction: payload.taxDeduction ?? existingStructure.taxDeduction,

    providentFund: payload.providentFund ?? existingStructure.providentFund,

    loanDeduction: payload.loanDeduction ?? existingStructure.loanDeduction,

    otherDeduction: payload.otherDeduction ?? existingStructure.otherDeduction,
  };

  const calculatedFields = calculateSalaryFields(mergedPayload);

  if (payload.isActive === true) {
    const anotherActiveStructure = await SalaryStructure.findOne({
      employee: payload.employee ?? existingStructure.employee,

      isDeleted: false,

      isActive: true,

      _id: {
        $ne: id,
      },
    });

    if (anotherActiveStructure) {
      throw new AppError(
        409,
        "Another active salary structure already exists for this employee",
      );
    }
  }

  const result = await SalaryStructure.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...payload,
      ...calculatedFields,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate({
    path: "employee",
    populate: [{ path: "branch" }, { path: "department" }],
  });

  if (!result) {
    throw new AppError(404, "Salary structure not found");
  }

  return result;
};

const deleteSalaryStructureFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid salary structure ID");
  }

  const result = await SalaryStructure.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Salary structure not found");
  }

  return result;
};


const {
  getDeletedRecordsFromDB: getDeletedSalaryStructuresFromDB,
  softDeleteRecordFromDB: softDeleteSalaryStructureFromDB,
  restoreRecordIntoDB: restoreSalaryStructureIntoDB,
} = createFinancialRecordSoftDeleteHandlers({
  model: SalaryStructure,
  recordName: "Salary Structure",
  queryFields: ['employee', 'isActive', 'effectiveFrom'],
  restoreUniqueFields: ['employee', 'effectiveFrom'],
});

export const SalaryStructureServices = {
  createSalaryStructureIntoDB,

  getAllSalaryStructureFromDB,

  getSingleSalaryStructureFromDB,

  getSalaryStructureHistoryFromDB,

  updateSalaryStructureIntoDB,

  getDeletedSalaryStructuresFromDB,

  deleteSalaryStructureFromDB: softDeleteSalaryStructureFromDB,

  restoreSalaryStructureIntoDB,
};

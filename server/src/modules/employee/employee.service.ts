import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Branch from "../branch/branch.model";
import Company from "../company/company.model";
import Department from "../department/department.model";
import Designation from "../designation/designation.model";
import MajorDepartment from "../majorDepartment/majorDepartment.model";
import User from "../user/user.model";
import {
  TEmployee,
  TEmployeeStatus,
  TEmploymentStatus,
  TPayType,
  TServiceType,
} from "./employee.interface";
import Employee from "./employee.model";

type TEmployeeDBQuery = {
  isDeleted: boolean;
  status?: TEmployeeStatus;
  employmentStatus?: TEmploymentStatus;
  serviceType?: TServiceType;
  payType?: TPayType;
  company?: string;
  majorDepartment?: string;
  department?: string;
  designation?: string;
  branch?: string;
};

type TEmployeeQueryFilters = {
  status?: string;
  employmentStatus?: string;
  serviceType?: string;
  payType?: string;
  company?: string;
  majorDepartment?: string;
  department?: string;
  designation?: string;
  branch?: string;
};

type TEmployeeReferencePayload = Pick<
  TEmployee,
  "company" | "majorDepartment" | "department" | "designation" | "branch"
>;

type TActiveDuplicateCondition = {
  officeId?: string;
  cardNo?: string;
};

const validateObjectId = (id: unknown, fieldName: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }
};

const validateConfirmationDate = (
  joiningDate?: string,
  confirmationDate?: string,
) => {
  if (!joiningDate || !confirmationDate) {
    return;
  }

  const joining = new Date(joiningDate);
  const confirmation = new Date(confirmationDate);

  if (confirmation < joining) {
    throw new AppError(400, "Confirmation date cannot be before joining date");
  }
};

const validateUserReference = async (user?: unknown) => {
  if (!user) {
    return;
  }

  validateObjectId(user, "user ID");

  const isUserExists = await User.findOne({
    _id: user,
    isDeleted: false,
  });

  if (!isUserExists) {
    throw new AppError(404, "User not found");
  }
};

const validateEmployeeReferences = async (
  references: TEmployeeReferencePayload,
) => {
  validateObjectId(references.company, "company ID");
  validateObjectId(references.majorDepartment, "major department ID");
  validateObjectId(references.department, "department ID");
  validateObjectId(references.designation, "designation ID");
  validateObjectId(references.branch, "branch ID");

  const companyId = String(references.company);
  const majorDepartmentId = String(references.majorDepartment);
  const departmentId = String(references.department);
  const designationId = String(references.designation);
  const branchId = String(references.branch);

  const isCompanyExists = await Company.findOne({
    _id: companyId,
    isDeleted: false,
    status: "active",
  });

  if (!isCompanyExists) {
    throw new AppError(404, "Company not found");
  }

  const isMajorDepartmentExists = await MajorDepartment.findOne({
    _id: majorDepartmentId,
    company: companyId,
    isDeleted: false,
    status: "active",
  });

  if (!isMajorDepartmentExists) {
    throw new AppError(404, "Major department not found under this company");
  }

  const isDepartmentExists = await Department.findOne({
    _id: departmentId,
    company: companyId,
    majorDepartment: majorDepartmentId,
    isDeleted: false,
    status: "active",
  });

  if (!isDepartmentExists) {
    throw new AppError(
      404,
      "Department not found under this company and major department",
    );
  }

  const isDesignationExists = await Designation.findOne({
    _id: designationId,
    company: companyId,
    isDeleted: false,
    status: "active",
  });

  if (!isDesignationExists) {
    throw new AppError(404, "Designation not found under this company");
  }

  const isBranchExists = await Branch.findOne({
    _id: branchId,
    isDeleted: false,
    status: "active",
  });

  if (!isBranchExists) {
    throw new AppError(404, "Branch not found");
  }
};

const ensureEmployeeUniqueOnCreate = async (payload: Partial<TEmployee>) => {
  if (payload.employeeId) {
    const existingEmployeeByEmployeeId = await Employee.findOne({
      employeeId: payload.employeeId,
    });

    if (existingEmployeeByEmployeeId) {
      throw new AppError(
        409,
        "Employee ID already exists. Employee ID is permanent and cannot be reused",
      );
    }
  }

  if (payload.email) {
    const existingEmployeeByEmail = await Employee.findOne({
      email: payload.email,
    });

    if (existingEmployeeByEmail) {
      throw new AppError(
        409,
        "Another employee already exists with this email",
      );
    }
  }

  const activeDuplicateConditions: TActiveDuplicateCondition[] = [];

  if (payload.officeId) {
    activeDuplicateConditions.push({
      officeId: payload.officeId,
    });
  }

  if (payload.cardNo) {
    activeDuplicateConditions.push({
      cardNo: payload.cardNo,
    });
  }

  if (!activeDuplicateConditions.length) {
    return;
  }

  const existingActiveEmployee = await Employee.findOne({
    isDeleted: false,
    $or: activeDuplicateConditions,
  });

  if (!existingActiveEmployee) {
    return;
  }

  if (
    payload.officeId &&
    existingActiveEmployee.officeId === payload.officeId
  ) {
    throw new AppError(
      409,
      "Another active employee already exists with this office ID",
    );
  }

  if (payload.cardNo && existingActiveEmployee.cardNo === payload.cardNo) {
    throw new AppError(
      409,
      "Another active employee already exists with this card no",
    );
  }

  throw new AppError(409, "Employee already exists with duplicate information");
};

const ensureEmployeeUniqueOnUpdate = async (
  payload: Partial<TEmployee>,
  employeeMongoId: string,
) => {
  if (payload.email) {
    const existingEmployeeByEmail = await Employee.findOne({
      email: payload.email,
      _id: {
        $ne: employeeMongoId,
      },
    });

    if (existingEmployeeByEmail) {
      throw new AppError(
        409,
        "Another employee already exists with this email",
      );
    }
  }

  const activeDuplicateConditions: TActiveDuplicateCondition[] = [];

  if (payload.officeId) {
    activeDuplicateConditions.push({
      officeId: payload.officeId,
    });
  }

  if (payload.cardNo) {
    activeDuplicateConditions.push({
      cardNo: payload.cardNo,
    });
  }

  if (!activeDuplicateConditions.length) {
    return;
  }

  const existingActiveEmployee = await Employee.findOne({
    _id: {
      $ne: employeeMongoId,
    },
    isDeleted: false,
    $or: activeDuplicateConditions,
  });

  if (!existingActiveEmployee) {
    return;
  }

  if (
    payload.officeId &&
    existingActiveEmployee.officeId === payload.officeId
  ) {
    throw new AppError(
      409,
      "Another active employee already exists with this office ID",
    );
  }

  if (payload.cardNo && existingActiveEmployee.cardNo === payload.cardNo) {
    throw new AppError(
      409,
      "Another active employee already exists with this card no",
    );
  }

  throw new AppError(409, "Employee already exists with duplicate information");
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
];

const createEmployeeIntoDB = async (payload: TEmployee) => {
  await validateUserReference(payload.user);

  await validateEmployeeReferences({
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    designation: payload.designation,
    branch: payload.branch,
  });

  validateConfirmationDate(payload.joiningDate, payload.confirmationDate);

  await ensureEmployeeUniqueOnCreate({
    employeeId: payload.employeeId,
    email: payload.email,
    officeId: payload.officeId,
    cardNo: payload.cardNo,
  });

  const result = await Employee.create(payload);

  const populatedResult = await Employee.findById(result._id).populate(
    populateEmployeeQuery(),
  );

  return populatedResult;
};

const getAllEmployeesFromDB = async (filters: TEmployeeQueryFilters = {}) => {
  const query: TEmployeeDBQuery = {
    isDeleted: false,
  };

  if (filters.status) {
    query.status = filters.status as TEmployeeStatus;
  }

  if (filters.employmentStatus) {
    query.employmentStatus = filters.employmentStatus as TEmploymentStatus;
  }

  if (filters.serviceType) {
    query.serviceType = filters.serviceType as TServiceType;
  }

  if (filters.payType) {
    query.payType = filters.payType as TPayType;
  }

  if (filters.company) {
    query.company = filters.company;
  }

  if (filters.majorDepartment) {
    query.majorDepartment = filters.majorDepartment;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.designation) {
    query.designation = filters.designation;
  }

  if (filters.branch) {
    query.branch = filters.branch;
  }

  const result = await Employee.find(query).populate(populateEmployeeQuery());

  return result;
};

const getSingleEmployeeFromDB = async (id: string) => {
  validateObjectId(id, "employee ID");

  const result = await Employee.findOne({
    _id: id,
    isDeleted: false,
  }).populate(populateEmployeeQuery());

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const updateEmployeeIntoDB = async (
  id: string,
  payload: Partial<TEmployee>,
) => {
  validateObjectId(id, "employee ID");

  const existingEmployee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingEmployee) {
    throw new AppError(404, "Employee not found");
  }

  await validateUserReference(payload.user);

  await validateEmployeeReferences({
    company: payload.company ?? existingEmployee.company,
    majorDepartment:
      payload.majorDepartment ?? existingEmployee.majorDepartment,
    department: payload.department ?? existingEmployee.department,
    designation: payload.designation ?? existingEmployee.designation,
    branch: payload.branch ?? existingEmployee.branch,
  });

  validateConfirmationDate(
    payload.joiningDate ?? existingEmployee.joiningDate,
    payload.confirmationDate ?? existingEmployee.confirmationDate,
  );

  await ensureEmployeeUniqueOnUpdate(
    {
      email: payload.email,
      officeId: payload.officeId,
      cardNo: payload.cardNo,
    },
    id,
  );

  const result = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeQuery());

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

const deleteEmployeeFromDB = async (id: string) => {
  validateObjectId(id, "employee ID");

  const result = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
      status: "inactive",
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  return result;
};

export const EmployeeServices = {
  createEmployeeIntoDB,
  getAllEmployeesFromDB,
  getSingleEmployeeFromDB,
  updateEmployeeIntoDB,
  deleteEmployeeFromDB,
};

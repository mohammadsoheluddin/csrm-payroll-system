import mongoose from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  getObjectIdStringOrThrow,
  normalizeSoftDeleteReason,
  TRestoreRequestBody,
  TSoftDeleteRequestBody,
  TSoftDeleteRequestUser,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Branch from "../branch/branch.model";
import Company from "../company/company.model";
import Department from "../department/department.model";
import Designation from "../designation/designation.model";
import MajorDepartment from "../majorDepartment/majorDepartment.model";
import { AuditLogServices } from "../auditLog/auditLog.service";
import User from "../user/user.model";
import {
  TEmployee,
  TEmployeeLifecyclePayload,
  TEmployeeStatus,
  TEmploymentStatus,
  TPayType,
  TServiceType,
} from "./employee.interface";
import Employee from "./employee.model";

type TEmployeeDBQuery = {
  isDeleted: boolean | Record<string, boolean>;
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

type TEmployeeActor = TSoftDeleteRequestUser | undefined;

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

const buildEmployeeEntityName = (employee: Partial<TEmployee>) => {
  const fullName = employee.name
    ? [employee.name.firstName, employee.name.middleName, employee.name.lastName]
        .filter(Boolean)
        .join(" ")
    : "Employee";

  return `${employee.employeeId || "EMPLOYEE"} - ${fullName}`;
};

const getActorObjectId = (actor?: TEmployeeActor) => {
  if (!actor?.userId || !mongoose.isValidObjectId(actor.userId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(actor.userId);
};

const getEmployeeStatusFromEmploymentStatus = (
  employmentStatus: TEmploymentStatus,
): TEmployeeStatus => {
  if (["active", "probation", "confirmed"].includes(employmentStatus)) {
    return "active";
  }

  return "inactive";
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
  const companyId = getObjectIdStringOrThrow(references.company, "company ID");
  const majorDepartmentId = getObjectIdStringOrThrow(
    references.majorDepartment,
    "major department ID",
  );
  const departmentId = getObjectIdStringOrThrow(
    references.department,
    "department ID",
  );
  const designationId = getObjectIdStringOrThrow(
    references.designation,
    "designation ID",
  );
  const branchId = getObjectIdStringOrThrow(references.branch, "branch ID");

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

const ensureEmployeeUniqueOnRestore = async (employee: TEmployee & { _id?: unknown }) => {
  const activeDuplicateConditions: TActiveDuplicateCondition[] = [];

  if (employee.officeId) {
    activeDuplicateConditions.push({ officeId: employee.officeId });
  }

  if (employee.cardNo) {
    activeDuplicateConditions.push({ cardNo: employee.cardNo });
  }

  if (!activeDuplicateConditions.length) {
    return;
  }

  const existingActiveEmployee = await Employee.findOne({
    _id: {
      $ne: employee._id,
    },
    isDeleted: false,
    $or: activeDuplicateConditions,
  });

  if (!existingActiveEmployee) {
    return;
  }

  throw new AppError(
    409,
    "Cannot restore employee because office ID or card no is already used by another active employee",
  );
};

const appendEmployeeFilters = (
  query: TEmployeeDBQuery,
  filters: TEmployeeQueryFilters = {},
) => {
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
    path: "deletedBy",
    select: "name email role",
  },
  {
    path: "restoredBy",
    select: "name email role",
  },
  {
    path: "lifecycleChangedBy",
    select: "name email role",
  },
];

const writeEmployeeAuditLog = async (options: {
  action: "create" | "update" | "soft_delete" | "restore" | "status_change";
  description: string;
  employee: Partial<TEmployee> & { _id?: unknown };
  actor?: TEmployeeActor;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}) => {
  await AuditLogServices.createAuditLogSafely({
    actorId: options.actor?.userId,
    actorEmail: options.actor?.email,
    actorRole: options.actor?.role as any,
    module: "employee",
    action: options.action,
    entityId: options.employee._id ? String(options.employee._id) : undefined,
    entityName: buildEmployeeEntityName(options.employee),
    description: options.description,
    previousData: options.previousData,
    newData: options.newData,
    metadata: options.metadata,
  });
};

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

  if (payload.employmentStatus) {
    payload.status = getEmployeeStatusFromEmploymentStatus(payload.employmentStatus);
  }

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

  appendEmployeeFilters(query, filters);

  const result = await Employee.find(query).populate(populateEmployeeQuery());

  return result;
};

const getDeletedEmployeesFromDB = async (filters: TEmployeeQueryFilters = {}) => {
  const query = buildDeletedFilter<TEmployee>() as TEmployeeDBQuery;

  appendEmployeeFilters(query, filters);

  const result = await Employee.find(query)
    .sort({ deletedAt: -1, updatedAt: -1 })
    .populate(populateEmployeeQuery());

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

const changeEmployeeLifecycleIntoDB = async (
  id: string,
  payload: TEmployeeLifecyclePayload,
  actor?: TEmployeeActor,
) => {
  validateObjectId(id, "employee ID");

  const existingEmployee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingEmployee) {
    throw new AppError(404, "Employee not found");
  }

  if (existingEmployee.employmentStatus === payload.employmentStatus) {
    throw new AppError(
      400,
      "Employee already has the requested employment status",
    );
  }

  const previousData = existingEmployee.toObject();
  const actorObjectId = getActorObjectId(actor);
  const calculatedStatus = getEmployeeStatusFromEmploymentStatus(
    payload.employmentStatus,
  );
  const normalizedReason = normalizeSoftDeleteReason(payload.reason);
  const effectiveDate = payload.effectiveDate || new Date().toISOString().slice(0, 10);
  const isSeparated = [
    "resigned",
    "terminated",
    "retired",
    "suspended",
  ].includes(payload.employmentStatus);

  const updatePayload: Partial<TEmployee> = {
    employmentStatus: payload.employmentStatus,
    status: calculatedStatus,
    lifecycleChangedAt: new Date(),
    lifecycleChangedBy: actorObjectId,
    lifecycleChangeReason: normalizedReason,
    lifecycleEffectiveDate: effectiveDate,
    updatedBy: actorObjectId,
  };

  if (isSeparated) {
    updatePayload.separatedAt = effectiveDate;
    updatePayload.separationReason = normalizedReason;
  } else {
    updatePayload.separatedAt = null;
    updatePayload.separationReason = null;
  }

  const result = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: updatePayload,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeQuery());

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  await writeEmployeeAuditLog({
    action: "status_change",
    description: "Employee lifecycle updated",
    employee: result,
    actor,
    previousData: previousData as unknown as Record<string, unknown>,
    newData: result.toObject() as unknown as Record<string, unknown>,
    metadata: {
      previousEmploymentStatus: previousData.employmentStatus,
      newEmploymentStatus: payload.employmentStatus,
      previousStatus: previousData.status,
      newStatus: calculatedStatus,
      effectiveDate,
      reason: normalizedReason,
    },
  });

  return result;
};

const deleteEmployeeFromDB = async (
  id: string,
  payload: TSoftDeleteRequestBody,
  actor?: TEmployeeActor,
) => {
  validateObjectId(id, "employee ID");

  const existingEmployee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingEmployee) {
    throw new AppError(404, "Employee not found");
  }

  const previousData = existingEmployee.toObject();
  const softDeleteUpdate = buildSoftDeleteUpdate<TEmployee>({
    userId: actor?.userId,
    deleteReason: payload.deleteReason,
  });

  const result = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...softDeleteUpdate,
      $set: {
        ...softDeleteUpdate.$set,
        status: "inactive",
        statusBeforeDelete: existingEmployee.status || "active",
        employmentStatusBeforeDelete:
          existingEmployee.employmentStatus || "active",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeQuery());

  if (!result) {
    throw new AppError(404, "Employee not found");
  }

  await writeEmployeeAuditLog({
    action: "soft_delete",
    description: "Employee soft deleted",
    employee: result,
    actor,
    previousData: previousData as unknown as Record<string, unknown>,
    newData: result.toObject() as unknown as Record<string, unknown>,
    metadata: {
      deleteReason: normalizeSoftDeleteReason(payload.deleteReason),
      note:
        "Employee ID remains permanently reserved. Soft delete does not allow employeeId reuse.",
    },
  });

  return result;
};

const restoreEmployeeIntoDB = async (
  id: string,
  payload: TRestoreRequestBody,
  actor?: TEmployeeActor,
) => {
  validateObjectId(id, "employee ID");

  const existingEmployee = await Employee.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!existingEmployee) {
    throw new AppError(404, "Deleted employee not found");
  }

  await validateEmployeeReferences({
    company: existingEmployee.company,
    majorDepartment: existingEmployee.majorDepartment,
    department: existingEmployee.department,
    designation: existingEmployee.designation,
    branch: existingEmployee.branch,
  });

  await ensureEmployeeUniqueOnRestore(existingEmployee as unknown as TEmployee & { _id?: unknown });

  const previousData = existingEmployee.toObject();
  const restoredStatus = existingEmployee.statusBeforeDelete || "inactive";
  const restoredEmploymentStatus =
    existingEmployee.employmentStatusBeforeDelete ||
    existingEmployee.employmentStatus ||
    "active";

  const restoreUpdate = buildRestoreUpdate<TEmployee>({
    userId: actor?.userId,
    restoreReason: payload.restoreReason,
  });

  const result = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: true,
    },
    {
      ...restoreUpdate,
      $set: {
        ...restoreUpdate.$set,
        status: restoredStatus,
        employmentStatus: restoredEmploymentStatus,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeQuery());

  if (!result) {
    throw new AppError(404, "Deleted employee not found");
  }

  await writeEmployeeAuditLog({
    action: "restore",
    description: "Employee restored",
    employee: result,
    actor,
    previousData: previousData as unknown as Record<string, unknown>,
    newData: result.toObject() as unknown as Record<string, unknown>,
    metadata: {
      restoreReason: normalizeSoftDeleteReason(payload.restoreReason),
      restoredStatus,
      restoredEmploymentStatus,
    },
  });

  return result;
};

export const EmployeeServices = {
  createEmployeeIntoDB,
  getAllEmployeesFromDB,
  getDeletedEmployeesFromDB,
  getSingleEmployeeFromDB,
  updateEmployeeIntoDB,
  changeEmployeeLifecycleIntoDB,
  restoreEmployeeIntoDB,
  deleteEmployeeFromDB,
};

import mongoose from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  getObjectIdStringOrThrow,
  toObjectIdOrNull,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import Employee from "../employee/employee.model";
import {
  TEmployeeDocument,
  TEmployeeDocumentQuery,
} from "./employeeDocument.interface";
import EmployeeDocument from "./employeeDocument.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

type TObject = Record<string, any>;

type TActorOptions = {
  userId?: string;
  deleteReason?: string;
  restoreReason?: string;
  remarks?: string;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const addDays = (dateString: string, days: number) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

const buildExpiryFilter = (
  expiryStatus?: TEmployeeDocumentQuery["expiryStatus"],
) => {
  if (!expiryStatus) {
    return {};
  }

  const today = getTodayDate();
  const soonDate = addDays(today, 30);

  if (expiryStatus === "expired") {
    return {
      expiryDate: { $exists: true, $ne: "", $lt: today },
    };
  }

  if (expiryStatus === "expiring_soon") {
    return {
      expiryDate: { $exists: true, $ne: "", $gte: today, $lte: soonDate },
    };
  }

  if (expiryStatus === "valid") {
    return {
      expiryDate: { $exists: true, $ne: "", $gt: soonDate },
    };
  }

  return {
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: "" },
      { expiryDate: null },
    ],
  };
};

const buildEmployeeDocumentQuery = (
  query: TEmployeeDocumentQuery = {},
  includeDeleted = false,
) => {
  const filter: Record<string, unknown> = includeDeleted
    ? buildDeletedFilter()
    : { isDeleted: { $ne: true } };

  if (query.employee) {
    filter.employee = query.employee;
  }

  if (query.company) {
    filter.company = query.company;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.confidentiality) {
    filter.confidentiality = query.confidentiality;
  }

  if (query.storageProvider) {
    filter.storageProvider = query.storageProvider;
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {
      ...(query.fromDate ? { $gte: new Date(`${query.fromDate}T00:00:00.000Z`) } : {}),
      ...(query.toDate ? { $lte: new Date(`${query.toDate}T23:59:59.999Z`) } : {}),
    };
  }

  if (query.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm, "i");
    filter.$or = [
      { title: searchRegex },
      { documentNo: searchRegex },
      { fileName: searchRegex },
      { originalFileName: searchRegex },
      { remarks: searchRegex },
      { tags: searchRegex },
    ];
  }

  return {
    ...filter,
    ...buildExpiryFilter(query.expiryStatus),
  };
};

const populateEmployeeDocumentQuery = () => [
  {
    path: "employee",
    select: "employeeId officeId cardNo name email phone company department designation status employmentStatus",
  },
  {
    path: "company",
  },
  {
    path: "uploadedBy",
    select: "name email role",
  },
  {
    path: "verifiedBy",
    select: "name email role",
  },
  {
    path: "rejectedBy",
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

const checkEmployeeAndCompany = async (payload: {
  employee?: unknown;
  company?: unknown;
}) => {
  const employeeId = getObjectIdStringOrThrow(payload.employee, "employee id");
  const companyId = getObjectIdStringOrThrow(payload.company, "company id");

  const [employee, company] = await Promise.all([
    Employee.findOne({ _id: employeeId, isDeleted: { $ne: true } }).lean<TObject>(),
    Company.findOne({ _id: companyId, isDeleted: { $ne: true } }).lean<TObject>(),
  ]);

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  if (!company) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Company not found");
  }

  if (String(employee.company) !== companyId) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Selected company does not match employee company",
    );
  }
};

const ensureNoDuplicateDocument = async (
  payload: Partial<TEmployeeDocument>,
  excludeId?: string,
) => {
  if (!payload.employee || !payload.category) {
    return;
  }

  const baseFilter: Record<string, unknown> = {
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    employee: payload.employee,
    category: payload.category,
    isDeleted: { $ne: true },
  };

  if (payload.documentNo) {
    const existingByDocumentNo = await EmployeeDocument.findOne({
      ...baseFilter,
      documentNo: payload.documentNo,
    });

    if (existingByDocumentNo) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Same document number already exists for this employee and category",
      );
    }
  }

  if (payload.fileName && payload.title) {
    const existingByFileAndTitle = await EmployeeDocument.findOne({
      ...baseFilter,
      fileName: payload.fileName,
      title: payload.title,
    });

    if (existingByFileAndTitle) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Same employee document title and file name already exists",
      );
    }
  }
};

const createEmployeeDocumentIntoDB = async (
  payload: TEmployeeDocument,
  actorOptions: TActorOptions = {},
) => {
  await checkEmployeeAndCompany(payload);
  await ensureNoDuplicateDocument(payload);

  const actorObjectId = toObjectIdOrNull(actorOptions.userId);

  const result = await EmployeeDocument.create({
    ...payload,
    uploadedBy: actorObjectId,
    isDeleted: false,
    verifiedAt: payload.status === "verified" ? new Date() : null,
    verifiedBy: payload.status === "verified" ? actorObjectId : null,
  });

  return result;
};

const getAllEmployeeDocumentsFromDB = async (
  query: TEmployeeDocumentQuery = {},
) => {
  const result = await EmployeeDocument.find(buildEmployeeDocumentQuery(query))
    .populate(populateEmployeeDocumentQuery())
    .sort({ createdAt: -1 });

  return result;
};

const getDeletedEmployeeDocumentsFromDB = async (
  query: TEmployeeDocumentQuery = {},
) => {
  const result = await EmployeeDocument.find(
    buildEmployeeDocumentQuery(query, true),
  )
    .populate(populateEmployeeDocumentQuery())
    .sort({ deletedAt: -1, createdAt: -1 });

  return result;
};

const getSingleEmployeeDocumentFromDB = async (id: string) => {
  const result = await EmployeeDocument.findOne({
    _id: id,
    isDeleted: { $ne: true },
  }).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  return result;
};

const getSingleDeletedEmployeeDocumentFromDB = async (id: string) => {
  const result = await EmployeeDocument.findOne({
    _id: id,
    isDeleted: true,
  }).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Deleted employee document not found",
    );
  }

  return result;
};

const getEmployeeDocumentsByEmployeeFromDB = async (
  employeeId: string,
  query: {
    category?: string;
    status?: string;
    includeDeleted?: string;
  } = {},
) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid employee id");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: { $ne: true },
  });

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  const filter: Record<string, unknown> = {
    employee: employeeId,
    ...(query.includeDeleted === "true" ? {} : { isDeleted: { $ne: true } }),
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const result = await EmployeeDocument.find(filter)
    .populate(populateEmployeeDocumentQuery())
    .sort({ category: 1, createdAt: -1 });

  return result;
};

const updateEmployeeDocumentIntoDB = async (
  id: string,
  payload: Partial<TEmployeeDocument>,
  actorOptions: TActorOptions = {},
) => {
  const existingDocument = await EmployeeDocument.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!existingDocument) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  const nextPayload = {
    ...existingDocument.toObject(),
    ...payload,
  } as Partial<TEmployeeDocument>;

  if (payload.employee || payload.company) {
    await checkEmployeeAndCompany({
      employee: nextPayload.employee,
      company: nextPayload.company,
    });
  }

  await ensureNoDuplicateDocument(nextPayload, id);

  const result = await EmployeeDocument.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
        updatedBy: toObjectIdOrNull(actorOptions.userId),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  return result;
};

const verifyEmployeeDocumentIntoDB = async (
  id: string,
  actorOptions: TActorOptions = {},
) => {
  const result = await EmployeeDocument.findOneAndUpdate(
    {
      _id: id,
      isDeleted: { $ne: true },
    },
    {
      $set: {
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: toObjectIdOrNull(actorOptions.userId),
        verificationRemarks: actorOptions.remarks || null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
        updatedBy: toObjectIdOrNull(actorOptions.userId),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  return result;
};

const rejectEmployeeDocumentIntoDB = async (
  id: string,
  actorOptions: TActorOptions = {},
) => {
  const result = await EmployeeDocument.findOneAndUpdate(
    {
      _id: id,
      isDeleted: { $ne: true },
    },
    {
      $set: {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: toObjectIdOrNull(actorOptions.userId),
        rejectionReason: actorOptions.remarks || null,
        verifiedAt: null,
        verifiedBy: null,
        verificationRemarks: null,
        updatedBy: toObjectIdOrNull(actorOptions.userId),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  return result;
};

const softDeleteEmployeeDocumentFromDB = async (
  id: string,
  actorOptions: TActorOptions = {},
) => {
  const result = await EmployeeDocument.findOneAndUpdate(
    {
      _id: id,
      isDeleted: { $ne: true },
    },
    buildSoftDeleteUpdate({
      userId: actorOptions.userId,
      deleteReason: actorOptions.deleteReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee document not found");
  }

  return result;
};

const restoreEmployeeDocumentFromDB = async (
  id: string,
  actorOptions: TActorOptions = {},
) => {
  const result = await EmployeeDocument.findOneAndUpdate(
    {
      _id: id,
      isDeleted: true,
    },
    buildRestoreUpdate({
      userId: actorOptions.userId,
      restoreReason: actorOptions.restoreReason,
    }),
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateEmployeeDocumentQuery());

  if (!result) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Deleted employee document not found",
    );
  }

  return result;
};

const getExpiringEmployeeDocumentsFromDB = async (
  query: { company?: string; days?: number; asOfDate?: string } = {},
) => {
  const asOfDate = query.asOfDate || getTodayDate();
  const days = Number(query.days || 30);
  const untilDate = addDays(asOfDate, days);

  const result = await EmployeeDocument.find({
    ...(query.company ? { company: query.company } : {}),
    isDeleted: { $ne: true },
    status: { $ne: "archived" },
    expiryDate: { $exists: true, $ne: "", $gte: asOfDate, $lte: untilDate },
  })
    .populate(populateEmployeeDocumentQuery())
    .sort({ expiryDate: 1, employee: 1 });

  return {
    asOfDate,
    untilDate,
    days,
    count: result.length,
    records: result,
  };
};

const getEmployeeDocumentSummaryFromDB = async (employeeId: string) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid employee id");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: { $ne: true },
  }).lean<TObject>();

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  const [total, pending, verified, rejected, expired, highlyConfidential] =
    await Promise.all([
      EmployeeDocument.countDocuments({
        employee: employeeId,
        isDeleted: { $ne: true },
      }),
      EmployeeDocument.countDocuments({
        employee: employeeId,
        status: "pending",
        isDeleted: { $ne: true },
      }),
      EmployeeDocument.countDocuments({
        employee: employeeId,
        status: "verified",
        isDeleted: { $ne: true },
      }),
      EmployeeDocument.countDocuments({
        employee: employeeId,
        status: "rejected",
        isDeleted: { $ne: true },
      }),
      EmployeeDocument.countDocuments({
        employee: employeeId,
        expiryDate: { $exists: true, $ne: "", $lt: getTodayDate() },
        isDeleted: { $ne: true },
      }),
      EmployeeDocument.countDocuments({
        employee: employeeId,
        confidentiality: "highly_confidential",
        isDeleted: { $ne: true },
      }),
    ]);

  return {
    employee: {
      id: String(employee._id),
      employeeId: employee.employeeId,
      officeId: employee.officeId,
      cardNo: employee.cardNo,
    },
    counters: {
      total,
      pending,
      verified,
      rejected,
      expired,
      highlyConfidential,
    },
    documentProfileReady: total > 0 && rejected === 0,
  };
};

export const EmployeeDocumentServices = {
  createEmployeeDocumentIntoDB,
  getAllEmployeeDocumentsFromDB,
  getDeletedEmployeeDocumentsFromDB,
  getSingleEmployeeDocumentFromDB,
  getSingleDeletedEmployeeDocumentFromDB,
  getEmployeeDocumentsByEmployeeFromDB,
  updateEmployeeDocumentIntoDB,
  verifyEmployeeDocumentIntoDB,
  rejectEmployeeDocumentIntoDB,
  softDeleteEmployeeDocumentFromDB,
  restoreEmployeeDocumentFromDB,
  getExpiringEmployeeDocumentsFromDB,
  getEmployeeDocumentSummaryFromDB,
};

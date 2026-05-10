import mongoose, { Types } from "mongoose";
import AppError from "../../errors/AppError";
import Branch from "../branch/branch.model";
import Company from "../company/company.model";
import Department from "../department/department.model";
import Designation from "../designation/designation.model";
import Employee from "../employee/employee.model";
import MajorDepartment from "../majorDepartment/majorDepartment.model";
import User from "../user/user.model";
import {
  TEmployeeBulkImportBatch,
  TEmployeeBulkImportExportFileResult,
  TEmployeeBulkImportPayload,
  TEmployeeBulkImportQueryFilters,
  TEmployeeBulkImportRawRow,
  TEmployeeBulkImportRejectionReportPreview,
  TEmployeeBulkImportRejectedRow,
  TEmployeeBulkImportSummary,
  TEmployeeBulkImportTemplateColumn,
  TEmployeeBulkImportTemplatePreview,
  TEmployeeBulkImportTemplateQuery,
  TEmployeeBulkImportValidRow,
} from "./employeeBulkImport.interface";
import EmployeeBulkImportBatch from "./employeeBulkImport.model";
import {
  generateEmployeeBulkImportRejectionCsv,
  generateEmployeeBulkImportRejectionExcel,
  generateEmployeeBulkImportTemplateCsv,
  generateEmployeeBulkImportTemplateExcel,
} from "./employeeBulkImport.export";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const EMPLOYEE_BULK_IMPORT_TEMPLATE_COLUMNS: TEmployeeBulkImportTemplateColumn[] = [
  {
    header: "rowNo",
    key: "rowNo",
    required: false,
    format: "1, 2, 3...",
    description: "Optional source row number. System will auto-generate when blank.",
    width: 10,
  },
  {
    header: "employeeId",
    key: "employeeId",
    required: true,
    format: "EMP-1001",
    description: "Permanent unique employee ID. It cannot be reused after import.",
    width: 18,
  },
  {
    header: "officeId",
    key: "officeId",
    required: false,
    format: "OFF-1001",
    description: "Office ID if maintained by HR/Admin. Must be unique among active employees.",
    width: 18,
  },
  {
    header: "cardNo",
    key: "cardNo",
    required: false,
    format: "CARD-1001",
    description: "Biometric/card number. Must be unique among active employees when supplied.",
    width: 18,
  },
  {
    header: "firstName",
    key: "firstName",
    required: true,
    format: "Text",
    description: "Employee first name.",
    width: 18,
  },
  {
    header: "middleName",
    key: "middleName",
    required: false,
    format: "Text",
    description: "Employee middle name, if any.",
    width: 18,
  },
  {
    header: "lastName",
    key: "lastName",
    required: true,
    format: "Text",
    description: "Employee last name.",
    width: 18,
  },
  {
    header: "email",
    key: "email",
    required: true,
    format: "employee@example.com",
    description: "Unique employee email.",
    width: 32,
  },
  {
    header: "phone",
    key: "phone",
    required: true,
    format: "+8801711111111",
    description: "Employee phone number.",
    width: 20,
  },
  {
    header: "gender",
    key: "gender",
    required: true,
    format: "male | female | other",
    description: "Employee gender enum value.",
    width: 16,
  },
  {
    header: "dateOfBirth",
    key: "dateOfBirth",
    required: false,
    format: "YYYY-MM-DD",
    description: "Date of birth if available.",
    width: 18,
  },
  {
    header: "company",
    key: "company",
    required: true,
    format: "MongoDB ObjectId",
    description: "Active company/concern ObjectId.",
    width: 28,
  },
  {
    header: "majorDepartment",
    key: "majorDepartment",
    required: true,
    format: "MongoDB ObjectId",
    description: "Active major department ObjectId under selected company.",
    width: 28,
  },
  {
    header: "department",
    key: "department",
    required: true,
    format: "MongoDB ObjectId",
    description: "Active department/section ObjectId under selected company and major department.",
    width: 28,
  },
  {
    header: "designation",
    key: "designation",
    required: true,
    format: "MongoDB ObjectId",
    description: "Active designation ObjectId.",
    width: 28,
  },
  {
    header: "branch",
    key: "branch",
    required: true,
    format: "MongoDB ObjectId",
    description: "Active branch ObjectId.",
    width: 28,
  },
  {
    header: "joiningDate",
    key: "joiningDate",
    required: true,
    format: "YYYY-MM-DD",
    description: "Employee joining date.",
    width: 18,
  },
  {
    header: "confirmationDate",
    key: "confirmationDate",
    required: false,
    format: "YYYY-MM-DD",
    description: "Confirmation date. Must not be before joining date.",
    width: 18,
  },
  {
    header: "serviceType",
    key: "serviceType",
    required: false,
    format: "permanent | probation | contractual | temporary | daily_wage | intern",
    description: "Defaults to permanent when blank.",
    width: 24,
  },
  {
    header: "payType",
    key: "payType",
    required: false,
    format: "monthly | daily | hourly",
    description: "Defaults to monthly when blank.",
    width: 18,
  },
  {
    header: "dutyHourPerDay",
    key: "dutyHourPerDay",
    required: false,
    format: "0-24",
    description: "Daily duty hour. Defaults to 8 when blank.",
    width: 16,
  },
  {
    header: "leaveDay",
    key: "leaveDay",
    required: false,
    format: "0-365",
    description: "Default weekly/monthly leave day setting. Defaults to 0 when blank.",
    width: 14,
  },
  {
    header: "employmentStatus",
    key: "employmentStatus",
    required: false,
    format: "active | probation | confirmed | resigned | terminated | retired | suspended",
    description: "Defaults to active when blank.",
    width: 26,
  },
  {
    header: "basicSalary",
    key: "basicSalary",
    required: false,
    format: "Number",
    description: "Initial basic salary. Defaults to 0 when blank.",
    width: 16,
  },
  {
    header: "status",
    key: "status",
    required: false,
    format: "active | inactive",
    description: "Employee master active/inactive status. Defaults to active when blank.",
    width: 16,
  },
];

const SAMPLE_EMPLOYEE_BULK_IMPORT_ROWS: TEmployeeBulkImportRawRow[] = [
  {
    rowNo: 1,
    employeeId: "EMP-1001",
    officeId: "OFF-1001",
    cardNo: "CARD-1001",
    firstName: "Mohammad",
    middleName: "Sohel",
    lastName: "Uddin",
    email: "sohel1001@example.com",
    phone: "+8801711111111",
    gender: "male",
    dateOfBirth: "1994-01-01",
    company: "PUT_COMPANY_OBJECT_ID_HERE",
    majorDepartment: "PUT_MAJOR_DEPARTMENT_OBJECT_ID_HERE",
    department: "PUT_DEPARTMENT_OBJECT_ID_HERE",
    designation: "PUT_DESIGNATION_OBJECT_ID_HERE",
    branch: "PUT_BRANCH_OBJECT_ID_HERE",
    joiningDate: "2026-05-01",
    confirmationDate: "2026-11-01",
    serviceType: "permanent",
    payType: "monthly",
    dutyHourPerDay: 8,
    leaveDay: 0,
    employmentStatus: "active",
    basicSalary: 25000,
    status: "active",
  },
];

const normalizeBooleanQuery = (value: string | boolean | undefined, defaultValue = true) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() !== "false";
  }

  return defaultValue;
};

const normalizeUpper = (value?: string) => value?.trim().toUpperCase();
const normalizeEmail = (value?: string) => value?.trim().toLowerCase();

const toObjectId = (value: string) => new Types.ObjectId(value);

const buildEmployeeName = (row: TEmployeeBulkImportRawRow) =>
  [row.firstName, row.middleName, row.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");

const generateBatchNo = () => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `EMP-IMP-${timestamp}-${random}`;
};

const addRejectedRow = (
  rejectedRows: TEmployeeBulkImportRejectedRow[],
  row: Partial<TEmployeeBulkImportRawRow>,
  reason: string,
) => {
  rejectedRows.push({
    rowNo: row.rowNo,
    employeeId: normalizeUpper(row.employeeId),
    email: normalizeEmail(row.email),
    officeId: normalizeUpper(row.officeId),
    cardNo: normalizeUpper(row.cardNo),
    reason,
    rawPayload: row.rawPayload ?? row,
  });
};

const countReasons = (rows: TEmployeeBulkImportRejectedRow[], keyword: string) =>
  rows.filter((row) => row.reason.toLowerCase().includes(keyword)).length;

const validateReferencesForRow = async (row: TEmployeeBulkImportRawRow) => {
  const company = await Company.findOne({
    _id: row.company,
    status: "active",
    isDeleted: false,
  }).lean();

  if (!company) {
    return "Company not found or inactive";
  }

  const majorDepartment = await MajorDepartment.findOne({
    _id: row.majorDepartment,
    company: row.company,
    status: "active",
    isDeleted: false,
  }).lean();

  if (!majorDepartment) {
    return "Major department not found under selected company or inactive";
  }

  const department = await Department.findOne({
    _id: row.department,
    company: row.company,
    majorDepartment: row.majorDepartment,
    status: "active",
    isDeleted: false,
  }).lean();

  if (!department) {
    return "Department not found under selected company and major department or inactive";
  }

  const designation = await Designation.findOne({
    _id: row.designation,
    company: row.company,
    status: "active",
    isDeleted: false,
  }).lean();

  if (!designation) {
    return "Designation not found under selected company or inactive";
  }

  const branch = await Branch.findOne({
    _id: row.branch,
    status: "active",
    isDeleted: false,
  }).lean();

  if (!branch) {
    return "Branch not found or inactive";
  }

  return null;
};

const collectDuplicateMaps = (rows: TEmployeeBulkImportRawRow[]) => {
  const employeeIdMap = new Map<string, number[]>();
  const emailMap = new Map<string, number[]>();
  const officeIdMap = new Map<string, number[]>();
  const cardNoMap = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const rowNo = row.rowNo ?? index + 1;
    const employeeId = normalizeUpper(row.employeeId);
    const email = normalizeEmail(row.email);
    const officeId = normalizeUpper(row.officeId);
    const cardNo = normalizeUpper(row.cardNo);

    if (employeeId) {
      employeeIdMap.set(employeeId, [...(employeeIdMap.get(employeeId) ?? []), rowNo]);
    }

    if (email) {
      emailMap.set(email, [...(emailMap.get(email) ?? []), rowNo]);
    }

    if (officeId) {
      officeIdMap.set(officeId, [...(officeIdMap.get(officeId) ?? []), rowNo]);
    }

    if (cardNo) {
      cardNoMap.set(cardNo, [...(cardNoMap.get(cardNo) ?? []), rowNo]);
    }
  });

  return {
    employeeIdMap,
    emailMap,
    officeIdMap,
    cardNoMap,
  };
};

const findDuplicateReason = (
  row: TEmployeeBulkImportRawRow,
  maps: ReturnType<typeof collectDuplicateMaps>,
) => {
  const duplicateReasons: string[] = [];
  const employeeId = normalizeUpper(row.employeeId);
  const email = normalizeEmail(row.email);
  const officeId = normalizeUpper(row.officeId);
  const cardNo = normalizeUpper(row.cardNo);

  if (employeeId && (maps.employeeIdMap.get(employeeId)?.length ?? 0) > 1) {
    duplicateReasons.push(
      `Duplicate employeeId in import rows: ${maps.employeeIdMap
        .get(employeeId)
        ?.join(", ")}`,
    );
  }

  if (email && (maps.emailMap.get(email)?.length ?? 0) > 1) {
    duplicateReasons.push(
      `Duplicate email in import rows: ${maps.emailMap.get(email)?.join(", ")}`,
    );
  }

  if (officeId && (maps.officeIdMap.get(officeId)?.length ?? 0) > 1) {
    duplicateReasons.push(
      `Duplicate officeId in import rows: ${maps.officeIdMap
        .get(officeId)
        ?.join(", ")}`,
    );
  }

  if (cardNo && (maps.cardNoMap.get(cardNo)?.length ?? 0) > 1) {
    duplicateReasons.push(
      `Duplicate cardNo in import rows: ${maps.cardNoMap.get(cardNo)?.join(", ")}`,
    );
  }

  return duplicateReasons.join("; ");
};

const findExistingEmployeeReason = async (row: TEmployeeBulkImportRawRow) => {
  const employeeId = normalizeUpper(row.employeeId);
  const email = normalizeEmail(row.email);
  const officeId = normalizeUpper(row.officeId);
  const cardNo = normalizeUpper(row.cardNo);

  if (employeeId) {
    const existingByEmployeeId = await Employee.findOne({ employeeId }).lean();

    if (existingByEmployeeId) {
      return "Employee ID already exists. Employee ID is permanent and cannot be reused";
    }
  }

  if (email) {
    const existingByEmail = await Employee.findOne({ email }).lean();

    if (existingByEmail) {
      return "Another employee already exists with this email";
    }
  }

  const activeDuplicateConditions: Array<{ officeId?: string; cardNo?: string }> = [];

  if (officeId) {
    activeDuplicateConditions.push({ officeId });
  }

  if (cardNo) {
    activeDuplicateConditions.push({ cardNo });
  }

  if (!activeDuplicateConditions.length) {
    return null;
  }

  const existingActiveEmployee = await Employee.findOne({
    isDeleted: false,
    $or: activeDuplicateConditions,
  }).lean();

  if (!existingActiveEmployee) {
    return null;
  }

  if (officeId && existingActiveEmployee.officeId === officeId) {
    return "Another active employee already exists with this office ID";
  }

  if (cardNo && existingActiveEmployee.cardNo === cardNo) {
    return "Another active employee already exists with this card no";
  }

  return "Employee already exists with duplicate information";
};

const buildValidEmployeeRow = (
  row: TEmployeeBulkImportRawRow,
): TEmployeeBulkImportValidRow => ({
  rowNo: row.rowNo,
  employeeId: normalizeUpper(row.employeeId) || row.employeeId,
  employeeName: buildEmployeeName(row),
  email: normalizeEmail(row.email) || row.email,
  officeId: normalizeUpper(row.officeId),
  cardNo: normalizeUpper(row.cardNo),
  company: toObjectId(row.company),
  majorDepartment: toObjectId(row.majorDepartment),
  department: toObjectId(row.department),
  designation: toObjectId(row.designation),
  branch: toObjectId(row.branch),
  action: "create",
  rawRow: {
    ...row,
    employeeId: normalizeUpper(row.employeeId) || row.employeeId,
    officeId: normalizeUpper(row.officeId),
    cardNo: normalizeUpper(row.cardNo),
    email: normalizeEmail(row.email) || row.email,
  },
});

const buildEmployeeCreatePayload = (row: TEmployeeBulkImportRawRow) => ({
  employeeId: normalizeUpper(row.employeeId) || row.employeeId,
  officeId: normalizeUpper(row.officeId),
  cardNo: normalizeUpper(row.cardNo),
  name: {
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
  },
  email: normalizeEmail(row.email) || row.email,
  phone: row.phone,
  gender: row.gender,
  dateOfBirth: row.dateOfBirth,
  company: row.company,
  majorDepartment: row.majorDepartment,
  department: row.department,
  designation: row.designation,
  branch: row.branch,
  joiningDate: row.joiningDate,
  confirmationDate: row.confirmationDate,
  serviceType: row.serviceType ?? "permanent",
  payType: row.payType ?? "monthly",
  dutyHourPerDay: row.dutyHourPerDay ?? 8,
  leaveDay: row.leaveDay ?? 0,
  employmentStatus: row.employmentStatus ?? "active",
  basicSalary: row.basicSalary ?? 0,
  status: row.status ?? "active",
});

const previewEmployeeBulkImportFromPayload = async (
  payload: TEmployeeBulkImportPayload,
): Promise<TEmployeeBulkImportSummary> => {
  const rows = payload.rows.map((row, index) => ({
    ...row,
    rowNo: row.rowNo ?? index + 1,
  }));

  const duplicateMaps = collectDuplicateMaps(rows);
  const rejectedRows: TEmployeeBulkImportRejectedRow[] = [];
  const validEmployeeRows: TEmployeeBulkImportValidRow[] = [];
  const warnings: string[] = [];

  for (const row of rows) {
    const duplicateReason = findDuplicateReason(row, duplicateMaps);

    if (duplicateReason) {
      addRejectedRow(rejectedRows, row, duplicateReason);
      continue;
    }

    const existingEmployeeReason = await findExistingEmployeeReason(row);

    if (existingEmployeeReason) {
      addRejectedRow(rejectedRows, row, existingEmployeeReason);
      continue;
    }

    const referenceError = await validateReferencesForRow(row);

    if (referenceError) {
      addRejectedRow(rejectedRows, row, referenceError);
      continue;
    }

    validEmployeeRows.push(buildValidEmployeeRow(row));
  }

  if (!validEmployeeRows.length) {
    warnings.push("No valid employee rows are available for import commit");
  }

  if (rejectedRows.length) {
    warnings.push(
      "Some rows are rejected. In strict mode, commit will be blocked until all rows are valid",
    );
  }

  const duplicateRows = countReasons(rejectedRows, "duplicate");
  const existingEmployeeBlockers = countReasons(rejectedRows, "already exists");
  const referenceBlockers = rejectedRows.filter((row) =>
    ["not found", "inactive", "under selected"].some((keyword) =>
      row.reason.toLowerCase().includes(keyword),
    ),
  ).length;

  return {
    totalRows: rows.length,
    validRows: validEmployeeRows.length,
    invalidRows: rejectedRows.length,
    duplicateRows,
    existingEmployeeBlockers,
    referenceBlockers,
    createdEmployeeCount: 0,
    skippedEmployeeCount: 0,
    rejectedRows,
    validEmployeeRows,
    createdEmployees: [],
    warnings,
  };
};

const commitEmployeeBulkImportIntoDB = async (
  payload: TEmployeeBulkImportPayload,
  processedBy?: string,
) => {
  if (processedBy && !mongoose.isValidObjectId(processedBy)) {
    throw new AppError(400, "Invalid user ID");
  }

  if (processedBy) {
    const user = await User.findOne({
      _id: processedBy,
      isDeleted: false,
    }).lean();

    if (!user) {
      throw new AppError(404, "User not found");
    }
  }

  const preview = await previewEmployeeBulkImportFromPayload(payload);
  const strictMode = payload.strictMode ?? true;

  if (strictMode && preview.invalidRows > 0) {
    throw new AppError(
      409,
      "Employee bulk import commit blocked. Some rows are invalid. Please fix rejected rows or use strictMode=false for partial commit",
    );
  }

  if (!preview.validEmployeeRows.length) {
    throw new AppError(400, "No valid employee rows are available for commit");
  }

  const employeeCreatePayloads = preview.validEmployeeRows.map((item) =>
    buildEmployeeCreatePayload(item.rawRow),
  );

  const createdEmployees = await Employee.insertMany(employeeCreatePayloads, {
    ordered: true,
  });

  const createdEmployeeItems = createdEmployees.map((employee, index) => {
    const validRow = preview.validEmployeeRows[index];
    const employeeName =
      validRow?.employeeName ??
      [employee.name.firstName, employee.name.middleName, employee.name.lastName]
        .filter((part): part is string => Boolean(part))
        .join(" ");

    return {
      rowNo: validRow?.rowNo,
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName,
      email: employee.email,
      officeId: employee.officeId,
      cardNo: employee.cardNo,
    };
  });

  const status =
    preview.invalidRows > 0 && createdEmployeeItems.length > 0
      ? "partial_committed"
      : "committed";

  const result = await EmployeeBulkImportBatch.create({
    batchNo: generateBatchNo(),
    source: payload.source,
    sourceFileName: payload.sourceFileName,
    strictMode,
    status,
    totalRows: preview.totalRows,
    validRows: preview.validRows,
    invalidRows: preview.invalidRows,
    duplicateRows: preview.duplicateRows,
    existingEmployeeBlockers: preview.existingEmployeeBlockers,
    referenceBlockers: preview.referenceBlockers,
    createdEmployeeCount: createdEmployeeItems.length,
    skippedEmployeeCount: 0,
    rejectedRows: preview.rejectedRows,
    validEmployeeRows: preview.validEmployeeRows,
    createdEmployees: createdEmployeeItems,
    warnings: preview.warnings,
    remarks: payload.remarks,
    processedBy: processedBy ? new Types.ObjectId(processedBy) : undefined,
    processedAt: new Date(),
    isDeleted: false,
  });

  return result;
};

const getAllEmployeeBulkImportsFromDB = async (
  filters: TEmployeeBulkImportQueryFilters = {},
) => {
  const page = Number(filters.page ?? DEFAULT_PAGE);
  const limit = Number(filters.limit ?? DEFAULT_LIMIT);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    isDeleted: false,
  };

  if (filters.source) {
    query.source = filters.source;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.batchNo) {
    query.batchNo = filters.batchNo.trim().toUpperCase();
  }

  if (filters.sourceFileName) {
    query.sourceFileName = {
      $regex: filters.sourceFileName.trim(),
      $options: "i",
    };
  }

  if (filters.fromDate || filters.toDate) {
    query.processedAt = {};

    if (filters.fromDate) {
      (query.processedAt as Record<string, Date>).$gte = new Date(
        `${filters.fromDate}T00:00:00.000Z`,
      );
    }

    if (filters.toDate) {
      (query.processedAt as Record<string, Date>).$lte = new Date(
        `${filters.toDate}T23:59:59.999Z`,
      );
    }
  }

  const [data, total] = await Promise.all([
    EmployeeBulkImportBatch.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "processedBy", select: "name email role" }),
    EmployeeBulkImportBatch.countDocuments(query),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const getSingleEmployeeBulkImportFromDB = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid employee bulk import batch ID");
  }

  const result = await EmployeeBulkImportBatch.findOne({
    _id: id,
    isDeleted: false,
  }).populate([
    { path: "processedBy", select: "name email role" },
    { path: "createdEmployees.employee", select: "employeeId name email phone" },
  ]);

  if (!result) {
    throw new AppError(404, "Employee bulk import batch not found");
  }

  return result;
};


const buildEmployeeBulkImportTemplatePreview = (
  query: TEmployeeBulkImportTemplateQuery = {},
): TEmployeeBulkImportTemplatePreview => {
  const source = query.source ?? "excel";
  const includeSample = normalizeBooleanQuery(query.includeSample, true);

  return {
    template: {
      source,
      includeSample,
      generatedAt: new Date().toISOString(),
      note:
        "Use ObjectId values for company, majorDepartment, department, designation and branch. Run preview before commit to validate duplicate and reference issues.",
    },
    columns: EMPLOYEE_BULK_IMPORT_TEMPLATE_COLUMNS,
    sampleRows: includeSample ? SAMPLE_EMPLOYEE_BULK_IMPORT_ROWS : [],
    instructions: [
      "Do not edit employeeId format after an employee is created; it is treated as permanent identity.",
      "officeId and cardNo are optional, but must be unique among active employees when supplied.",
      "company, majorDepartment, department, designation and branch must be active ObjectId values from master setup.",
      "Use preview endpoint before commit. In strictMode=true, commit is blocked if any row is rejected.",
      "Keep the same column headers when importing from Excel/CSV.",
    ],
  };
};

const buildEmployeeBulkImportRejectionReportFromDB = async (
  id: string,
): Promise<TEmployeeBulkImportRejectionReportPreview> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid employee bulk import batch ID");
  }

  const batch = await EmployeeBulkImportBatch.findOne({
    _id: id,
    isDeleted: false,
  }).lean();

  if (!batch) {
    throw new AppError(404, "Employee bulk import batch not found");
  }

  return {
    batch: {
      id: batch._id.toString(),
      batchNo: batch.batchNo,
      source: batch.source,
      sourceFileName: batch.sourceFileName,
      status: batch.status,
    },
    summary: {
      totalRows: batch.totalRows,
      rejectedRows: batch.rejectedRows.length,
      duplicateRows: batch.duplicateRows,
      existingEmployeeBlockers: batch.existingEmployeeBlockers,
      referenceBlockers: batch.referenceBlockers,
    },
    rejectedRows: batch.rejectedRows,
  };
};

const exportEmployeeBulkImportTemplateCsv = (
  query: TEmployeeBulkImportTemplateQuery = {},
): TEmployeeBulkImportExportFileResult => {
  const preview = buildEmployeeBulkImportTemplatePreview(query);

  return generateEmployeeBulkImportTemplateCsv(preview);
};

const exportEmployeeBulkImportTemplateExcel = async (
  query: TEmployeeBulkImportTemplateQuery = {},
): Promise<TEmployeeBulkImportExportFileResult> => {
  const preview = buildEmployeeBulkImportTemplatePreview(query);

  return generateEmployeeBulkImportTemplateExcel(preview);
};

const exportEmployeeBulkImportRejectionsCsv = async (
  id: string,
): Promise<TEmployeeBulkImportExportFileResult> => {
  const preview = await buildEmployeeBulkImportRejectionReportFromDB(id);

  return generateEmployeeBulkImportRejectionCsv(preview);
};

const exportEmployeeBulkImportRejectionsExcel = async (
  id: string,
): Promise<TEmployeeBulkImportExportFileResult> => {
  const preview = await buildEmployeeBulkImportRejectionReportFromDB(id);

  return generateEmployeeBulkImportRejectionExcel(preview);
};

export const EmployeeBulkImportServices = {
  previewEmployeeBulkImportFromPayload,
  commitEmployeeBulkImportIntoDB,
  getAllEmployeeBulkImportsFromDB,
  getSingleEmployeeBulkImportFromDB,
  buildEmployeeBulkImportTemplatePreview,
  buildEmployeeBulkImportRejectionReportFromDB,
  exportEmployeeBulkImportTemplateCsv,
  exportEmployeeBulkImportTemplateExcel,
  exportEmployeeBulkImportRejectionsCsv,
  exportEmployeeBulkImportRejectionsExcel,
};

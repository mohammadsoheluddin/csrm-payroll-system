import ExcelJS from "exceljs";
import mongoose, { Types } from "mongoose";
import {
  buildDeletedFilter,
  buildRestoreUpdate,
  buildSoftDeleteUpdate,
  normalizeSoftDeleteReason,
} from "../../common/softDelete";
import AppError from "../../errors/AppError";
import Company from "../company/company.model";
import Employee from "../employee/employee.model";
import {
  TLegacySalaryAmountTotals,
  TLegacySalaryBatchQuery,
  TLegacySalaryImportPayload,
  TLegacySalaryImportRejectedRow,
  TLegacySalaryImportRowInput,
  TLegacySalaryImportValidRow,
  TLegacySalaryParsedExcelResult,
  TLegacySalaryParseExcelPayload,
  TLegacySalaryPaymentMode,
  TLegacySalaryRecordQuery,
  TLegacySalarySummaryQuery,
  TLegacySalarySummaryResult,
} from "./legacySalaryImport.interface";
import {
  LegacySalaryImportBatch,
  LegacySalaryRecord,
} from "./legacySalaryImport.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const AMOUNT_FIELDS: (keyof TLegacySalaryAmountTotals)[] = [
  "grossAmount",
  "basicAmount",
  "overtimeAmount",
  "tiffinAmount",
  "bonusAmount",
  "otherAllowanceAmount",
  "bankAmount",
  "cashAmount",
  "mobileBankAmount",
  "aitAmount",
  "loanAmount",
  "advanceAmount",
  "pfAmount",
  "stampAmount",
  "foodAmount",
  "absentDeductionAmount",
  "leaveDeductionAmount",
  "otherDeductionAmount",
  "totalDeductionAmount",
  "netAmount",
  "payableAmount",
];

const EMPTY_TOTALS: TLegacySalaryAmountTotals = {
  employeeCount: 0,
  grossAmount: 0,
  basicAmount: 0,
  overtimeAmount: 0,
  tiffinAmount: 0,
  bonusAmount: 0,
  otherAllowanceAmount: 0,
  bankAmount: 0,
  cashAmount: 0,
  mobileBankAmount: 0,
  aitAmount: 0,
  loanAmount: 0,
  advanceAmount: 0,
  pfAmount: 0,
  stampAmount: 0,
  foodAmount: 0,
  absentDeductionAmount: 0,
  leaveDeductionAmount: 0,
  otherDeductionAmount: 0,
  totalDeductionAmount: 0,
  netAmount: 0,
  payableAmount: 0,
};

const normalizeString = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized || undefined;
};

const normalizeUpperString = (value: unknown) => normalizeString(value)?.toUpperCase();

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePaymentMode = (value: unknown): TLegacySalaryPaymentMode => {
  const normalized = normalizeString(value)?.toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (normalized.includes("bank")) {
    return "bank";
  }

  if (normalized.includes("cash")) {
    return "cash";
  }

  if (normalized.includes("mobile") || normalized.includes("bkash") || normalized.includes("nagad")) {
    return "mobile";
  }

  if (normalized.includes("mixed") || normalized.includes("both")) {
    return "mixed";
  }

  return "unknown";
};

const parsePayrollMonth = (payrollMonth: string) => {
  const [yearText, monthText] = payrollMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid payroll month");
  }

  return { year, month };
};

const buildBatchNo = async (payrollMonth: string) => {
  const compactMonth = payrollMonth.replace("-", "");
  const count = await LegacySalaryImportBatch.countDocuments({ payrollMonth });
  return `LSI-${compactMonth}-${String(count + 1).padStart(4, "0")}`;
};

const calculateTotals = (rows: TLegacySalaryImportValidRow[]): TLegacySalaryAmountTotals => {
  const totals: TLegacySalaryAmountTotals = { ...EMPTY_TOTALS };

  totals.employeeCount = rows.length;

  rows.forEach((row) => {
    AMOUNT_FIELDS.forEach((field) => {
      totals[field] += Number((row as unknown as Record<string, number>)[field] || 0);
    });
  });

  return totals;
};

const buildRowIdentifier = (
  row: TLegacySalaryImportRowInput,
  matchBy: TLegacySalaryImportPayload["matchBy"],
) => {
  if (matchBy === "officeId") {
    return normalizeUpperString(row.officeId || row.employeeIdentifier);
  }

  if (matchBy === "cardNo") {
    return normalizeUpperString(row.cardNo || row.employeeIdentifier);
  }

  if (matchBy === "name") {
    return normalizeString(row.employeeName || row.employeeIdentifier)?.toLowerCase();
  }

  return normalizeUpperString(row.employeeId || row.employeeIdentifier);
};

const findEmployeeByRow = async (
  row: TLegacySalaryImportRowInput,
  matchBy: TLegacySalaryImportPayload["matchBy"],
) => {
  const identifier = buildRowIdentifier(row, matchBy);

  if (!identifier) {
    return null;
  }

  const activeFilter = { isDeleted: { $ne: true } };

  if (matchBy === "officeId") {
    return Employee.findOne({ ...activeFilter, officeId: identifier }).select("_id employeeId officeId cardNo name").lean();
  }

  if (matchBy === "cardNo") {
    return Employee.findOne({ ...activeFilter, cardNo: identifier }).select("_id employeeId officeId cardNo name").lean();
  }

  if (matchBy === "name") {
    const employeeName = normalizeString(row.employeeName || row.employeeIdentifier);

    if (!employeeName) {
      return null;
    }

    const tokens = employeeName.split(/\s+/).filter(Boolean);
    const firstName = tokens[0];
    const lastName = tokens.length > 1 ? tokens[tokens.length - 1] : tokens[0];

    return Employee.findOne({
      ...activeFilter,
      "name.firstName": new RegExp(`^${escapeRegExp(firstName)}$`, "i"),
      "name.lastName": new RegExp(`^${escapeRegExp(lastName)}$`, "i"),
    })
      .select("_id employeeId officeId cardNo name")
      .lean();
  }

  return Employee.findOne({ ...activeFilter, employeeId: identifier }).select("_id employeeId officeId cardNo name").lean();
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeLegacySalaryRow = async (
  row: TLegacySalaryImportRowInput,
  rowNo: number,
  matchBy: TLegacySalaryImportPayload["matchBy"],
  seenIdentifiers: Set<string>,
): Promise<{
  validRow?: TLegacySalaryImportValidRow;
  rejectedRow?: TLegacySalaryImportRejectedRow;
}> => {
  const employeeIdentifier = buildRowIdentifier(row, matchBy);
  const employeeName = normalizeString(row.employeeName || row.rawPayload?.employeeName);

  if (!employeeIdentifier && !employeeName) {
    return {
      rejectedRow: {
        rowNo,
        reason: "Employee identifier or employee name is required",
        rawPayload: row.rawPayload || { ...row },
      },
    };
  }

  const duplicateKey = employeeIdentifier || `name:${employeeName?.toLowerCase()}`;
  const isDuplicateIdentifier = Boolean(duplicateKey && seenIdentifiers.has(duplicateKey));

  if (duplicateKey) {
    seenIdentifiers.add(duplicateKey);
  }

  const employee = await findEmployeeByRow(row, matchBy);

  const bankAmount = toNumber(row.bankAmount);
  const cashAmount = toNumber(row.cashAmount);
  const mobileBankAmount = toNumber(row.mobileBankAmount);
  const deductedAmount =
    toNumber(row.aitAmount) +
    toNumber(row.loanAmount) +
    toNumber(row.advanceAmount) +
    toNumber(row.pfAmount) +
    toNumber(row.stampAmount) +
    toNumber(row.foodAmount) +
    toNumber(row.absentDeductionAmount) +
    toNumber(row.leaveDeductionAmount) +
    toNumber(row.otherDeductionAmount);

  const totalDeductionAmount = toNumber(row.totalDeductionAmount) || deductedAmount;
  const grossAmount = toNumber(row.grossAmount);
  const netAmount = toNumber(row.netAmount) || Math.max(grossAmount - totalDeductionAmount, 0);
  const payableAmount =
    toNumber(row.payableAmount) || bankAmount + cashAmount + mobileBankAmount || netAmount;

  const validRow: TLegacySalaryImportValidRow = {
    rowNo,
    status: isDuplicateIdentifier
      ? "duplicate_identifier"
      : employee
        ? "matched"
        : "unmatched",
    employee: employee?._id ? new Types.ObjectId(String(employee._id)) : null,
    employeeId: normalizeUpperString(row.employeeId || employee?.employeeId),
    officeId: normalizeUpperString(row.officeId || employee?.officeId),
    cardNo: normalizeUpperString(row.cardNo || employee?.cardNo),
    employeeIdentifier: normalizeUpperString(employeeIdentifier),
    employeeName:
      employeeName ||
      [employee?.name?.firstName, employee?.name?.middleName, employee?.name?.lastName]
        .filter(Boolean)
        .join(" ") ||
      "Unknown Employee",
    companyName: normalizeString(row.companyName),
    majorDepartmentName: normalizeString(row.majorDepartmentName),
    departmentName: normalizeString(row.departmentName),
    designationName: normalizeString(row.designationName),
    branchName: normalizeString(row.branchName),
    payType: normalizeString(row.payType),
    paymentMode: normalizePaymentMode(row.paymentMode),
    grossAmount,
    basicAmount: toNumber(row.basicAmount),
    houseRentAmount: toNumber(row.houseRentAmount),
    medicalAmount: toNumber(row.medicalAmount),
    conveyanceAmount: toNumber(row.conveyanceAmount),
    tiffinAmount: toNumber(row.tiffinAmount),
    overtimeHour: toNumber(row.overtimeHour),
    overtimeRate: toNumber(row.overtimeRate),
    overtimeAmount: toNumber(row.overtimeAmount),
    bonusAmount: toNumber(row.bonusAmount),
    otherAllowanceAmount: toNumber(row.otherAllowanceAmount),
    bankAmount,
    cashAmount,
    mobileBankAmount,
    aitAmount: toNumber(row.aitAmount),
    loanAmount: toNumber(row.loanAmount),
    advanceAmount: toNumber(row.advanceAmount),
    pfAmount: toNumber(row.pfAmount),
    stampAmount: toNumber(row.stampAmount),
    foodAmount: toNumber(row.foodAmount),
    absentDeductionAmount: toNumber(row.absentDeductionAmount),
    leaveDeductionAmount: toNumber(row.leaveDeductionAmount),
    otherDeductionAmount: toNumber(row.otherDeductionAmount),
    totalDeductionAmount,
    netAmount,
    payableAmount,
    remarks: normalizeString(row.remarks),
    rawPayload: row.rawPayload || { ...row },
  };

  return { validRow };
};

const previewLegacySalaryImportFromPayload = async (payload: TLegacySalaryImportPayload) => {
  if (payload.company) {
    const companyExists = await Company.exists({ _id: payload.company, isDeleted: { $ne: true } });

    if (!companyExists) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Company not found");
    }
  }

  const seenIdentifiers = new Set<string>();
  const rows: TLegacySalaryImportValidRow[] = [];
  const rejectedRows: TLegacySalaryImportRejectedRow[] = [];

  for (let index = 0; index < payload.rows.length; index += 1) {
    const row = payload.rows[index];
    const rowNo = row.rowNo || index + 1;
    const result = await normalizeLegacySalaryRow(row, rowNo, payload.matchBy || "employeeId", seenIdentifiers);

    if (result.validRow) {
      rows.push(result.validRow);
    }

    if (result.rejectedRow) {
      rejectedRows.push(result.rejectedRow);
    }
  }

  return {
    payrollMonth: payload.payrollMonth,
    source: payload.source,
    sheetType: payload.sheetType,
    matchBy: payload.matchBy || "employeeId",
    sourceFileName: payload.sourceFileName,
    sourceSheetName: payload.sourceSheetName,
    totalRows: payload.rows.length,
    validRows: rows.length,
    invalidRows: rejectedRows.length,
    matchedRows: rows.filter((row) => row.status === "matched").length,
    unmatchedRows: rows.filter((row) => row.status === "unmatched").length,
    duplicateIdentifierRows: rows.filter((row) => row.status === "duplicate_identifier").length,
    totals: calculateTotals(rows),
    rows,
    rejectedRows,
  };
};

const commitLegacySalaryImportIntoDB = async (
  payload: TLegacySalaryImportPayload,
  userId?: string,
) => {
  const preview = await previewLegacySalaryImportFromPayload(payload);

  if (!preview.rows.length) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "No valid legacy salary rows found for commit");
  }

  const { year, month } = parsePayrollMonth(payload.payrollMonth);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const batchNo = await buildBatchNo(payload.payrollMonth);
    const [batch] = await LegacySalaryImportBatch.create(
      [
        {
          batchNo,
          source: payload.source,
          sheetType: payload.sheetType,
          payrollMonth: payload.payrollMonth,
          month,
          year,
          company: payload.company ? new Types.ObjectId(payload.company) : null,
          sourceFileName: payload.sourceFileName,
          sourceSheetName: payload.sourceSheetName,
          matchBy: payload.matchBy || "employeeId",
          status: "committed",
          totalRows: preview.totalRows,
          validRows: preview.validRows,
          invalidRows: preview.invalidRows,
          matchedRows: preview.matchedRows,
          unmatchedRows: preview.unmatchedRows,
          duplicateIdentifierRows: preview.duplicateIdentifierRows,
          totals: preview.totals,
          rejectedRows: preview.rejectedRows,
          remarks: payload.remarks,
          committedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
          committedAt: new Date(),
        },
      ],
      { session },
    );

    await LegacySalaryRecord.insertMany(
      preview.rows.map((row) => ({
        ...row,
        batch: batch._id,
        payrollMonth: payload.payrollMonth,
        month,
        year,
        company: payload.company ? new Types.ObjectId(payload.company) : null,
        source: payload.source,
        sheetType: payload.sheetType,
      })),
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return LegacySalaryImportBatch.findById(batch._id).lean();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const buildBatchFilter = (query: TLegacySalaryBatchQuery = {}, deleted = false) => {
  const filter: Record<string, any> = deleted ? buildDeletedFilter() : { isDeleted: { $ne: true } };

  if (query.payrollMonth) filter.payrollMonth = query.payrollMonth;
  if (query.month) filter.month = query.month;
  if (query.year) filter.year = query.year;
  if (query.company) filter.company = new Types.ObjectId(query.company);
  if (query.source) filter.source = query.source;
  if (query.sheetType) filter.sheetType = query.sheetType;
  if (query.status) filter.status = query.status;
  if (query.batchNo) filter.batchNo = { $regex: query.batchNo, $options: "i" };
  if (query.fromMonth || query.toMonth) {
    filter.payrollMonth = {
      ...(query.fromMonth ? { $gte: query.fromMonth } : {}),
      ...(query.toMonth ? { $lte: query.toMonth } : {}),
    };
  }

  return filter;
};

const getAllLegacySalaryImportBatchesFromDB = async (query: TLegacySalaryBatchQuery = {}) => {
  const page = Number(query.page || DEFAULT_PAGE);
  const limit = Number(query.limit || DEFAULT_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildBatchFilter(query);

  const [data, total] = await Promise.all([
    LegacySalaryImportBatch.find(filter)
      .populate("company", "name code shortName")
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LegacySalaryImportBatch.countDocuments(filter),
  ]);

  return { meta: { page, limit, total }, data };
};

const getDeletedLegacySalaryImportBatchesFromDB = async (query: TLegacySalaryBatchQuery = {}) => {
  const page = Number(query.page || DEFAULT_PAGE);
  const limit = Number(query.limit || DEFAULT_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildBatchFilter(query, true);

  const [data, total] = await Promise.all([
    LegacySalaryImportBatch.find(filter)
      .populate("company", "name code shortName")
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LegacySalaryImportBatch.countDocuments(filter),
  ]);

  return { meta: { page, limit, total }, data };
};

const getSingleLegacySalaryImportBatchFromDB = async (id: string) => {
  const batch = await LegacySalaryImportBatch.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("company", "name code shortName")
    .lean();

  if (!batch) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Legacy salary import batch not found");
  }

  const records = await LegacySalaryRecord.find({ batch: id }).sort({ rowNo: 1 }).limit(500).lean();

  return { batch, records };
};

const buildRecordFilter = (query: TLegacySalaryRecordQuery = {}) => {
  const filter: Record<string, any> = {};

  if (query.batch) filter.batch = new Types.ObjectId(query.batch);
  if (query.payrollMonth) filter.payrollMonth = query.payrollMonth;
  if (query.month) filter.month = query.month;
  if (query.year) filter.year = query.year;
  if (query.company) filter.company = new Types.ObjectId(query.company);
  if (query.employee) filter.employee = new Types.ObjectId(query.employee);
  if (query.employeeId) filter.employeeId = { $regex: query.employeeId, $options: "i" };
  if (query.officeId) filter.officeId = { $regex: query.officeId, $options: "i" };
  if (query.cardNo) filter.cardNo = { $regex: query.cardNo, $options: "i" };
  if (query.employeeName) filter.employeeName = { $regex: query.employeeName, $options: "i" };
  if (query.departmentName) filter.departmentName = { $regex: query.departmentName, $options: "i" };
  if (query.status) filter.status = query.status;

  return filter;
};

const getLegacySalaryRecordsFromDB = async (query: TLegacySalaryRecordQuery = {}) => {
  const page = Number(query.page || DEFAULT_PAGE);
  const limit = Number(query.limit || DEFAULT_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildRecordFilter(query);

  const [data, total] = await Promise.all([
    LegacySalaryRecord.find(filter)
      .populate("employee", "employeeId officeId cardNo name")
      .populate("company", "name code shortName")
      .sort({ year: -1, month: -1, rowNo: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LegacySalaryRecord.countDocuments(filter),
  ]);

  return { meta: { page, limit, total }, data };
};

const getLegacySalarySummaryFromDB = async (
  query: TLegacySalarySummaryQuery = {},
): Promise<TLegacySalarySummaryResult> => {
  const groupBy = query.groupBy || "department";
  const filter = buildRecordFilter(query as TLegacySalaryRecordQuery);

  const records = await LegacySalaryRecord.find(filter).lean();
  const groupMap = new Map<string, TLegacySalaryAmountTotals & { groupKey: string; groupName: string }>();
  const grandTotal: TLegacySalaryAmountTotals = { ...EMPTY_TOTALS };

  records.forEach((record) => {
    const groupName = getSummaryGroupName(record as unknown as Record<string, unknown>, groupBy);

    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, { ...EMPTY_TOTALS, groupKey: groupName, groupName });
    }

    const target = groupMap.get(groupName)!;
    target.employeeCount += 1;
    grandTotal.employeeCount += 1;

    AMOUNT_FIELDS.forEach((field) => {
      const value = Number((record as unknown as Record<string, unknown>)[field] || 0);
      target[field] += value;
      grandTotal[field] += value;
    });
  });

  return {
    filters: query,
    rows: Array.from(groupMap.values()).sort((a, b) => a.groupName.localeCompare(b.groupName)),
    grandTotal,
  };
};

const getSummaryGroupName = (record: Record<string, unknown>, groupBy: string) => {
  if (groupBy === "majorDepartment") return normalizeString(record.majorDepartmentName) || "Unassigned Major Department";
  if (groupBy === "company") return normalizeString(record.companyName) || "Unassigned Company";
  if (groupBy === "sheetType") return normalizeString(record.sheetType) || "Unknown Sheet Type";
  if (groupBy === "status") return normalizeString(record.status) || "Unknown Status";
  return normalizeString(record.departmentName) || "Unassigned Department";
};

const deleteLegacySalaryImportBatchFromDB = async (
  id: string,
  payload: { deleteReason?: string } = {},
  userId?: string,
) => {
  const batch = await LegacySalaryImportBatch.findOne({ _id: id, isDeleted: { $ne: true } });

  if (!batch) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Legacy salary import batch not found");
  }

  const update = buildSoftDeleteUpdate({
    userId,
    deleteReason: normalizeSoftDeleteReason(payload.deleteReason),
  });

  const updated = await LegacySalaryImportBatch.findByIdAndUpdate(id, update, { new: true }).lean();

  return updated;
};

const restoreLegacySalaryImportBatchFromDB = async (
  id: string,
  payload: { restoreReason?: string } = {},
  userId?: string,
) => {
  const batch = await LegacySalaryImportBatch.findOne({ _id: id, isDeleted: true });

  if (!batch) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Deleted legacy salary import batch not found");
  }

  const update = buildRestoreUpdate({
    userId,
    restoreReason: normalizeSoftDeleteReason(payload.restoreReason),
  });

  const updated = await LegacySalaryImportBatch.findByIdAndUpdate(id, update, { new: true }).lean();

  return updated;
};

const parseLegacySalaryExcelBase64 = async (
  payload: TLegacySalaryParseExcelPayload,
): Promise<TLegacySalaryParsedExcelResult> => {
  const workbook = new ExcelJS.Workbook();
  const base64 = payload.fileBase64.includes(",")
    ? payload.fileBase64.split(",").pop() || ""
    : payload.fileBase64;

  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid or empty Excel file payload");
  }

  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  const worksheet = payload.sheetName
    ? workbook.getWorksheet(payload.sheetName)
    : workbook.worksheets[0];

  if (!worksheet) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Worksheet not found");
  }

  const headerRowNumber = payload.headerRow || 1;
  const dataStartRow = payload.dataStartRow || headerRowNumber + 1;
  const headerRow = worksheet.getRow(headerRowNumber);
  const headers: string[] = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = normalizeHeader(cell.value);
  });

  if (!headers.filter(Boolean).length) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "No header columns found in Excel sheet");
  }

  const rows: TLegacySalaryParsedExcelResult["rows"] = [];
  const maxRows = payload.maxRows || 5000;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < dataStartRow || rows.length >= maxRows) {
      return;
    }

    const rawPayload: Record<string, unknown> = {};
    let hasValue = false;

    headers.forEach((header, index) => {
      if (!header) {
        return;
      }

      const value = row.getCell(index + 1).value;
      const normalizedValue = normalizeCellValue(value);
      rawPayload[header] = normalizedValue;

      if (normalizedValue !== undefined && normalizedValue !== null && normalizedValue !== "") {
        hasValue = true;
      }
    });

    if (hasValue) {
      rows.push({ rowNo: rowNumber, rawPayload });
    }
  });

  return {
    fileName: payload.fileName,
    sheetName: worksheet.name,
    headerRow: headerRowNumber,
    dataStartRow,
    totalRows: rows.length,
    rows,
    headers: headers.filter(Boolean),
  };
};

const normalizeHeader = (value: unknown) => {
  const text = normalizeCellValue(value);
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/(?:^|\s)(\w)/g, (_match, char: string) => char.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^./, (char) => char.toLowerCase());
};

const normalizeCellValue = (value: unknown): unknown => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "object") {
    const richValue = value as { text?: string; result?: unknown; formula?: string; hyperlink?: string };

    if (richValue.text) return richValue.text;
    if (richValue.result !== undefined) return richValue.result;
    if (richValue.hyperlink) return richValue.hyperlink;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
  }

  return value;
};

export const LegacySalaryImportServices = {
  parseLegacySalaryExcelBase64,
  previewLegacySalaryImportFromPayload,
  commitLegacySalaryImportIntoDB,
  getAllLegacySalaryImportBatchesFromDB,
  getDeletedLegacySalaryImportBatchesFromDB,
  getSingleLegacySalaryImportBatchFromDB,
  getLegacySalaryRecordsFromDB,
  getLegacySalarySummaryFromDB,
  deleteLegacySalaryImportBatchFromDB,
  restoreLegacySalaryImportBatchFromDB,
};

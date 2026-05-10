import ExcelJS from "exceljs";
import {
  REPORT_MIME_TYPES,
  REPORT_LAYOUT_COMPANY_NAME,
  REPORT_LAYOUT_SYSTEM_NAME,
  sanitizeReportFileNamePart,
  formatReportAmount,
  formatReportDecimal,
  getStandardGeneratedAtLabel,
  escapeCsvValue,
  applyStandardExcelHeaderStyle,
  applyStandardExcelBodyBorder,
} from "../../utils/reportLayout";
import {
  TAttendanceImportRejectedRow,
  TAttendanceImportRejectionReportPreview,
  TAttendanceImportTemplatePreview,
  TAttendanceImportExportFileResult,
  TAttendanceImportTemplateColumn,
} from "./attendanceImport.interface";

const CSV_MIME_TYPE = REPORT_MIME_TYPES.csv;
const EXCEL_MIME_TYPE = REPORT_MIME_TYPES.excel;
const COMPANY_NAME = REPORT_LAYOUT_COMPANY_NAME;
const SYSTEM_NAME = REPORT_LAYOUT_SYSTEM_NAME;

const sanitizeFileNamePart = sanitizeReportFileNamePart;

const getGeneratedAtLabel = () => getStandardGeneratedAtLabel();


const applyHeaderStyle = applyStandardExcelHeaderStyle;

const applyBodyBorder = applyStandardExcelBodyBorder;

const getTemplateFileBaseName = (preview: TAttendanceImportTemplatePreview) =>
  sanitizeFileNamePart(
    `Attendance-Import-Template-${preview.template.source}-${preview.template.matchBy}`,
  );

const getRejectionFileBaseName = (preview: TAttendanceImportRejectionReportPreview) =>
  sanitizeFileNamePart(`Attendance-Import-Rejections-${preview.batch.batchNo}`);

const getTemplateRows = (preview: TAttendanceImportTemplatePreview) =>
  preview.sampleRows.map((row) => {
    const rowRecord = row as unknown as Record<string, unknown>;

    return preview.columns.map((column) => rowRecord[column.key] ?? "");
  });

export const generateAttendanceImportTemplateCsv = (
  preview: TAttendanceImportTemplatePreview,
): TAttendanceImportExportFileResult => {
  const lines = [
    preview.columns.map((column) => escapeCsvValue(column.header)).join(","),
    ...getTemplateRows(preview).map((row) => row.map(escapeCsvValue).join(",")),
  ];

  const csvText = `\uFEFF${lines.join("\n")}`;

  return {
    buffer: Buffer.from(csvText, "utf8"),
    fileName: `${getTemplateFileBaseName(preview)}.csv`,
    mimeType: CSV_MIME_TYPE,
    reportData: preview,
  };
};

const addTemplateInstructionSheet = (
  workbook: ExcelJS.Workbook,
  preview: TAttendanceImportTemplatePreview,
) => {
  const worksheet = workbook.addWorksheet("Instructions");

  worksheet.columns = [
    { header: "Field", key: "field", width: 28 },
    { header: "Required", key: "required", width: 12 },
    { header: "Format / Allowed Values", key: "format", width: 38 },
    { header: "Description", key: "description", width: 70 },
  ];

  worksheet.mergeCells(1, 1, 1, 4);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, 4);
  worksheet.getCell(2, 1).value = `Attendance Import Template Instructions - ${preview.template.source}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, 4);
  worksheet.getCell(3, 1).value = `Match By: ${preview.template.matchBy} | Generated: ${getGeneratedAtLabel()}`;
  worksheet.getCell(3, 1).alignment = { horizontal: "center" };

  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);
  ["Field", "Required", "Format / Allowed Values", "Description"].forEach(
    (header, index) => {
      headerRow.getCell(index + 1).value = header;
    },
  );
  applyHeaderStyle(headerRow);

  preview.columns.forEach((column: TAttendanceImportTemplateColumn) => {
    const row = worksheet.addRow({
      field: column.header,
      required: column.required ? "Yes" : "No",
      format: column.format || "",
      description: column.description,
    });
    row.alignment = { vertical: "middle", wrapText: true };
    applyBodyBorder(row);
  });

  worksheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
};

export const generateAttendanceImportTemplateExcel = async (
  preview: TAttendanceImportTemplatePreview,
): Promise<TAttendanceImportExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Attendance Import");

  worksheet.columns = preview.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  const headerRow = worksheet.getRow(1);
  preview.columns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  applyHeaderStyle(headerRow);

  getTemplateRows(preview).forEach((rowValues) => {
    const row = worksheet.addRow(rowValues);
    row.alignment = { vertical: "middle", wrapText: true };
    applyBodyBorder(row);
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  // ExcelJS worksheet validation support differs by type version; keep template data plain and import validation server-side.

  addTemplateInstructionSheet(workbook, preview);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileName: `${getTemplateFileBaseName(preview)}.xlsx`,
    mimeType: EXCEL_MIME_TYPE,
    reportData: preview,
  };
};

const getRejectionColumns = () => [
  { header: "SL", key: "slNo", width: 8 },
  { header: "Row No", key: "rowNo", width: 12 },
  { header: "Employee Identifier", key: "employeeIdentifier", width: 24 },
  { header: "Attendance Date", key: "attendanceDate", width: 18 },
  { header: "Reason", key: "reason", width: 60 },
  { header: "Raw Payload", key: "rawPayload", width: 60 },
];

const getRejectionRows = (rejectedRows: TAttendanceImportRejectedRow[]) =>
  rejectedRows.map((row, index) => ({
    slNo: index + 1,
    rowNo: row.rowNo || "",
    employeeIdentifier: row.employeeIdentifier || "",
    attendanceDate: row.attendanceDate || "",
    reason: row.reason,
    rawPayload: row.rawPayload ? JSON.stringify(row.rawPayload) : "",
  }));

export const generateAttendanceImportRejectionCsv = (
  preview: TAttendanceImportRejectionReportPreview,
): TAttendanceImportExportFileResult => {
  const columns = getRejectionColumns();
  const rows = getRejectionRows(preview.rejectedRows);
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(","),
    ...rows.map((row) => {
      const rowRecord = row as Record<string, unknown>;

      return columns.map((column) => escapeCsvValue(rowRecord[column.key])).join(",");
    }),
  ];

  const csvText = `\uFEFF${lines.join("\n")}`;

  return {
    buffer: Buffer.from(csvText, "utf8"),
    fileName: `${getRejectionFileBaseName(preview)}.csv`,
    mimeType: CSV_MIME_TYPE,
    reportData: preview,
  };
};

export const generateAttendanceImportRejectionExcel = async (
  preview: TAttendanceImportRejectionReportPreview,
): Promise<TAttendanceImportExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Rejected Rows");
  const columns = getRejectionColumns();

  worksheet.mergeCells(1, 1, 1, columns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, columns.length);
  worksheet.getCell(2, 1).value = `Attendance Import Rejection Report - ${preview.batch.batchNo}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, columns.length);
  worksheet.getCell(3, 1).value = `Source: ${preview.batch.source} | Match By: ${preview.batch.matchBy} | Total Rows: ${preview.summary.totalRows} | Rejected: ${preview.summary.rejectedRows} | Generated: ${getGeneratedAtLabel()}`;
  worksheet.getCell(3, 1).alignment = { horizontal: "center" };

  worksheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);
  columns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  applyHeaderStyle(headerRow);

  getRejectionRows(preview.rejectedRows).forEach((rowData) => {
    const rowRecord = rowData as Record<string, unknown>;
    const row = worksheet.addRow(columns.map((column) => rowRecord[column.key]));
    row.alignment = { vertical: "middle", wrapText: true };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    applyBodyBorder(row);
  });

  worksheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileName: `${getRejectionFileBaseName(preview)}.xlsx`,
    mimeType: EXCEL_MIME_TYPE,
    reportData: preview,
  };
};

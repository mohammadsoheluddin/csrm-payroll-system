import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const REPORT_LAYOUT_COMPANY_NAME =
  "Chakda Steel & Re-Rolling Mills (Pvt.) Ltd.";
export const REPORT_LAYOUT_SYSTEM_NAME = "CSRM Payroll System";
export const REPORT_LAYOUT_DEPARTMENT_NAME = "Payroll & Accounts Department";

export const REPORT_MIME_TYPES = {
  csv: "text/csv; charset=utf-8",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
} as const;

export const REPORT_LAYOUT_VERSION = "2026.05.01";

export type TReportExportFormat = "preview" | "csv" | "excel" | "pdf";
export type TReportPageOrientation = "portrait" | "landscape";
export type TReportColumnAlign = "left" | "center" | "right";
export type TReportColumnType =
  | "text"
  | "number"
  | "amount"
  | "decimal"
  | "date"
  | "status";

export type TReportColumnDefinition = {
  header: string;
  key: string;
  width?: number;
  align?: TReportColumnAlign;
  type?: TReportColumnType;
  isTotal?: boolean;
};

export type TReportSignatureLabel = {
  label: string;
  role?: string;
};

export type TStandardReportMetadata = {
  title: string;
  subtitle?: string;
  periodLabel?: string;
  companyName?: string;
  departmentName?: string;
  generatedBy?: string;
  generatedAt?: Date;
  filters?: Record<string, unknown>;
  summaryLines?: string[];
  orientation?: TReportPageOrientation;
  signatures?: TReportSignatureLabel[];
};

export const DEFAULT_REPORT_SIGNATURES: TReportSignatureLabel[] = [
  { label: "Prepared By", role: "HR/Admin" },
  { label: "Checked By", role: "Accounts" },
  { label: "Approved By", role: "Management" },
];

export const DEFAULT_REPORT_PAGE_SETUP = {
  excel: {
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  },
  pdf: {
    margin: 36,
    pageSize: "A4",
  },
} as const;

export const sanitizeReportFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const getStandardGeneratedAtLabel = (date: Date = new Date()) =>
  date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatReportAmount = (amount: number) =>
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatReportDecimal = (amount: number) =>
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export const escapeCsvValue = (value: unknown) => {
  const normalizedValue = value === undefined || value === null ? "" : String(value);

  if (
    normalizedValue.includes(",") ||
    normalizedValue.includes("\n") ||
    normalizedValue.includes('"')
  ) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
};

export const getReportRowValue = <TRow extends Record<string, unknown>>(
  row: TRow,
  key: string,
) => row[key] ?? "";

export const buildCsvBuffer = <TRow extends Record<string, unknown>>(
  columns: TReportColumnDefinition[],
  rows: TRow[],
) => {
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvValue(getReportRowValue(row, column.key))).join(","),
    ),
  ];

  return Buffer.from(`\uFEFF${lines.join("\n")}`, "utf8");
};

export const createStandardWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = REPORT_LAYOUT_SYSTEM_NAME;
  workbook.created = new Date();
  workbook.modified = new Date();

  return workbook;
};

export const applyStandardExcelHeaderStyle = (row: ExcelJS.Row) => {
  row.font = { bold: true };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

export const applyStandardExcelBodyBorder = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

export const applyStandardExcelCellFormat = (
  cell: ExcelJS.Cell,
  column: TReportColumnDefinition,
) => {
  if (column.type === "amount" || column.type === "number") {
    cell.numFmt = "#,##0";
  }

  if (column.type === "decimal") {
    cell.numFmt = "#,##0.00";
  }

  cell.alignment = {
    vertical: "middle",
    horizontal: column.align || (column.type === "amount" ? "right" : "left"),
    wrapText: true,
  };
};

export const addStandardExcelTitleRows = (
  worksheet: ExcelJS.Worksheet,
  metadata: TStandardReportMetadata,
  totalColumns: number,
) => {
  worksheet.mergeCells(1, 1, 1, totalColumns);
  worksheet.getCell(1, 1).value =
    metadata.companyName || REPORT_LAYOUT_COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, totalColumns);
  worksheet.getCell(2, 1).value = metadata.departmentName || REPORT_LAYOUT_DEPARTMENT_NAME;
  worksheet.getCell(2, 1).font = { size: 11 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, totalColumns);
  worksheet.getCell(3, 1).value = metadata.periodLabel
    ? `${metadata.title} - ${metadata.periodLabel}`
    : metadata.title;
  worksheet.getCell(3, 1).font = { bold: true, size: 13 };
  worksheet.getCell(3, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(4, 1, 4, totalColumns);
  worksheet.getCell(4, 1).value = [
    metadata.subtitle,
    ...(metadata.summaryLines || []),
    `Generated: ${getStandardGeneratedAtLabel(metadata.generatedAt)}`,
  ]
    .filter(Boolean)
    .join(" | ");
  worksheet.getCell(4, 1).alignment = { horizontal: "center", wrapText: true };
};

export const setupStandardExcelWorksheet = (
  worksheet: ExcelJS.Worksheet,
  columns: TReportColumnDefinition[],
  metadata: TStandardReportMetadata,
) => {
  worksheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width || 18,
  }));

  addStandardExcelTitleRows(worksheet, metadata, columns.length);

  const headerRowNumber = 6;
  const headerRow = worksheet.getRow(headerRowNumber);
  columns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  applyStandardExcelHeaderStyle(headerRow);

  worksheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
  worksheet.pageSetup = {
    paperSize: DEFAULT_REPORT_PAGE_SETUP.excel.paperSize,
    orientation: metadata.orientation || "landscape",
    fitToPage: DEFAULT_REPORT_PAGE_SETUP.excel.fitToPage,
    fitToWidth: DEFAULT_REPORT_PAGE_SETUP.excel.fitToWidth,
    fitToHeight: DEFAULT_REPORT_PAGE_SETUP.excel.fitToHeight,
  };

  return { headerRowNumber };
};

export const addStandardExcelRows = <TRow extends Record<string, unknown>>(
  worksheet: ExcelJS.Worksheet,
  columns: TReportColumnDefinition[],
  rows: TRow[],
) => {
  rows.forEach((row) => {
    const worksheetRow = worksheet.addRow(
      columns.map((column) => getReportRowValue(row, column.key)),
    );

    columns.forEach((column, index) => {
      applyStandardExcelCellFormat(worksheetRow.getCell(index + 1), column);
    });

    applyStandardExcelBodyBorder(worksheetRow);
  });
};

export const createStandardPdfDocument = (
  metadata: Pick<TStandardReportMetadata, "orientation"> = {},
) =>
  new PDFDocument({
    margin: DEFAULT_REPORT_PAGE_SETUP.pdf.margin,
    size: DEFAULT_REPORT_PAGE_SETUP.pdf.pageSize,
    layout: metadata.orientation || "landscape",
  });

export const collectPdfDocumentBuffer = (doc: PDFKit.PDFDocument) => {
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

export const addStandardPdfHeader = (
  doc: PDFKit.PDFDocument,
  metadata: TStandardReportMetadata,
) => {
  doc.fontSize(15).font("Helvetica-Bold").text(
    metadata.companyName || REPORT_LAYOUT_COMPANY_NAME,
    { align: "center" },
  );
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text(
    metadata.departmentName || REPORT_LAYOUT_DEPARTMENT_NAME,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(
    metadata.periodLabel ? `${metadata.title} - ${metadata.periodLabel}` : metadata.title,
    { align: "center" },
  );

  const summaryLine = [metadata.subtitle, ...(metadata.summaryLines || [])]
    .filter(Boolean)
    .join(" | ");

  if (summaryLine) {
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica").text(summaryLine, { align: "center" });
  }

  doc.moveDown(1);
};

export const addStandardPdfFilterSummary = (
  doc: PDFKit.PDFDocument,
  metadata: TStandardReportMetadata,
) => {
  const filters = metadata.filters || {};

  doc.fontSize(9).font("Helvetica-Bold").text("Export Filters");
  doc.font("Helvetica");

  Object.entries(filters).forEach(([key, value]) => {
    doc.text(`${key}: ${value === undefined || value === null || value === "" ? "All" : value}`);
  });

  doc.text(`Generated: ${getStandardGeneratedAtLabel(metadata.generatedAt)}`);
  doc.moveDown(0.8);
};

export const addStandardPdfSignatureFooter = (
  doc: PDFKit.PDFDocument,
  signatures: TReportSignatureLabel[] = DEFAULT_REPORT_SIGNATURES,
) => {
  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica");

  signatures.forEach((signature, index) => {
    const options = {
      continued: index < signatures.length - 1,
      align:
        index === 0 ? "left" : index === signatures.length - 1 ? "right" : "center",
    } as PDFKit.Mixins.TextOptions;

    doc.text(signature.label, options);
  });
};

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import {
  TTimeBillExportFileResult,
  TTimeBillExportPreview,
  TTimeBillExportRow,
} from "./timeBill.interface";

const CSV_MIME_TYPE = "text/csv; charset=utf-8";
const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PDF_MIME_TYPE = "application/pdf";
const COMPANY_NAME = "Chakda Steel & Re-Rolling Mills (Pvt.) Ltd.";
const SYSTEM_NAME = "CSRM Payroll System";
const REPORT_TITLE = "Time Bill Summary";

const sanitizeFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const formatAmount = (amount: number) =>
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const formatDecimal = (amount: number) =>
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getFileBaseName = (preview: TTimeBillExportPreview) =>
  sanitizeFileNamePart(`${REPORT_TITLE}-${preview.summary.payrollMonth}`);

const getGeneratedAtLabel = () =>
  new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const escapeCsvValue = (value: unknown) => {
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

const getColumnDefinitions = () => [
  { header: "SL", key: "slNo", width: 8 },
  { header: "Employee ID", key: "employeeId", width: 18 },
  { header: "Employee Name", key: "employeeName", width: 28 },
  { header: "Designation", key: "designation", width: 24 },
  { header: "Department", key: "department", width: 24 },
  { header: "Gross Salary", key: "grossSalary", width: 16 },
  { header: "Duty Hour", key: "dutyHourPerDay", width: 12 },
  { header: "OT Rate", key: "otRate", width: 14 },
  { header: "OT Hour", key: "otHours", width: 12 },
  { header: "OT Amount", key: "otAmount", width: 16 },
  { header: "Tiffin Days", key: "tiffinDays", width: 14 },
  { header: "Tiffin Rate", key: "tiffinRate", width: 14 },
  { header: "Tiffin Amount", key: "tiffinAmount", width: 16 },
  { header: "Total Amount", key: "totalPayableAmount", width: 16 },
];

const getRowValue = (row: TTimeBillExportRow, key: string) => {
  const rowRecord = row as unknown as Record<string, unknown>;

  return rowRecord[key] ?? "";
};

export const generateTimeBillCsv = (
  preview: TTimeBillExportPreview,
): TTimeBillExportFileResult => {
  const columns = getColumnDefinitions();
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(","),
    ...preview.rows.map((row) =>
      columns.map((column) => escapeCsvValue(getRowValue(row, column.key))).join(","),
    ),
  ];

  const csvText = `\uFEFF${lines.join("\n")}`;

  return {
    buffer: Buffer.from(csvText, "utf8"),
    fileName: `${getFileBaseName(preview)}.csv`,
    mimeType: CSV_MIME_TYPE,
    reportData: preview,
  };
};

const applyHeaderStyle = (row: ExcelJS.Row) => {
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

const applyBodyBorder = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

export const generateTimeBillExcel = async (
  preview: TTimeBillExportPreview,
): Promise<TTimeBillExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(REPORT_TITLE);
  const columns = getColumnDefinitions();

  worksheet.mergeCells(1, 1, 1, columns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, columns.length);
  worksheet.getCell(2, 1).value = `${REPORT_TITLE} - ${preview.summary.payrollMonth}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, columns.length);
  worksheet.getCell(3, 1).value = `Total Employees: ${preview.summary.totalEmployees} | OT Amount: ${preview.summary.totalOtAmount} | Tiffin Amount: ${preview.summary.totalTiffinAmount} | Total Payable: ${preview.summary.totalPayableAmount} | Generated: ${getGeneratedAtLabel()}`;
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

  preview.rows.forEach((row) => {
    const worksheetRow = worksheet.addRow(
      columns.map((column) => getRowValue(row, column.key)),
    );
    worksheetRow.alignment = { vertical: "middle", wrapText: true };

    [6, 8, 10, 12, 13, 14].forEach((cellIndex) => {
      const amountCell = worksheetRow.getCell(cellIndex);
      amountCell.numFmt = "#,##0";
      amountCell.alignment = { vertical: "middle", horizontal: "right" };
    });

    [7, 9, 11].forEach((cellIndex) => {
      worksheetRow.getCell(cellIndex).numFmt = "#,##0.00";
    });

    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    applyBodyBorder(worksheetRow);
  });

  const totalRow = worksheet.addRow([]);
  totalRow.getCell(1).value = "Total";
  totalRow.getCell(1).font = { bold: true };
  worksheet.mergeCells(totalRow.number, 1, totalRow.number, 8);
  totalRow.getCell(1).alignment = { horizontal: "right" };
  totalRow.getCell(9).value = preview.summary.totalOtHours;
  totalRow.getCell(10).value = preview.summary.totalOtAmount;
  totalRow.getCell(11).value = preview.summary.totalTiffinDays;
  totalRow.getCell(13).value = preview.summary.totalTiffinAmount;
  totalRow.getCell(14).value = preview.summary.totalPayableAmount;
  [9, 10, 11, 13, 14].forEach((cellIndex) => {
    totalRow.getCell(cellIndex).font = { bold: true };
    totalRow.getCell(cellIndex).numFmt = "#,##0.00";
    totalRow.getCell(cellIndex).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  });
  applyBodyBorder(totalRow);

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
    fileName: `${getFileBaseName(preview)}.xlsx`,
    mimeType: EXCEL_MIME_TYPE,
    reportData: preview,
  };
};

const addPdfHeader = (doc: PDFKit.PDFDocument, preview: TTimeBillExportPreview) => {
  doc.fontSize(15).font("Helvetica-Bold").text(COMPANY_NAME, {
    align: "center",
  });
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text("Payroll & Accounts Department", {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(
    `${REPORT_TITLE} - ${preview.summary.payrollMonth}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Total Employees: ${preview.summary.totalEmployees} | OT Amount: ${formatAmount(
      preview.summary.totalOtAmount,
    )} | Tiffin Amount: ${formatAmount(
      preview.summary.totalTiffinAmount,
    )} | Total Payable: ${formatAmount(preview.summary.totalPayableAmount)}`,
    { align: "center" },
  );
  doc.moveDown(1);
};

const addPdfSummary = (doc: PDFKit.PDFDocument, preview: TTimeBillExportPreview) => {
  doc.fontSize(9).font("Helvetica-Bold").text("Export Filters");
  doc.font("Helvetica").text(`Company: ${preview.filters.company}`);
  doc.text(`Major Department: ${preview.filters.majorDepartment || "All"}`);
  doc.text(`Department: ${preview.filters.department || "All"}`);
  doc.text(`Branch: ${preview.filters.branch || "All"}`);
  doc.text(`Employee: ${preview.filters.employee || "All"}`);
  doc.text(`Generated: ${getGeneratedAtLabel()}`);
  doc.moveDown(0.8);
};

const addPdfRows = (doc: PDFKit.PDFDocument, rows: TTimeBillExportRow[]) => {
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns = [
    { title: "SL", width: 28 },
    { title: "Employee", width: 155 },
    { title: "Designation", width: 100 },
    { title: "OT Hour", width: 70 },
    { title: "OT Rate", width: 70 },
    { title: "OT Amt", width: 75 },
    { title: "Tiffin", width: 70 },
    { title: "Total", width: 80 },
  ];

  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Math.floor((column.width / 648) * contentWidth),
  }));

  const drawTableHeader = () => {
    let x = doc.page.margins.left;
    const y = doc.y;

    doc.fontSize(8).font("Helvetica-Bold");
    normalizedColumns.forEach((column) => {
      doc.text(column.title, x, y, {
        width: column.width,
        align:
          ["OT Hour", "OT Rate", "OT Amt", "Tiffin", "Total"].includes(column.title)
            ? "right"
            : "left",
      });
      x += column.width;
    });
    doc.moveDown(0.7);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(0.4);
  };

  drawTableHeader();

  rows.forEach((row) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 35) {
      doc.addPage();
      drawTableHeader();
    }

    const rowValues = [
      row.slNo,
      `${row.employeeId} - ${row.employeeName}`,
      row.designation,
      formatDecimal(row.otHours),
      formatAmount(row.otRate),
      formatAmount(row.otAmount),
      formatAmount(row.tiffinAmount),
      formatAmount(row.totalPayableAmount),
    ];

    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica");

    rowValues.forEach((value, index) => {
      doc.text(String(value || ""), x, y, {
        width: normalizedColumns[index]?.width || 80,
        align: index >= 3 ? "right" : "left",
      });
      x += normalizedColumns[index]?.width || 80;
    });

    doc.moveDown(0.8);
  });
};

export const generateTimeBillPDF = async (
  preview: TTimeBillExportPreview,
): Promise<TTimeBillExportFileResult> => {
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const completionPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  addPdfHeader(doc, preview);
  addPdfSummary(doc, preview);
  addPdfRows(doc, preview.rows);

  doc.moveDown(1);
  doc.fontSize(9).font("Helvetica-Bold").text(
    `Total Payable Amount: ${formatAmount(preview.summary.totalPayableAmount)}`,
    { align: "right" },
  );

  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").text("Prepared By", { continued: true });
  doc.text("Checked By", { align: "center", continued: true });
  doc.text("Approved By", { align: "right" });

  doc.end();
  const buffer = await completionPromise;

  return {
    buffer,
    fileName: `${getFileBaseName(preview)}.pdf`,
    mimeType: PDF_MIME_TYPE,
    reportData: preview,
  };
};

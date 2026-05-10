import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
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
import type {
  TLeaveBalanceExportFileResult,
  TLeaveBalanceExportPreview,
  TLeaveBalanceExportRow,
  TLeaveBalanceLedgerEntry,
  TLeaveBalanceLedgerPreview,
} from "./leaveBalance.interface";

const CSV_MIME_TYPE = REPORT_MIME_TYPES.csv;
const EXCEL_MIME_TYPE = REPORT_MIME_TYPES.excel;
const PDF_MIME_TYPE = REPORT_MIME_TYPES.pdf;
const COMPANY_NAME = REPORT_LAYOUT_COMPANY_NAME;
const SYSTEM_NAME = REPORT_LAYOUT_SYSTEM_NAME;

const sanitizeFileNamePart = sanitizeReportFileNamePart;

const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getGeneratedAtLabel = () => getStandardGeneratedAtLabel();


const applyHeaderStyle = applyStandardExcelHeaderStyle;

const applyBodyBorder = applyStandardExcelBodyBorder;

const getLeaveBalanceFileBaseName = (preview: TLeaveBalanceExportPreview) =>
  sanitizeFileNamePart(`Leave-Balance-${preview.summary.year}`);

const getLeaveLedgerFileBaseName = (preview: TLeaveBalanceLedgerPreview) =>
  sanitizeFileNamePart(
    `Employee-Leave-Ledger-${preview.employee.employeeId}-${preview.summary.year}`,
  );

const leaveBalanceColumns = [
  { header: "SL", key: "slNo", width: 8 },
  { header: "Employee ID", key: "employeeId", width: 18 },
  { header: "Employee Name", key: "employeeName", width: 28 },
  { header: "Designation", key: "designation", width: 24 },
  { header: "Department", key: "department", width: 24 },
  { header: "Leave Type", key: "leaveType", width: 18 },
  { header: "Opening", key: "openingBalance", width: 12 },
  { header: "Entitlement", key: "yearlyEntitlement", width: 14 },
  { header: "Earned", key: "earnedDays", width: 12 },
  { header: "Adjusted", key: "adjustedDays", width: 12 },
  { header: "Expired Previous", key: "expiredPreviousYearRemainingDays", width: 16 },
  { header: "Total Credit", key: "totalCreditDays", width: 14 },
  { header: "Approved Used", key: "approvedConsumedDays", width: 14 },
  { header: "Pending", key: "pendingDays", width: 12 },
  { header: "Remaining", key: "remainingDays", width: 14 },
  { header: "Available", key: "availableDays", width: 14 },
  { header: "Over Consumed", key: "overConsumedDays", width: 15 },
  { header: "Status", key: "status", width: 12 },
  { header: "Locked", key: "isLocked", width: 10 },
];

const ledgerColumns = [
  { header: "SL", key: "slNo", width: 8 },
  { header: "Date", key: "entryDate", width: 16 },
  { header: "Leave Type", key: "leaveType", width: 18 },
  { header: "Transaction", key: "transactionType", width: 24 },
  { header: "Status", key: "status", width: 14 },
  { header: "Credit", key: "creditDays", width: 12 },
  { header: "Debit", key: "debitDays", width: 12 },
  { header: "Pending", key: "pendingDays", width: 12 },
  { header: "Balance After", key: "balanceAfter", width: 14 },
  { header: "Reference", key: "reference", width: 30 },
  { header: "Reason", key: "reason", width: 44 },
  { header: "Note", key: "note", width: 44 },
];

const getRowValue = <T extends Record<string, unknown>>(row: T, key: string) =>
  row[key] ?? "";

export const generateLeaveBalanceCsv = (
  preview: TLeaveBalanceExportPreview,
): TLeaveBalanceExportFileResult => {
  const lines = [
    leaveBalanceColumns.map((column) => escapeCsvValue(column.header)).join(","),
    ...preview.rows.map((row) => {
      const rowRecord = row as unknown as Record<string, unknown>;

      return leaveBalanceColumns
        .map((column) => escapeCsvValue(getRowValue(rowRecord, column.key)))
        .join(",");
    }),
  ];

  return {
    buffer: Buffer.from(`\uFEFF${lines.join("\n")}`, "utf8"),
    fileName: `${getLeaveBalanceFileBaseName(preview)}.csv`,
    mimeType: CSV_MIME_TYPE,
    reportData: preview,
  };
};

export const generateLeaveBalanceExcel = async (
  preview: TLeaveBalanceExportPreview,
): Promise<TLeaveBalanceExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Leave Balance");

  worksheet.mergeCells(1, 1, 1, leaveBalanceColumns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, leaveBalanceColumns.length);
  worksheet.getCell(2, 1).value = `Leave Balance Report - ${preview.summary.year}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, leaveBalanceColumns.length);
  worksheet.getCell(3, 1).value = `Employees: ${preview.summary.totalEmployees} | Records: ${preview.summary.totalRecords} | Remaining Days: ${formatNumber(
    preview.summary.remainingDays,
  )} | Generated: ${getGeneratedAtLabel()}`;
  worksheet.getCell(3, 1).alignment = { horizontal: "center" };

  worksheet.columns = leaveBalanceColumns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);
  leaveBalanceColumns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  applyHeaderStyle(headerRow);

  preview.rows.forEach((row) => {
    const rowRecord = row as unknown as Record<string, unknown>;
    const worksheetRow = worksheet.addRow(
      leaveBalanceColumns.map((column) => getRowValue(rowRecord, column.key)),
    );

    worksheetRow.alignment = { vertical: "middle", wrapText: true };

    leaveBalanceColumns.forEach((column, index) => {
      if (
        [
          "openingBalance",
          "yearlyEntitlement",
          "earnedDays",
          "adjustedDays",
          "expiredPreviousYearRemainingDays",
          "totalCreditDays",
          "approvedConsumedDays",
          "pendingDays",
          "remainingDays",
          "availableDays",
          "overConsumedDays",
        ].includes(column.key)
      ) {
        worksheetRow.getCell(index + 1).numFmt = "#,##0.00";
        worksheetRow.getCell(index + 1).alignment = {
          vertical: "middle",
          horizontal: "right",
        };
      }
    });

    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    applyBodyBorder(worksheetRow);
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
    fileName: `${getLeaveBalanceFileBaseName(preview)}.xlsx`,
    mimeType: EXCEL_MIME_TYPE,
    reportData: preview,
  };
};

const addLeaveBalancePdfRows = (
  doc: PDFKit.PDFDocument,
  rows: TLeaveBalanceExportRow[],
) => {
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns = [
    { title: "SL", width: 28 },
    { title: "Employee", width: 170 },
    { title: "Department", width: 130 },
    { title: "Type", width: 80 },
    { title: "Credit", width: 70 },
    { title: "Used", width: 65 },
    { title: "Remain", width: 65 },
    { title: "Locked", width: 55 },
  ];
  const totalDefinedWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Math.floor((column.width / totalDefinedWidth) * contentWidth),
  }));

  const drawHeader = () => {
    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica-Bold");

    normalizedColumns.forEach((column) => {
      doc.text(column.title, x, y, {
        width: column.width,
        align: ["Credit", "Used", "Remain"].includes(column.title) ? "right" : "left",
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

  drawHeader();

  rows.forEach((row) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 35) {
      doc.addPage();
      drawHeader();
    }

    const values = [
      row.slNo,
      `${row.employeeId} - ${row.employeeName}`,
      row.department,
      row.leaveType,
      formatNumber(row.totalCreditDays),
      formatNumber(row.approvedConsumedDays),
      formatNumber(row.remainingDays),
      row.isLocked ? "Yes" : "No",
    ];

    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica");

    values.forEach((value, index) => {
      const isAmountColumn = index >= 4 && index <= 6;
      doc.text(String(value || ""), x, y, {
        width: normalizedColumns[index]?.width || 80,
        align: isAmountColumn ? "right" : "left",
      });
      x += normalizedColumns[index]?.width || 80;
    });

    doc.moveDown(0.8);
  });
};

export const generateLeaveBalancePdf = async (
  preview: TLeaveBalanceExportPreview,
): Promise<TLeaveBalanceExportFileResult> => {
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const completionPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(15).font("Helvetica-Bold").text(COMPANY_NAME, {
    align: "center",
  });
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text("HR & Admin Department", {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(
    `Leave Balance Report - ${preview.summary.year}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Employees: ${preview.summary.totalEmployees} | Records: ${preview.summary.totalRecords} | Remaining: ${formatNumber(
      preview.summary.remainingDays,
    )} | Generated: ${getGeneratedAtLabel()}`,
    { align: "center" },
  );
  doc.moveDown(1);

  addLeaveBalancePdfRows(doc, preview.rows);

  doc.moveDown(1);
  doc.fontSize(9).font("Helvetica-Bold").text(
    `Total Remaining Days: ${formatNumber(preview.summary.remainingDays)}`,
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
    fileName: `${getLeaveBalanceFileBaseName(preview)}.pdf`,
    mimeType: PDF_MIME_TYPE,
    reportData: preview,
  };
};

export const generateLeaveBalanceLedgerCsv = (
  preview: TLeaveBalanceLedgerPreview,
): TLeaveBalanceExportFileResult => {
  const lines = [
    ledgerColumns.map((column) => escapeCsvValue(column.header)).join(","),
    ...preview.entries.map((entry) => {
      const entryRecord = entry as unknown as Record<string, unknown>;

      return ledgerColumns
        .map((column) => escapeCsvValue(getRowValue(entryRecord, column.key)))
        .join(",");
    }),
  ];

  return {
    buffer: Buffer.from(`\uFEFF${lines.join("\n")}`, "utf8"),
    fileName: `${getLeaveLedgerFileBaseName(preview)}.csv`,
    mimeType: CSV_MIME_TYPE,
    reportData: preview,
  };
};

export const generateLeaveBalanceLedgerExcel = async (
  preview: TLeaveBalanceLedgerPreview,
): Promise<TLeaveBalanceExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Employee Leave Ledger");

  worksheet.mergeCells(1, 1, 1, ledgerColumns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, ledgerColumns.length);
  worksheet.getCell(2, 1).value = `Employee Leave Ledger - ${preview.employee.employeeId} - ${preview.employee.name}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, ledgerColumns.length);
  worksheet.getCell(3, 1).value = `Year: ${preview.summary.year} | Entries: ${preview.summary.totalEntries} | Generated: ${getGeneratedAtLabel()}`;
  worksheet.getCell(3, 1).alignment = { horizontal: "center" };

  worksheet.columns = ledgerColumns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);
  ledgerColumns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  applyHeaderStyle(headerRow);

  preview.entries.forEach((entry) => {
    const entryRecord = entry as unknown as Record<string, unknown>;
    const worksheetRow = worksheet.addRow(
      ledgerColumns.map((column) => getRowValue(entryRecord, column.key)),
    );

    worksheetRow.alignment = { vertical: "middle", wrapText: true };

    ledgerColumns.forEach((column, index) => {
      if (["creditDays", "debitDays", "pendingDays", "balanceAfter"].includes(column.key)) {
        worksheetRow.getCell(index + 1).numFmt = "#,##0.00";
        worksheetRow.getCell(index + 1).alignment = {
          vertical: "middle",
          horizontal: "right",
        };
      }
    });

    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    applyBodyBorder(worksheetRow);
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
    fileName: `${getLeaveLedgerFileBaseName(preview)}.xlsx`,
    mimeType: EXCEL_MIME_TYPE,
    reportData: preview,
  };
};

const addLedgerPdfRows = (
  doc: PDFKit.PDFDocument,
  entries: TLeaveBalanceLedgerEntry[],
) => {
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns = [
    { title: "SL", width: 28 },
    { title: "Date", width: 70 },
    { title: "Type", width: 80 },
    { title: "Transaction", width: 120 },
    { title: "Credit", width: 55 },
    { title: "Debit", width: 55 },
    { title: "Pending", width: 60 },
    { title: "Balance", width: 60 },
    { title: "Reason/Note", width: 170 },
  ];
  const totalDefinedWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Math.floor((column.width / totalDefinedWidth) * contentWidth),
  }));

  const drawHeader = () => {
    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica-Bold");

    normalizedColumns.forEach((column) => {
      doc.text(column.title, x, y, {
        width: column.width,
        align: ["Credit", "Debit", "Pending", "Balance"].includes(column.title)
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

  drawHeader();

  entries.forEach((entry) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 35) {
      doc.addPage();
      drawHeader();
    }

    const values = [
      entry.slNo,
      entry.entryDate,
      entry.leaveType,
      entry.transactionType,
      formatNumber(entry.creditDays),
      formatNumber(entry.debitDays),
      formatNumber(entry.pendingDays),
      entry.balanceAfter === null || entry.balanceAfter === undefined
        ? ""
        : formatNumber(entry.balanceAfter),
      [entry.reason, entry.note].filter(Boolean).join(" | "),
    ];

    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica");

    values.forEach((value, index) => {
      const isAmountColumn = index >= 4 && index <= 7;
      doc.text(String(value || ""), x, y, {
        width: normalizedColumns[index]?.width || 80,
        align: isAmountColumn ? "right" : "left",
      });
      x += normalizedColumns[index]?.width || 80;
    });

    doc.moveDown(0.8);
  });
};

export const generateLeaveBalanceLedgerPdf = async (
  preview: TLeaveBalanceLedgerPreview,
): Promise<TLeaveBalanceExportFileResult> => {
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const completionPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(15).font("Helvetica-Bold").text(COMPANY_NAME, {
    align: "center",
  });
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text("HR & Admin Department", {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(
    `Employee Leave Ledger - ${preview.employee.employeeId} - ${preview.employee.name}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Year: ${preview.summary.year} | Entries: ${preview.summary.totalEntries} | Generated: ${getGeneratedAtLabel()}`,
    { align: "center" },
  );
  doc.moveDown(1);

  addLedgerPdfRows(doc, preview.entries);

  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").text("Prepared By", { continued: true });
  doc.text("Checked By", { align: "center", continued: true });
  doc.text("Approved By", { align: "right" });

  doc.end();
  const buffer = await completionPromise;

  return {
    buffer,
    fileName: `${getLeaveLedgerFileBaseName(preview)}.pdf`,
    mimeType: PDF_MIME_TYPE,
    reportData: preview,
  };
};

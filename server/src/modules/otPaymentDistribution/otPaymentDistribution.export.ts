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
import {
  TOtPaymentDistributionExportFileResult,
  TOtPaymentDistributionExportPreview,
  TOtPaymentDistributionExportRow,
  TOtPaymentDistributionPaymentMode,
} from "./otPaymentDistribution.interface";

const CSV_MIME_TYPE = REPORT_MIME_TYPES.csv;
const EXCEL_MIME_TYPE = REPORT_MIME_TYPES.excel;
const PDF_MIME_TYPE = REPORT_MIME_TYPES.pdf;
const COMPANY_NAME = REPORT_LAYOUT_COMPANY_NAME;
const SYSTEM_NAME = REPORT_LAYOUT_SYSTEM_NAME;

const PAYMENT_MODE_TITLE: Record<TOtPaymentDistributionPaymentMode, string> = {
  bank: "OT Bank Sheet",
  cash: "OT Cash Sheet",
  mobile_banking: "OT Mobile Banking Sheet",
};

const sanitizeFileNamePart = sanitizeReportFileNamePart;

const formatAmount = formatReportAmount;

const getPaymentModeTitle = (paymentMode: TOtPaymentDistributionPaymentMode) =>
  PAYMENT_MODE_TITLE[paymentMode];

const getFileBaseName = (preview: TOtPaymentDistributionExportPreview) =>
  sanitizeFileNamePart(
    `${getPaymentModeTitle(preview.summary.paymentMode)}-${preview.summary.payrollMonth}`,
  );

const getGeneratedAtLabel = () => getStandardGeneratedAtLabel();


const getColumnDefinitions = (paymentMode: TOtPaymentDistributionPaymentMode) => {
  const commonColumns = [
    { header: "SL", key: "slNo", width: 8 },
    { header: "Employee ID", key: "employeeId", width: 18 },
    { header: "Employee Name", key: "employeeName", width: 28 },
    { header: "Designation", key: "designation", width: 24 },
    { header: "Department", key: "department", width: 24 },
  ];

  if (paymentMode === "bank") {
    return [
      ...commonColumns,
      { header: "Account Name", key: "accountName", width: 30 },
      { header: "Bank Name", key: "bankName", width: 24 },
      { header: "Branch", key: "bankBranchName", width: 24 },
      { header: "Account No", key: "accountNo", width: 24 },
      { header: "Process Branch No", key: "processBankBranchNo", width: 20 },
      { header: "Routing No", key: "routingNo", width: 20 },
      { header: "Amount", key: "payableAmount", width: 16 },
    ];
  }

  if (paymentMode === "mobile_banking") {
    return [
      ...commonColumns,
      { header: "Provider", key: "mobileBankingProvider", width: 20 },
      { header: "Mobile Banking No", key: "mobileBankingNo", width: 24 },
      { header: "Amount", key: "payableAmount", width: 16 },
    ];
  }

  return [
    ...commonColumns,
    { header: "Cash Pay Reason", key: "cashPayReason", width: 44 },
    { header: "Payment Warning", key: "paymentInfoWarning", width: 44 },
    { header: "Amount", key: "payableAmount", width: 16 },
  ];
};

const getRowValue = (row: TOtPaymentDistributionExportRow, key: string) => {
  const rowRecord = row as unknown as Record<string, unknown>;

  return rowRecord[key] ?? "";
};

export const generateOtPaymentDistributionCsv = (
  preview: TOtPaymentDistributionExportPreview,
): TOtPaymentDistributionExportFileResult => {
  const columns = getColumnDefinitions(preview.summary.paymentMode);
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

const applyHeaderStyle = applyStandardExcelHeaderStyle;

const applyBodyBorder = applyStandardExcelBodyBorder;

export const generateOtPaymentDistributionExcel = async (
  preview: TOtPaymentDistributionExportPreview,
): Promise<TOtPaymentDistributionExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(getPaymentModeTitle(preview.summary.paymentMode));
  const columns = getColumnDefinitions(preview.summary.paymentMode);

  worksheet.mergeCells(1, 1, 1, columns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, columns.length);
  worksheet.getCell(2, 1).value = `${getPaymentModeTitle(
    preview.summary.paymentMode,
  )} - ${preview.summary.payrollMonth}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, columns.length);
  worksheet.getCell(3, 1).value = `Total Employees: ${preview.summary.totalEmployees} | Total Amount: ${preview.summary.totalAmount} | Generated: ${getGeneratedAtLabel()}`;
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

    const amountCell = worksheetRow.getCell(columns.length);
    amountCell.numFmt = "#,##0";
    amountCell.alignment = { vertical: "middle", horizontal: "right" };

    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    applyBodyBorder(worksheetRow);
  });

  const totalRow = worksheet.addRow([]);
  totalRow.getCell(1).value = "Total";
  totalRow.getCell(1).font = { bold: true };
  worksheet.mergeCells(totalRow.number, 1, totalRow.number, columns.length - 1);
  totalRow.getCell(1).alignment = { horizontal: "right" };
  totalRow.getCell(columns.length).value = preview.summary.totalAmount;
  totalRow.getCell(columns.length).font = { bold: true };
  totalRow.getCell(columns.length).numFmt = "#,##0";
  totalRow.getCell(columns.length).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
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

const addPdfHeader = (
  doc: PDFKit.PDFDocument,
  preview: TOtPaymentDistributionExportPreview,
) => {
  doc.fontSize(15).font("Helvetica-Bold").text(COMPANY_NAME, {
    align: "center",
  });
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text("Payroll & Accounts Department", {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(
    `${getPaymentModeTitle(preview.summary.paymentMode)} - ${preview.summary.payrollMonth}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Total Employees: ${preview.summary.totalEmployees} | Total Amount: ${formatAmount(
      preview.summary.totalAmount,
    )} | Generated: ${getGeneratedAtLabel()}`,
    { align: "center" },
  );
  doc.moveDown(1);
};

const addPdfSummary = (
  doc: PDFKit.PDFDocument,
  preview: TOtPaymentDistributionExportPreview,
) => {
  doc.fontSize(9).font("Helvetica-Bold").text("Export Filters");
  doc.font("Helvetica").text(`Company: ${preview.filters.company}`);
  doc.text(`Major Department: ${preview.filters.majorDepartment || "All"}`);
  doc.text(`Department: ${preview.filters.department || "All"}`);
  doc.text(`Branch: ${preview.filters.branch || "All"}`);
  doc.text(`Employee: ${preview.filters.employee || "All"}`);
  doc.moveDown(0.8);
};

const addPdfRows = (
  doc: PDFKit.PDFDocument,
  rows: TOtPaymentDistributionExportRow[],
  paymentMode: TOtPaymentDistributionPaymentMode,
) => {
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns =
    paymentMode === "bank"
      ? [
          { title: "SL", width: 28 },
          { title: "Employee", width: 160 },
          { title: "Bank/Branch", width: 160 },
          { title: "Account No", width: 130 },
          { title: "Amount", width: 75 },
        ]
      : paymentMode === "mobile_banking"
        ? [
            { title: "SL", width: 28 },
            { title: "Employee", width: 210 },
            { title: "Provider", width: 120 },
            { title: "Mobile No", width: 120 },
            { title: "Amount", width: 75 },
          ]
        : [
            { title: "SL", width: 28 },
            { title: "Employee", width: 210 },
            { title: "Department", width: 150 },
            { title: "Reason", width: 120 },
            { title: "Amount", width: 75 },
          ];

  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Math.floor((column.width / 553) * contentWidth),
  }));

  const drawTableHeader = () => {
    let x = doc.page.margins.left;
    const y = doc.y;

    doc.fontSize(8).font("Helvetica-Bold");
    normalizedColumns.forEach((column) => {
      doc.text(column.title, x, y, {
        width: column.width,
        align: column.title === "Amount" ? "right" : "left",
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

    const rowValues =
      paymentMode === "bank"
        ? [
            row.slNo,
            `${row.employeeId} - ${row.employeeName}`,
            `${row.bankName || ""} ${row.bankBranchName || ""}`.trim(),
            row.accountNo,
            formatAmount(row.payableAmount),
          ]
        : paymentMode === "mobile_banking"
          ? [
              row.slNo,
              `${row.employeeId} - ${row.employeeName}`,
              row.mobileBankingProvider,
              row.mobileBankingNo,
              formatAmount(row.payableAmount),
            ]
          : [
              row.slNo,
              `${row.employeeId} - ${row.employeeName}`,
              row.department,
              row.cashPayReason,
              formatAmount(row.payableAmount),
            ];

    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica");

    rowValues.forEach((value, index) => {
      doc.text(String(value || ""), x, y, {
        width: normalizedColumns[index]?.width || 80,
        align: index === rowValues.length - 1 ? "right" : "left",
      });
      x += normalizedColumns[index]?.width || 80;
    });

    doc.moveDown(0.8);
  });
};

export const generateOtPaymentDistributionPDF = async (
  preview: TOtPaymentDistributionExportPreview,
): Promise<TOtPaymentDistributionExportFileResult> => {
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const completionPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  addPdfHeader(doc, preview);
  addPdfSummary(doc, preview);
  addPdfRows(doc, preview.rows, preview.summary.paymentMode);

  doc.moveDown(1);
  doc.fontSize(9).font("Helvetica-Bold").text(
    `Total Amount: ${formatAmount(preview.summary.totalAmount)}`,
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

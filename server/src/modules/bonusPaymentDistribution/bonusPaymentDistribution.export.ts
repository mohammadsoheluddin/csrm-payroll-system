import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import {
  TBonusPaymentDistributionExportFileResult,
  TBonusPaymentDistributionExportPreview,
  TBonusPaymentDistributionExportRow,
  TBonusPaymentDistributionPaymentMode,
} from "./bonusPaymentDistribution.interface";

const CSV_MIME_TYPE = "text/csv; charset=utf-8";
const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PDF_MIME_TYPE = "application/pdf";
const COMPANY_NAME = "Chakda Steel & Re-Rolling Mills (Pvt.) Ltd.";
const SYSTEM_NAME = "CSRM Payroll System";

const PAYMENT_MODE_TITLE: Record<TBonusPaymentDistributionPaymentMode, string> = {
  bank: "Bonus Bank Sheet",
  cash: "Bonus Cash Sheet",
  mobile_banking: "Bonus Mobile Banking Sheet",
};

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

const getPaymentModeTitle = (
  paymentMode: TBonusPaymentDistributionPaymentMode,
) => PAYMENT_MODE_TITLE[paymentMode];

const getFileBaseName = (preview: TBonusPaymentDistributionExportPreview) => {
  const bonusNamePart = preview.summary.bonusName
    ? `-${preview.summary.bonusName}`
    : "";

  return sanitizeFileNamePart(
    `${getPaymentModeTitle(preview.summary.paymentMode)}-${preview.summary.bonusMonth}${bonusNamePart}`,
  );
};

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

const getColumnDefinitions = (
  paymentMode: TBonusPaymentDistributionPaymentMode,
) => {
  const commonColumns = [
    { header: "SL", key: "slNo", width: 8 },
    { header: "Employee ID", key: "employeeId", width: 18 },
    { header: "Employee Name", key: "employeeName", width: 28 },
    { header: "Designation", key: "designation", width: 24 },
    { header: "Department", key: "department", width: 24 },
    { header: "Bonus Name", key: "bonusName", width: 26 },
    { header: "Bonus Type", key: "bonusType", width: 18 },
    { header: "Basic Salary", key: "basicSalary", width: 16 },
    { header: "Gross Salary", key: "grossSalary", width: 16 },
    { header: "Calculated Bonus", key: "calculatedBonusAmount", width: 18 },
    { header: "Payable Bonus", key: "payableBonusAmount", width: 18 },
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
      { header: "Payable Amount", key: "payableAmount", width: 16 },
    ];
  }

  if (paymentMode === "mobile_banking") {
    return [
      ...commonColumns,
      { header: "Provider", key: "mobileBankingProvider", width: 20 },
      { header: "Mobile Banking No", key: "mobileBankingNo", width: 24 },
      { header: "Payable Amount", key: "payableAmount", width: 16 },
    ];
  }

  return [
    ...commonColumns,
    { header: "Cash Pay Reason", key: "cashPayReason", width: 44 },
    { header: "Payment Warning", key: "paymentInfoWarning", width: 44 },
    { header: "Payable Amount", key: "payableAmount", width: 16 },
  ];
};

const getRowValue = (row: TBonusPaymentDistributionExportRow, key: string) => {
  const rowRecord = row as unknown as Record<string, unknown>;

  return rowRecord[key] ?? "";
};

export const generateBonusPaymentDistributionCsv = (
  preview: TBonusPaymentDistributionExportPreview,
): TBonusPaymentDistributionExportFileResult => {
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

export const generateBonusPaymentDistributionExcel = async (
  preview: TBonusPaymentDistributionExportPreview,
): Promise<TBonusPaymentDistributionExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SYSTEM_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(
    getPaymentModeTitle(preview.summary.paymentMode),
  );
  const columns = getColumnDefinitions(preview.summary.paymentMode);

  worksheet.mergeCells(1, 1, 1, columns.length);
  worksheet.getCell(1, 1).value = COMPANY_NAME;
  worksheet.getCell(1, 1).font = { bold: true, size: 15 };
  worksheet.getCell(1, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, columns.length);
  worksheet.getCell(2, 1).value = `${getPaymentModeTitle(
    preview.summary.paymentMode,
  )} - ${preview.summary.bonusMonth}`;
  worksheet.getCell(2, 1).font = { bold: true, size: 13 };
  worksheet.getCell(2, 1).alignment = { horizontal: "center" };

  worksheet.mergeCells(3, 1, 3, columns.length);
  worksheet.getCell(3, 1).value = `Bonus: ${
    preview.summary.bonusName || "All"
  } | Total Employees: ${preview.summary.totalEmployees} | Total Amount: ${
    preview.summary.totalAmount
  } | Generated: ${getGeneratedAtLabel()}`;
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

    [
      "basicSalary",
      "grossSalary",
      "calculatedBonusAmount",
      "payableBonusAmount",
      "payableAmount",
    ].forEach((key) => {
      const columnIndex = columns.findIndex((column) => column.key === key);

      if (columnIndex >= 0) {
        const amountCell = worksheetRow.getCell(columnIndex + 1);
        amountCell.numFmt = "#,##0";
        amountCell.alignment = { vertical: "middle", horizontal: "right" };
      }
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
  preview: TBonusPaymentDistributionExportPreview,
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
    `${getPaymentModeTitle(preview.summary.paymentMode)} - ${preview.summary.bonusMonth}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Bonus: ${preview.summary.bonusName || "All"} | Total Employees: ${
      preview.summary.totalEmployees
    } | Total Amount: ${formatAmount(
      preview.summary.totalAmount,
    )} | Generated: ${getGeneratedAtLabel()}`,
    { align: "center" },
  );
  doc.moveDown(1);
};

const addPdfSummary = (
  doc: PDFKit.PDFDocument,
  preview: TBonusPaymentDistributionExportPreview,
) => {
  doc.fontSize(9).font("Helvetica-Bold").text("Export Filters");
  doc.font("Helvetica").text(`Company: ${preview.filters.company}`);
  doc.text(`Major Department: ${preview.filters.majorDepartment || "All"}`);
  doc.text(`Department: ${preview.filters.department || "All"}`);
  doc.text(`Branch: ${preview.filters.branch || "All"}`);
  doc.text(`Employee: ${preview.filters.employee || "All"}`);
  doc.text(`Bonus Name: ${preview.filters.bonusName || "All"}`);
  doc.text(`Bonus Type: ${preview.filters.bonusType || "All"}`);
  doc.moveDown(0.8);
};

const addPdfRows = (
  doc: PDFKit.PDFDocument,
  rows: TBonusPaymentDistributionExportRow[],
  paymentMode: TBonusPaymentDistributionPaymentMode,
) => {
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns =
    paymentMode === "bank"
      ? [
          { title: "SL", width: 28 },
          { title: "Employee", width: 150 },
          { title: "Bonus", width: 110 },
          { title: "Bank/Branch", width: 140 },
          { title: "Account No", width: 120 },
          { title: "Payable", width: 75 },
        ]
      : paymentMode === "mobile_banking"
        ? [
            { title: "SL", width: 28 },
            { title: "Employee", width: 170 },
            { title: "Bonus", width: 120 },
            { title: "Provider", width: 100 },
            { title: "Mobile No", width: 110 },
            { title: "Payable", width: 75 },
          ]
        : [
            { title: "SL", width: 28 },
            { title: "Employee", width: 170 },
            { title: "Bonus", width: 120 },
            { title: "Department", width: 120 },
            { title: "Reason", width: 110 },
            { title: "Payable", width: 75 },
          ];

  const totalDefinedWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Math.floor((column.width / totalDefinedWidth) * contentWidth),
  }));

  const drawTableHeader = () => {
    let x = doc.page.margins.left;
    const y = doc.y;

    doc.fontSize(8).font("Helvetica-Bold");
    normalizedColumns.forEach((column) => {
      doc.text(column.title, x, y, {
        width: column.width,
        align: column.title === "Payable" ? "right" : "left",
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
            row.bonusName,
            `${row.bankName || ""} ${row.bankBranchName || ""}`.trim(),
            row.accountNo,
            formatAmount(row.payableAmount),
          ]
        : paymentMode === "mobile_banking"
          ? [
              row.slNo,
              `${row.employeeId} - ${row.employeeName}`,
              row.bonusName,
              row.mobileBankingProvider,
              row.mobileBankingNo,
              formatAmount(row.payableAmount),
            ]
          : [
              row.slNo,
              `${row.employeeId} - ${row.employeeName}`,
              row.bonusName,
              row.department,
              row.cashPayReason,
              formatAmount(row.payableAmount),
            ];

    let x = doc.page.margins.left;
    const y = doc.y;
    doc.fontSize(8).font("Helvetica");

    rowValues.forEach((value, index) => {
      const isAmountColumn = index === rowValues.length - 1;

      doc.text(String(value || ""), x, y, {
        width: normalizedColumns[index]?.width || 80,
        align: isAmountColumn ? "right" : "left",
      });
      x += normalizedColumns[index]?.width || 80;
    });

    doc.moveDown(0.8);
  });
};

export const generateBonusPaymentDistributionPDF = async (
  preview: TBonusPaymentDistributionExportPreview,
): Promise<TBonusPaymentDistributionExportFileResult> => {
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

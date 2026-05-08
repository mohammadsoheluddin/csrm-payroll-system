import ExcelJS from "exceljs";
import { TBankSheetPreview, TBankSheetRow } from "./bankSheet.interface";
import { getMonthLabel } from "./bankSheet.utils";

const BANK_SHEET_FILE_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const BANK_SHEET_COLUMNS = [
  { header: "SL No", key: "slNo", width: 10 },
  { header: "Name of A/C", key: "nameOfAccount", width: 32 },
  {
    header: "A/C Bank Branch Code",
    key: "accountBankBranchCode",
    width: 24,
  },
  { header: "A/C No", key: "accountNo", width: 24 },
  {
    header: "Process Bank Branch No",
    key: "processBankBranchNo",
    width: 26,
  },
  { header: "Branch", key: "branch", width: 28 },
  { header: "Amount in Tk", key: "amountInTk", width: 18 },
];

const formatDateTimeForExcel = () => {
  const now = new Date();

  return now.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sanitizeFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-");

const applyBorderToRow = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

const applyMoneyFormat = (row: ExcelJS.Row, cellNumber: number) => {
  const cell = row.getCell(cellNumber);
  cell.numFmt = "#,##0";
  cell.alignment = { vertical: "middle", horizontal: "right" };
};

const addOfficialHeader = (
  worksheet: ExcelJS.Worksheet,
  preview: TBankSheetPreview,
) => {
  const monthLabel = getMonthLabel(preview.summary.month, preview.summary.year);

  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = "CSRM Payroll System";
  worksheet.getCell("A1").font = { bold: true, size: 16 };
  worksheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells("A2:G2");
  worksheet.getCell("A2").value = `Salary Bank Sheet - ${monthLabel}`;
  worksheet.getCell("A2").font = { bold: true, size: 13 };
  worksheet.getCell("A2").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells("A3:G3");
  worksheet.getCell("A3").value =
    `Payment Mode: ${preview.summary.paymentMode} | Total Employees: ${preview.summary.totalIncluded} | Total Amount: ${preview.summary.totalAmount} | Generated: ${formatDateTimeForExcel()}`;
  worksheet.getCell("A3").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 22;
  worksheet.getRow(3).height = 20;
};

const addBankSheetTable = (
  worksheet: ExcelJS.Worksheet,
  rows: TBankSheetRow[],
) => {
  const headerRowNumber = 5;

  BANK_SHEET_COLUMNS.forEach((column, index) => {
    const cell = worksheet.getCell(headerRowNumber, index + 1);
    cell.value = column.header;
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getColumn(index + 1).width = column.width;
  });

  rows.forEach((row, index) => {
    const rowNumber = headerRowNumber + 1 + index;
    const worksheetRow = worksheet.getRow(rowNumber);

    worksheetRow.values = [
      row.slNo,
      row.nameOfAccount,
      row.accountBankBranchCode,
      row.accountNo,
      row.processBankBranchNo,
      row.branch,
      row.amountInTk,
    ];

    worksheetRow.alignment = { vertical: "middle" };
    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    applyMoneyFormat(worksheetRow, 7);
    applyBorderToRow(worksheetRow);
  });

  const totalRowNumber = headerRowNumber + rows.length + 1;
  const totalRow = worksheet.getRow(totalRowNumber);

  totalRow.getCell(1).value = "Total";
  totalRow.getCell(1).font = { bold: true };
  worksheet.mergeCells(totalRowNumber, 1, totalRowNumber, 6);
  totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "right" };

  totalRow.getCell(7).value = rows.reduce(
    (sum, row) => sum + Number(row.amountInTk || 0),
    0,
  );
  totalRow.getCell(7).font = { bold: true };
  applyMoneyFormat(totalRow, 7);
  applyBorderToRow(totalRow);

  worksheet.views = [
    {
      state: "frozen",
      ySplit: headerRowNumber,
    },
  ];
};

const addExcludedRowsSheet = (
  workbook: ExcelJS.Workbook,
  preview: TBankSheetPreview,
) => {
  if (!preview.excludedRows.length) {
    return;
  }

  const worksheet = workbook.addWorksheet("Excluded Rows");

  worksheet.columns = [
    { header: "SL", key: "sl", width: 8 },
    { header: "Payroll ID", key: "payrollId", width: 28 },
    { header: "Employee ID", key: "employeeId", width: 18 },
    { header: "Employee Name", key: "employeeName", width: 30 },
    { header: "Payable Salary", key: "payableSalary", width: 18 },
    { header: "Reason", key: "reason", width: 50 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  applyBorderToRow(headerRow);

  preview.excludedRows.forEach((row, index) => {
    const worksheetRow = worksheet.addRow({
      sl: index + 1,
      payrollId: row.payrollId,
      employeeId: row.employee?.employeeId || "",
      employeeName: row.employee?.employeeName || "",
      payableSalary: row.payableSalary,
      reason: row.reason,
    });

    worksheetRow.alignment = { vertical: "middle" };
    worksheetRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheetRow.getCell(5).numFmt = "#,##0";
    applyBorderToRow(worksheetRow);
  });
};

export const generateSalaryBankSheetExcel = async (
  preview: TBankSheetPreview,
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CSRM Payroll System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Salary Bank Sheet");

  addOfficialHeader(worksheet, preview);
  addBankSheetTable(worksheet, preview.rows);
  addExcludedRowsSheet(workbook, preview);

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const fileName = `salary-bank-sheet-${sanitizeFileNamePart(
    preview.summary.payrollMonth,
  )}.xlsx`;

  return {
    fileName,
    mimeType: BANK_SHEET_FILE_MIME_TYPE,
    buffer,
  };
};

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import {
  REPORT_LAYOUT_COMPANY_NAME,
  REPORT_LAYOUT_DEPARTMENT_NAME,
  REPORT_LAYOUT_SYSTEM_NAME,
  REPORT_MIME_TYPES,
  applyStandardExcelBodyBorder,
  applyStandardExcelHeaderStyle,
  escapeCsvValue,
  formatReportAmount,
  getStandardGeneratedAtLabel,
  sanitizeReportFileNamePart,
} from "../../utils/reportLayout";
import {
  TSalarySummaryAmountTotals,
  TSalarySummaryExportFileResult,
  TSalarySummaryOtTotals,
  TSalarySummaryPreview,
} from "./salarySummary.interface";

const formatAmount = (value: number) => formatReportAmount(Number(value || 0));

const getFileBaseName = (preview: TSalarySummaryPreview) =>
  sanitizeReportFileNamePart(`Salary-Summary-${preview.payrollMonth}`);

const addCsvSectionLine = (lines: string[], values: unknown[]) => {
  lines.push(values.map((value) => escapeCsvValue(value)).join(","));
};

const addSalaryTotalsCsvLines = (
  lines: string[],
  title: string,
  totals: TSalarySummaryAmountTotals,
) => {
  addCsvSectionLine(lines, [title, ""]);
  addCsvSectionLine(lines, ["Gross Amount", totals.grossAmount]);
  addCsvSectionLine(lines, ["Net Amount", totals.netAmount]);
  addCsvSectionLine(lines, ["Bank/Mobile Amount", totals.bankAndMobileAmount]);
  addCsvSectionLine(lines, ["Cash Amount", totals.cashAmount]);
  addCsvSectionLine(lines, ["AIT Amount", totals.aitAmount]);
  addCsvSectionLine(lines, ["Loan Amount", totals.loanAmount]);
  addCsvSectionLine(lines, ["Suspense Amount", totals.suspenseAmount]);
  addCsvSectionLine(lines, ["Total Deduction", totals.totalDeduction]);
  lines.push("");
};

const addOtTotalsCsvLines = (
  lines: string[],
  title: string,
  totals: TSalarySummaryOtTotals,
) => {
  addCsvSectionLine(lines, [title, ""]);
  addCsvSectionLine(lines, ["Gross/Payable Amount", totals.grossAmount]);
  addCsvSectionLine(lines, ["OT Amount", totals.otAmount]);
  addCsvSectionLine(lines, ["Tiffin Amount", totals.tiffinAmount]);
  addCsvSectionLine(lines, ["Bank/Mobile Amount", totals.bankAndMobileAmount]);
  addCsvSectionLine(lines, ["Cash Amount", totals.cashAmount]);
  lines.push("");
};

export const generateSalarySummaryCsv = (
  preview: TSalarySummaryPreview,
): TSalarySummaryExportFileResult => {
  const lines: string[] = [];

  addCsvSectionLine(lines, [REPORT_LAYOUT_COMPANY_NAME]);
  addCsvSectionLine(lines, ["Salary Summary", preview.payrollMonth]);
  addCsvSectionLine(lines, ["Generated", getStandardGeneratedAtLabel()]);
  lines.push("");

  preview.salaryAndWagesSections.forEach((section) => {
    addCsvSectionLine(lines, [section.title]);
    addCsvSectionLine(lines, [
      "Group",
      "Employees",
      "Gross",
      "Net",
      "Bank/Mobile",
      "Cash",
      "AIT",
      "Loan",
      "Suspense",
      "Deduction",
    ]);

    section.rows.forEach((row) => {
      addCsvSectionLine(lines, [
        row.groupName,
        row.employeeCount,
        row.grossAmount,
        row.netAmount,
        row.bankAndMobileAmount,
        row.cashAmount,
        row.aitAmount,
        row.loanAmount,
        row.suspenseAmount,
        row.totalDeduction,
      ]);
    });

    addCsvSectionLine(lines, [
      "Grand Total",
      section.grandTotal.employeeCount,
      section.grandTotal.grossAmount,
      section.grandTotal.netAmount,
      section.grandTotal.bankAndMobileAmount,
      section.grandTotal.cashAmount,
      section.grandTotal.aitAmount,
      section.grandTotal.loanAmount,
      section.grandTotal.suspenseAmount,
      section.grandTotal.totalDeduction,
    ]);
    lines.push("");
  });

  preview.overtimeSections.forEach((section) => {
    addCsvSectionLine(lines, [section.title]);
    addCsvSectionLine(lines, [
      "Group",
      "Employees",
      "Gross/Payable",
      "OT",
      "Tiffin",
      "Bank/Mobile",
      "Cash",
    ]);

    section.rows.forEach((row) => {
      addCsvSectionLine(lines, [
        row.groupName,
        row.employeeCount,
        row.grossAmount,
        row.otAmount,
        row.tiffinAmount,
        row.bankAndMobileAmount,
        row.cashAmount,
      ]);
    });

    addCsvSectionLine(lines, [
      "Grand Total",
      section.grandTotal.employeeCount,
      section.grandTotal.grossAmount,
      section.grandTotal.otAmount,
      section.grandTotal.tiffinAmount,
      section.grandTotal.bankAndMobileAmount,
      section.grandTotal.cashAmount,
    ]);
    lines.push("");
  });

  addSalaryTotalsCsvLines(
    lines,
    "Combined Salary & Wages",
    preview.combinedTotals.salaryAndWages,
  );
  addOtTotalsCsvLines(lines, "Combined OT", preview.combinedTotals.overtime);
  addCsvSectionLine(lines, ["Group Total (Salary, Wages & OT)"]);
  addCsvSectionLine(lines, [
    "Gross Amount",
    preview.combinedTotals.groupTotal.grossAmount,
  ]);
  addCsvSectionLine(lines, [
    "Net Amount",
    preview.combinedTotals.groupTotal.netAmount,
  ]);
  addCsvSectionLine(lines, [
    "Bank/Mobile Amount",
    preview.combinedTotals.groupTotal.bankAndMobileAmount,
  ]);
  addCsvSectionLine(lines, ["Cash Amount", preview.combinedTotals.groupTotal.cashAmount]);

  return {
    buffer: Buffer.from(`\uFEFF${lines.join("\n")}`, "utf8"),
    fileName: `${getFileBaseName(preview)}.csv`,
    mimeType: REPORT_MIME_TYPES.csv,
    reportData: preview,
  };
};

const setHeaderCell = (worksheet: ExcelJS.Worksheet, address: string, value: string) => {
  const cell = worksheet.getCell(address);
  cell.value = value;
  cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F4C81" },
  };
};

const styleAmountCell = (cell: ExcelJS.Cell, bold = false) => {
  cell.numFmt = "#,##0";
  cell.alignment = { horizontal: "right", vertical: "middle" };
  cell.font = { bold };
};

const addExcelSalarySection = (
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  title: string,
  totals: TSalarySummaryAmountTotals,
) => {
  worksheet.mergeCells(startRow, 1, startRow, 3);
  setHeaderCell(worksheet, `A${startRow}`, title);
  const rows = [
    ["Gross Amount", totals.grossAmount],
    ["Net Amount", totals.netAmount],
    ["Bank/Mobile Amount", totals.bankAndMobileAmount],
    ["Cash Amount", totals.cashAmount],
    ["AIT Amount", totals.aitAmount],
    ["Loan Amount", totals.loanAmount],
    ["Suspense Amount", totals.suspenseAmount],
    ["Total Deduction", totals.totalDeduction],
  ];

  rows.forEach((row, index) => {
    const excelRow = worksheet.getRow(startRow + index + 1);
    excelRow.getCell(1).value = row[0];
    excelRow.getCell(3).value = row[1];
    excelRow.getCell(1).font = { bold: true };
    styleAmountCell(excelRow.getCell(3), true);
    applyStandardExcelBodyBorder(excelRow);
  });

  return startRow + rows.length + 2;
};

const addExcelOtSection = (
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  title: string,
  totals: TSalarySummaryOtTotals,
) => {
  worksheet.mergeCells(startRow, 1, startRow, 3);
  setHeaderCell(worksheet, `A${startRow}`, title);
  const rows = [
    ["Gross/Payable Amount", totals.grossAmount],
    ["OT Amount", totals.otAmount],
    ["Tiffin Amount", totals.tiffinAmount],
    ["Bank/Mobile Amount", totals.bankAndMobileAmount],
    ["Cash Amount", totals.cashAmount],
  ];

  rows.forEach((row, index) => {
    const excelRow = worksheet.getRow(startRow + index + 1);
    excelRow.getCell(1).value = row[0];
    excelRow.getCell(3).value = row[1];
    excelRow.getCell(1).font = { bold: true };
    styleAmountCell(excelRow.getCell(3), true);
    applyStandardExcelBodyBorder(excelRow);
  });

  return startRow + rows.length + 2;
};

export const generateSalarySummaryExcel = async (
  preview: TSalarySummaryPreview,
): Promise<TSalarySummaryExportFileResult> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = REPORT_LAYOUT_SYSTEM_NAME;
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Salary Summary");
  worksheet.columns = [
    { width: 24 },
    { width: 16 },
    { width: 18 },
    { width: 24 },
    { width: 16 },
    { width: 18 },
    { width: 24 },
    { width: 16 },
    { width: 18 },
    { width: 24 },
    { width: 18 },
  ];

  worksheet.mergeCells("A1:K1");
  worksheet.getCell("A1").value = REPORT_LAYOUT_COMPANY_NAME;
  worksheet.getCell("A1").font = { bold: true, size: 15 };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells("A2:K2");
  worksheet.getCell("A2").value = `Salary Summary - ${preview.payrollMonth}`;
  worksheet.getCell("A2").font = { bold: true, size: 13 };
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.mergeCells("A3:K3");
  worksheet.getCell("A3").value = `${REPORT_LAYOUT_DEPARTMENT_NAME} | Generated: ${getStandardGeneratedAtLabel()}`;
  worksheet.getCell("A3").alignment = { horizontal: "center" };

  let rowNumber = 5;

  preview.salaryAndWagesSections.forEach((section) => {
    worksheet.mergeCells(rowNumber, 1, rowNumber, 11);
    setHeaderCell(worksheet, `A${rowNumber}`, section.title);
    rowNumber += 1;

    const headerRow = worksheet.getRow(rowNumber);
    [
      "Group",
      "Employees",
      "Gross",
      "Net",
      "Bank/Mobile",
      "Cash",
      "AIT",
      "Loan",
      "Suspense",
      "Deduction",
      "Company",
    ].forEach((header, index) => {
      headerRow.getCell(index + 1).value = header;
    });
    applyStandardExcelHeaderStyle(headerRow);
    rowNumber += 1;

    section.rows.forEach((row) => {
      const excelRow = worksheet.getRow(rowNumber);
      excelRow.values = [
        undefined,
        row.groupName,
        row.employeeCount,
        row.grossAmount,
        row.netAmount,
        row.bankAndMobileAmount,
        row.cashAmount,
        row.aitAmount,
        row.loanAmount,
        row.suspenseAmount,
        row.totalDeduction,
        row.companyName,
      ];
      [3, 4, 5, 6, 7, 8, 9, 10].forEach((cellNumber) => {
        styleAmountCell(excelRow.getCell(cellNumber));
      });
      applyStandardExcelBodyBorder(excelRow);
      rowNumber += 1;
    });

    const totalRow = worksheet.getRow(rowNumber);
    totalRow.values = [
      undefined,
      "Grand Total",
      section.grandTotal.employeeCount,
      section.grandTotal.grossAmount,
      section.grandTotal.netAmount,
      section.grandTotal.bankAndMobileAmount,
      section.grandTotal.cashAmount,
      section.grandTotal.aitAmount,
      section.grandTotal.loanAmount,
      section.grandTotal.suspenseAmount,
      section.grandTotal.totalDeduction,
      section.companyName,
    ];
    totalRow.font = { bold: true };
    [3, 4, 5, 6, 7, 8, 9, 10].forEach((cellNumber) => {
      styleAmountCell(totalRow.getCell(cellNumber), true);
    });
    applyStandardExcelBodyBorder(totalRow);
    rowNumber += 2;
  });

  preview.overtimeSections.forEach((section) => {
    worksheet.mergeCells(rowNumber, 1, rowNumber, 8);
    setHeaderCell(worksheet, `A${rowNumber}`, section.title);
    rowNumber += 1;

    const headerRow = worksheet.getRow(rowNumber);
    [
      "Group",
      "Employees",
      "Gross/Payable",
      "OT Amount",
      "Tiffin",
      "Bank/Mobile",
      "Cash",
      "Company",
    ].forEach((header, index) => {
      headerRow.getCell(index + 1).value = header;
    });
    applyStandardExcelHeaderStyle(headerRow);
    rowNumber += 1;

    section.rows.forEach((row) => {
      const excelRow = worksheet.getRow(rowNumber);
      excelRow.values = [
        undefined,
        row.groupName,
        row.employeeCount,
        row.grossAmount,
        row.otAmount,
        row.tiffinAmount,
        row.bankAndMobileAmount,
        row.cashAmount,
        row.companyName,
      ];
      [3, 4, 5, 6, 7].forEach((cellNumber) => {
        styleAmountCell(excelRow.getCell(cellNumber));
      });
      applyStandardExcelBodyBorder(excelRow);
      rowNumber += 1;
    });

    const totalRow = worksheet.getRow(rowNumber);
    totalRow.values = [
      undefined,
      "Grand Total",
      section.grandTotal.employeeCount,
      section.grandTotal.grossAmount,
      section.grandTotal.otAmount,
      section.grandTotal.tiffinAmount,
      section.grandTotal.bankAndMobileAmount,
      section.grandTotal.cashAmount,
      section.companyName,
    ];
    totalRow.font = { bold: true };
    [3, 4, 5, 6, 7].forEach((cellNumber) => {
      styleAmountCell(totalRow.getCell(cellNumber), true);
    });
    applyStandardExcelBodyBorder(totalRow);
    rowNumber += 2;
  });

  rowNumber = addExcelSalarySection(
    worksheet,
    rowNumber,
    "Combined Salary & Wages",
    preview.combinedTotals.salaryAndWages,
  );
  rowNumber = addExcelOtSection(
    worksheet,
    rowNumber,
    "Combined OT",
    preview.combinedTotals.overtime,
  );

  worksheet.mergeCells(rowNumber, 1, rowNumber, 3);
  setHeaderCell(worksheet, `A${rowNumber}`, "Group Total (Salary, Wages & OT)");
  const groupTotalRows = [
    ["Gross Amount", preview.combinedTotals.groupTotal.grossAmount],
    ["Net Amount", preview.combinedTotals.groupTotal.netAmount],
    ["Bank/Mobile Amount", preview.combinedTotals.groupTotal.bankAndMobileAmount],
    ["Cash Amount", preview.combinedTotals.groupTotal.cashAmount],
  ];

  groupTotalRows.forEach((row, index) => {
    const excelRow = worksheet.getRow(rowNumber + index + 1);
    excelRow.getCell(1).value = row[0];
    excelRow.getCell(3).value = row[1];
    excelRow.getCell(1).font = { bold: true };
    styleAmountCell(excelRow.getCell(3), true);
    applyStandardExcelBodyBorder(excelRow);
  });

  worksheet.views = [{ state: "frozen", ySplit: 4 }];
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
    mimeType: REPORT_MIME_TYPES.excel,
    reportData: preview,
  };
};

const addPdfLine = (doc: PDFKit.PDFDocument, label: string, value: string | number) => {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(String(value));
};

export const generateSalarySummaryPdf = async (
  preview: TSalarySummaryPreview,
): Promise<TSalarySummaryExportFileResult> => {
  const doc = new PDFDocument({
    margin: 36,
    size: "A4",
    layout: "landscape",
  });
  const chunks: Buffer[] = [];
  const bufferPromise = new Promise<Buffer>((resolve) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(15).font("Helvetica-Bold").text(REPORT_LAYOUT_COMPANY_NAME, {
    align: "center",
  });
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text(REPORT_LAYOUT_DEPARTMENT_NAME, {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(14).font("Helvetica-Bold").text(
    `Salary Summary - ${preview.payrollMonth}`,
    { align: "center" },
  );
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text(
    `Generated: ${getStandardGeneratedAtLabel()} | Group By: ${preview.filters.groupBy}`,
    { align: "center" },
  );
  doc.moveDown(1);

  doc.fontSize(10).font("Helvetica-Bold").text("Combined Summary");
  doc.moveDown(0.3);
  addPdfLine(doc, "Salary/Wages Gross", formatAmount(preview.combinedTotals.salaryAndWages.grossAmount));
  addPdfLine(doc, "Salary/Wages Net", formatAmount(preview.combinedTotals.salaryAndWages.netAmount));
  addPdfLine(doc, "Salary/Wages Bank/Mobile", formatAmount(preview.combinedTotals.salaryAndWages.bankAndMobileAmount));
  addPdfLine(doc, "Salary/Wages Cash", formatAmount(preview.combinedTotals.salaryAndWages.cashAmount));
  doc.moveDown(0.5);
  addPdfLine(doc, "OT Gross/Payable", formatAmount(preview.combinedTotals.overtime.grossAmount));
  addPdfLine(doc, "OT Bank/Mobile", formatAmount(preview.combinedTotals.overtime.bankAndMobileAmount));
  addPdfLine(doc, "OT Cash", formatAmount(preview.combinedTotals.overtime.cashAmount));
  doc.moveDown(0.5);
  addPdfLine(doc, "Group Gross", formatAmount(preview.combinedTotals.groupTotal.grossAmount));
  addPdfLine(doc, "Group Net", formatAmount(preview.combinedTotals.groupTotal.netAmount));
  addPdfLine(doc, "Group Bank/Mobile", formatAmount(preview.combinedTotals.groupTotal.bankAndMobileAmount));
  addPdfLine(doc, "Group Cash", formatAmount(preview.combinedTotals.groupTotal.cashAmount));

  doc.moveDown(1);
  doc.fontSize(9).font("Helvetica-Bold").text("Salary/Wages Sections");
  preview.salaryAndWagesSections.forEach((section) => {
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text(section.title);
    section.rows.forEach((row) => {
      doc.font("Helvetica").text(
        `${row.groupName}: Gross ${formatAmount(row.grossAmount)}, Net ${formatAmount(row.netAmount)}, Bank/Mobile ${formatAmount(row.bankAndMobileAmount)}, Cash ${formatAmount(row.cashAmount)}`,
      );
    });
  });

  doc.moveDown(0.8);
  doc.fontSize(9).font("Helvetica-Bold").text("OT Sections");
  preview.overtimeSections.forEach((section) => {
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text(section.title);
    section.rows.forEach((row) => {
      doc.font("Helvetica").text(
        `${row.groupName}: Gross ${formatAmount(row.grossAmount)}, Bank/Mobile ${formatAmount(row.bankAndMobileAmount)}, Cash ${formatAmount(row.cashAmount)}`,
      );
    });
  });

  doc.moveDown(1.2);
  doc.fontSize(8).font("Helvetica").text(preview.meta.reportNote);
  doc.moveDown(2);
  doc.text("Prepared By", 50, doc.y, { continued: true });
  doc.text("Checked By", { align: "center", continued: true });
  doc.text("Approved By", { align: "right" });

  doc.end();
  const buffer = await bufferPromise;

  return {
    buffer,
    fileName: `${getFileBaseName(preview)}.pdf`,
    mimeType: REPORT_MIME_TYPES.pdf,
    reportData: preview,
  };
};

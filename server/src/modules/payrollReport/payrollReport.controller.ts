import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PayrollReportService } from "./payrollReport.service";
import { generatePayslipPDF } from "./payrollReport.utils";

/**
 * Get Employee Payslip (JSON)
 */
const getEmployeePayslip = catchAsync(async (req: Request, res: Response) => {
  const employeeId = Array.isArray(req.params.employeeId)
    ? req.params.employeeId[0]
    : req.params.employeeId;

  const month = Number(
    Array.isArray(req.query.month) ? req.query.month[0] : req.query.month,
  );

  const year = Number(
    Array.isArray(req.query.year) ? req.query.year[0] : req.query.year,
  );

  const result = await PayrollReportService.getEmployeePayslipFromDB({
    employeeId,
    month,
    year,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payslip retrieved successfully",
    data: result,
  });
});

/**
 * Get Monthly Payroll Report (JSON)
 */
const getMonthlyPayrollReport = catchAsync(
  async (req: Request, res: Response) => {
    const month = Number(
      Array.isArray(req.query.month) ? req.query.month[0] : req.query.month,
    );

    const year = Number(
      Array.isArray(req.query.year) ? req.query.year[0] : req.query.year,
    );

    const branch = Array.isArray(req.query.branch)
      ? req.query.branch[0]
      : req.query.branch;

    const department = Array.isArray(req.query.department)
      ? req.query.department[0]
      : req.query.department;

    const status = Array.isArray(req.query.status)
      ? req.query.status[0]
      : req.query.status;

    const result = await PayrollReportService.getMonthlyPayrollReportFromDB({
      month,
      year,
      branch: branch as string | undefined,
      department: department as string | undefined,
      status: status as "draft" | "processed" | "approved" | "paid" | undefined,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payroll report retrieved successfully",
      data: result,
    });
  },
);

/**
 * Download Employee Payslip PDF
 */
const downloadPayslipPDF = catchAsync(async (req: Request, res: Response) => {
  const employeeId = Array.isArray(req.params.employeeId)
    ? req.params.employeeId[0]
    : req.params.employeeId;

  const month = Number(
    Array.isArray(req.query.month) ? req.query.month[0] : req.query.month,
  );

  const year = Number(
    Array.isArray(req.query.year) ? req.query.year[0] : req.query.year,
  );

  const payslipData = await PayrollReportService.getEmployeePayslipFromDB({
    employeeId,
    month,
    year,
  });

  // Create PDF document
  const doc = new PDFDocument({ margin: 40 });

  const fileName = `Payslip-${employeeId}-${year}-${month}.pdf`;

  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  // Pipe PDF stream
  doc.pipe(res);

  // Generate content
  generatePayslipPDF(doc, payslipData);

  // Close document (VERY IMPORTANT)
  doc.end();
});

/**
 * Export Monthly Payroll Report (CSV)
 */
const exportMonthlyPayrollReportCsv = catchAsync(
  async (req: Request, res: Response) => {
    const month = Number(
      Array.isArray(req.query.month) ? req.query.month[0] : req.query.month,
    );

    const year = Number(
      Array.isArray(req.query.year) ? req.query.year[0] : req.query.year,
    );

    const result = await PayrollReportService.exportMonthlyPayrollReportCsv(
      month,
      year,
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

/**
 * Export Monthly Payroll Report (Excel)
 */
const exportMonthlyPayrollReportExcel = catchAsync(
  async (req: Request, res: Response) => {
    const month = Number(
      Array.isArray(req.query.month) ? req.query.month[0] : req.query.month,
    );

    const year = Number(
      Array.isArray(req.query.year) ? req.query.year[0] : req.query.year,
    );

    const result = await PayrollReportService.exportMonthlyPayrollReportExcel(
      month,
      year,
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.status(200).send(result.buffer);
  },
);

export const PayrollReportControllers = {
  getEmployeePayslip,
  getMonthlyPayrollReport,
  downloadPayslipPDF,
  exportMonthlyPayrollReportCsv,
  exportMonthlyPayrollReportExcel,
};

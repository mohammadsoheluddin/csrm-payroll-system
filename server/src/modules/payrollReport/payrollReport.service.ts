import ExcelJS from "exceljs";
import AppError from "../../errors/AppError";
import { Payroll } from "../payroll/payroll.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

type TGetEmployeePayslipParams = {
  employeeId: string;
  month: number;
  year: number;
};

type TGetMonthlyPayrollReportParams = {
  month: number;
  year: number;
  branch?: string;
  department?: string;
  status?: "draft" | "processed" | "approved" | "paid";
};

type TExportRow = {
  sl: number;
  employeeDbId: string;
  employeeCode: string;
  employeeName: string;
  payrollMonth: string;
  grossSalary: number;
  fixedDeduction: number;
  attendanceDeduction: number;
  totalDeduction: number;
  netSalary: number;
  payableSalary: number;
  status: string;
  remarks: string;
};

const buildPayrollMonth = (month: number, year: number) => {
  const paddedMonth = String(month).padStart(2, "0");
  return `${year}-${paddedMonth}`;
};

const getMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const validateMonthYear = (month: number, year: number) => {
  if (!month || !year) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Month and year are required.");
  }

  if (month < 1 || month > 12) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Month must be between 1 and 12.",
    );
  }
};

const getEmployeeFullName = (employee: any) => {
  if (!employee) return "";

  const firstName = employee?.name?.firstName || "";
  const middleName = employee?.name?.middleName || "";
  const lastName = employee?.name?.lastName || "";

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;

  return employee?.fullName || employee?.employeeName || "";
};

const getEmployeeCode = (employee: any) => {
  if (!employee) return "";

  return (
    employee?.employeeId ||
    employee?.employeeCode ||
    employee?.officeId ||
    employee?.idNo ||
    ""
  );
};

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const buildCsvContent = (rows: TExportRow[]) => {
  const headers = [
    "SL",
    "Employee DB ID",
    "Employee Code",
    "Employee Name",
    "Payroll Month",
    "Gross Salary",
    "Fixed Deduction",
    "Attendance Deduction",
    "Total Deduction",
    "Net Salary",
    "Payable Salary",
    "Status",
    "Remarks",
  ];

  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.sl,
        row.employeeDbId,
        row.employeeCode,
        row.employeeName,
        row.payrollMonth,
        row.grossSalary,
        row.fixedDeduction,
        row.attendanceDeduction,
        row.totalDeduction,
        row.netSalary,
        row.payableSalary,
        row.status,
        row.remarks,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return csvLines.join("\n");
};

const getEmployeePayslipFromDB = async ({
  employeeId,
  month,
  year,
}: TGetEmployeePayslipParams) => {
  validateMonthYear(month, year);

  if (!employeeId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Employee ID is required.");
  }

  const payrollMonth = buildPayrollMonth(month, year);

  const payroll = await Payroll.findOne({
    employee: employeeId,
    payrollMonth,
    isDeleted: false,
  })
    .populate("employee")
    .populate("salaryStructure");

  if (!payroll) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      `No payslip found for employee in ${getMonthLabel(month, year)}.`,
    );
  }

  const employee = payroll?.employee as any;
  const salaryStructure = payroll?.salaryStructure as any;

  const grossSalary = Number(payroll?.grossSalary || 0);
  const fixedDeduction = Number(payroll?.fixedDeduction || 0);
  const attendanceDeduction = Number(payroll?.attendanceDeduction || 0);
  const netSalary = Number(payroll?.netSalary || 0);
  const payableSalary = Number(payroll?.payableSalary || 0);

  return {
    payrollId: payroll?._id?.toString(),
    payrollMonth: payroll?.payrollMonth,
    month,
    year,
    monthLabel: getMonthLabel(month, year),
    employee: {
      id: employee?._id?.toString() || "",
      employeeCode: getEmployeeCode(employee),
      fullName: getEmployeeFullName(employee),
      firstName: employee?.name?.firstName || "",
      middleName: employee?.name?.middleName || "",
      lastName: employee?.name?.lastName || "",
      designation:
        employee?.designation?.title ||
        employee?.designation?.name ||
        employee?.designation ||
        "",
      department:
        employee?.department?.title ||
        employee?.department?.name ||
        employee?.department ||
        "",
      branch:
        employee?.branch?.title ||
        employee?.branch?.name ||
        employee?.branch ||
        "",
    },
    salaryStructure: salaryStructure
      ? {
          id: salaryStructure?._id?.toString() || "",
          grossSalary: Number(salaryStructure?.grossSalary || grossSalary),
        }
      : null,
    payroll: {
      grossSalary,
      fixedDeduction,
      attendanceDeduction,
      totalDeduction: fixedDeduction + attendanceDeduction,
      netSalary,
      payableSalary,
      status: payroll?.status || "",
      remarks: payroll?.remarks || "",
    },
  };
};

const getMonthlyPayrollReportFromDB = async ({
  month,
  year,
  branch,
  department,
  status,
}: TGetMonthlyPayrollReportParams) => {
  validateMonthYear(month, year);

  const payrollMonth = buildPayrollMonth(month, year);

  const query: Record<string, unknown> = {
    payrollMonth,
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  const payrolls = await Payroll.find({
    payrollMonth,
    isDeleted: false,
  })
    .populate({
      path: "employee",
      populate: [
        { path: "branch" },
        { path: "department" },
        { path: "designation" },
      ],
    })
    .populate("salaryStructure")
    .sort({ createdAt: 1 });

  const filteredPayrolls = payrolls.filter((payroll: any) => {
    const employee = payroll?.employee;

    const employeeBranchId = employee?.branch?._id?.toString?.() || "";
    const employeeDepartmentId = employee?.department?._id?.toString?.() || "";

    if (branch && employeeBranchId !== branch) {
      return false;
    }

    if (department && employeeDepartmentId !== department) {
      return false;
    }

    return true;
  });

  if (!filteredPayrolls.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      `No payroll report found for ${getMonthLabel(month, year)}.`,
    );
  }

  const data = filteredPayrolls.map((payroll: any, index: number) => {
    const employee = payroll?.employee;
    const grossSalary = Number(payroll?.grossSalary || 0);
    const fixedDeduction = Number(payroll?.fixedDeduction || 0);
    const attendanceDeduction = Number(payroll?.attendanceDeduction || 0);
    const netSalary = Number(payroll?.netSalary || 0);
    const payableSalary = Number(payroll?.payableSalary || 0);

    return {
      sl: index + 1,
      payrollId: payroll?._id?.toString() || "",
      employee: {
        id: employee?._id?.toString() || "",
        employeeCode: getEmployeeCode(employee),
        fullName: getEmployeeFullName(employee),
        designation:
          employee?.designation?.title ||
          employee?.designation?.name ||
          employee?.designation ||
          "",
        branch:
          employee?.branch?.title ||
          employee?.branch?.name ||
          employee?.branch ||
          "",
        department:
          employee?.department?.title ||
          employee?.department?.name ||
          employee?.department ||
          "",
      },
      payrollMonth: payroll?.payrollMonth || "",
      grossSalary,
      fixedDeduction,
      attendanceDeduction,
      totalDeduction: fixedDeduction + attendanceDeduction,
      netSalary,
      payableSalary,
      status: payroll?.status || "",
      remarks: payroll?.remarks || "",
    };
  });

  const summary = data.reduce(
    (acc, row) => {
      acc.totalEmployees += 1;
      acc.totalGrossSalary += row.grossSalary;
      acc.totalFixedDeduction += row.fixedDeduction;
      acc.totalAttendanceDeduction += row.attendanceDeduction;
      acc.totalDeduction += row.totalDeduction;
      acc.totalNetSalary += row.netSalary;
      acc.totalPayableSalary += row.payableSalary;
      return acc;
    },
    {
      totalEmployees: 0,
      totalGrossSalary: 0,
      totalFixedDeduction: 0,
      totalAttendanceDeduction: 0,
      totalDeduction: 0,
      totalNetSalary: 0,
      totalPayableSalary: 0,
    },
  );

  return {
    payrollMonth,
    month,
    year,
    monthLabel: getMonthLabel(month, year),
    filters: {
      branch: branch || null,
      department: department || null,
      status: status || null,
    },
    summary,
    data,
  };
};

const getMonthlyPayrollRows = async (month: number, year: number) => {
  validateMonthYear(month, year);

  const payrollMonth = buildPayrollMonth(month, year);

  const payrolls = await Payroll.find({
    payrollMonth,
    isDeleted: false,
  })
    .populate("employee")
    .populate("salaryStructure")
    .sort({ createdAt: 1 });

  if (!payrolls.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      `No payroll report found for ${getMonthLabel(month, year)}.`,
    );
  }

  const rows: TExportRow[] = payrolls.map((payroll: any, index: number) => {
    const employee = payroll?.employee;

    const grossSalary = Number(payroll?.grossSalary || 0);
    const fixedDeduction = Number(payroll?.fixedDeduction || 0);
    const attendanceDeduction = Number(payroll?.attendanceDeduction || 0);
    const netSalary = Number(payroll?.netSalary || 0);
    const payableSalary = Number(payroll?.payableSalary || 0);

    return {
      sl: index + 1,
      employeeDbId: employee?._id?.toString() || "",
      employeeCode: getEmployeeCode(employee),
      employeeName: getEmployeeFullName(employee),
      payrollMonth: payroll?.payrollMonth || "",
      grossSalary,
      fixedDeduction,
      attendanceDeduction,
      totalDeduction: fixedDeduction + attendanceDeduction,
      netSalary,
      payableSalary,
      status: payroll?.status || "",
      remarks: payroll?.remarks || "",
    };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.totalEmployees += 1;
      acc.totalGrossSalary += row.grossSalary;
      acc.totalFixedDeduction += row.fixedDeduction;
      acc.totalAttendanceDeduction += row.attendanceDeduction;
      acc.totalDeduction += row.totalDeduction;
      acc.totalNetSalary += row.netSalary;
      acc.totalPayableSalary += row.payableSalary;
      return acc;
    },
    {
      totalEmployees: 0,
      totalGrossSalary: 0,
      totalFixedDeduction: 0,
      totalAttendanceDeduction: 0,
      totalDeduction: 0,
      totalNetSalary: 0,
      totalPayableSalary: 0,
    },
  );

  return {
    payrollMonth,
    month,
    year,
    monthLabel: getMonthLabel(month, year),
    rows,
    summary,
  };
};

const exportMonthlyPayrollReportCsv = async (month: number, year: number) => {
  const reportData = await getMonthlyPayrollRows(month, year);
  const csv = buildCsvContent(reportData.rows);

  return {
    fileName: `monthly-payroll-report-${reportData.payrollMonth}.csv`,
    mimeType: "text/csv; charset=utf-8",
    buffer: Buffer.from(csv, "utf-8"),
    reportData,
  };
};

const exportMonthlyPayrollReportExcel = async (month: number, year: number) => {
  const reportData = await getMonthlyPayrollRows(month, year);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Monthly Payroll Report");

  worksheet.columns = [
    { header: "SL", key: "sl", width: 8 },
    { header: "Employee DB ID", key: "employeeDbId", width: 28 },
    { header: "Employee Code", key: "employeeCode", width: 18 },
    { header: "Employee Name", key: "employeeName", width: 28 },
    { header: "Payroll Month", key: "payrollMonth", width: 16 },
    { header: "Gross Salary", key: "grossSalary", width: 16 },
    { header: "Fixed Deduction", key: "fixedDeduction", width: 18 },
    { header: "Attendance Deduction", key: "attendanceDeduction", width: 22 },
    { header: "Total Deduction", key: "totalDeduction", width: 18 },
    { header: "Net Salary", key: "netSalary", width: 16 },
    { header: "Payable Salary", key: "payableSalary", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Remarks", key: "remarks", width: 24 },
  ];

  worksheet.addRows(reportData.rows);

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "middle" };

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    if (rowNumber === 1) {
      cellLoop: for (const cell of row.values as any[]) {
        void cell;
      }
    }
  });

  const summaryStartRow = worksheet.rowCount + 2;

  worksheet.getCell(`A${summaryStartRow}`).value = "Summary";
  worksheet.getCell(`A${summaryStartRow}`).font = { bold: true };

  const summaryRows = [
    ["Total Employees", reportData.summary.totalEmployees],
    ["Total Gross Salary", reportData.summary.totalGrossSalary],
    ["Total Fixed Deduction", reportData.summary.totalFixedDeduction],
    ["Total Attendance Deduction", reportData.summary.totalAttendanceDeduction],
    ["Total Deduction", reportData.summary.totalDeduction],
    ["Total Net Salary", reportData.summary.totalNetSalary],
    ["Total Payable Salary", reportData.summary.totalPayableSalary],
  ];

  summaryRows.forEach((item, index) => {
    const rowNumber = summaryStartRow + 1 + index;

    worksheet.getCell(`A${rowNumber}`).value = item[0];
    worksheet.getCell(`B${rowNumber}`).value = item[1];

    worksheet.getCell(`A${rowNumber}`).font = { bold: true };

    worksheet.getCell(`A${rowNumber}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell(`B${rowNumber}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  return {
    fileName: `monthly-payroll-report-${reportData.payrollMonth}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
    reportData,
  };
};

export const PayrollReportService = {
  getEmployeePayslipFromDB,
  getMonthlyPayrollReportFromDB,
  exportMonthlyPayrollReportCsv,
  exportMonthlyPayrollReportExcel,
};

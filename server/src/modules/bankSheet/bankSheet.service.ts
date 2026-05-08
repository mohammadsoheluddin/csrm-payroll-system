import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import EmployeeBankInfo from "../employeeBankInfo/employeeBankInfo.model";
import { Payroll } from "../payroll/payroll.model";
import {
  BANK_SHEET_DEFAULT_PAYMENT_MODE,
  BANK_SHEET_PAYROLL_ALLOWED_STATUSES,
  BANK_SHEET_SUPPORTED_SOURCE_TYPE,
} from "./bankSheet.constants";
import {
  TBankSheetExcludedRow,
  TBankSheetPaymentMode,
  TBankSheetPreview,
  TBankSheetRow,
  TGenerateBankSheetPreviewQuery,
  TPopulatedPayrollForBankSheet,
} from "./bankSheet.interface";
import {
  buildPayrollMonth,
  calculateBankSheetTotalAmount,
  getEmployeeCode,
  getEmployeeFullName,
  getEntityDisplayName,
  getObjectIdString,
  normalizeDisplayText,
  normalizeText,
} from "./bankSheet.utils";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

const ensureValidObjectId = (value: string, fieldName: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid ${fieldName}.`);
  }
};

const validateGenerateBankSheetQuery = (
  query: TGenerateBankSheetPreviewQuery,
) => {
  if (!query.month || !query.year) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Month and year are required.");
  }

  if (query.month < 1 || query.month > 12) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Month must be between 1 and 12.",
    );
  }

  if (!query.company) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Company is required.");
  }

  ensureValidObjectId(query.company, "company id");

  if (query.department) {
    ensureValidObjectId(query.department, "department id");
  }

  if (query.branch) {
    ensureValidObjectId(query.branch, "branch id");
  }
};

const isEmployeeActiveForBankSheet = (employee: any) => {
  if (!employee) return false;

  if (employee?.isDeleted === true) {
    return false;
  }

  if (employee?.status && employee.status !== "active") {
    return false;
  }

  if (
    ["resigned", "terminated", "retired", "suspended"].includes(
      employee?.employmentStatus,
    )
  ) {
    return false;
  }

  return true;
};

const buildExcludedRow = (
  payroll: TPopulatedPayrollForBankSheet,
  reason: string,
): TBankSheetExcludedRow => {
  const employee = payroll?.employee;

  return {
    payrollId: payroll?._id?.toString() || "",
    employee: employee
      ? {
          employeeDbId: employee?._id?.toString?.() || "",
          employeeId: getEmployeeCode(employee),
          employeeName: getEmployeeFullName(employee),
        }
      : null,
    payableSalary: Number(payroll?.payableSalary || 0),
    reason,
  };
};

const getPrimaryPaymentInfoMap = async (
  employeeIds: string[],
  companyId: string,
  paymentMode: TBankSheetPaymentMode,
) => {
  const paymentInfos = await EmployeeBankInfo.find({
    employee: { $in: employeeIds },
    company: companyId,
    paymentMode,
    isPrimary: true,
    status: "active",
    isDeleted: false,
  }).sort({ createdAt: 1 });

  const paymentInfoMap = new Map<string, any>();

  for (const paymentInfo of paymentInfos) {
    const employeeId = paymentInfo.employee?.toString();

    if (employeeId && !paymentInfoMap.has(employeeId)) {
      paymentInfoMap.set(employeeId, paymentInfo);
    }
  }

  return paymentInfoMap;
};

const buildBankSheetRows = async ({
  payrolls,
  company,
  department,
  branch,
  bankName,
  paymentMode,
}: {
  payrolls: TPopulatedPayrollForBankSheet[];
  company: string;
  department?: string;
  branch?: string;
  bankName?: string;
  paymentMode: TBankSheetPaymentMode;
}) => {
  const rows: TBankSheetRow[] = [];
  const excludedRows: TBankSheetExcludedRow[] = [];

  const eligiblePayrolls: TPopulatedPayrollForBankSheet[] = [];

  for (const payroll of payrolls) {
    const employee = payroll.employee;

    if (!employee) {
      excludedRows.push(buildExcludedRow(payroll, "Employee data not found."));
      continue;
    }

    if (!isEmployeeActiveForBankSheet(employee)) {
      excludedRows.push(
        buildExcludedRow(payroll, "Employee is not active for payment."),
      );
      continue;
    }

    if (getObjectIdString(employee.company) !== company) {
      excludedRows.push(
        buildExcludedRow(payroll, "Employee company does not match filter."),
      );
      continue;
    }

    if (department && getObjectIdString(employee.department) !== department) {
      excludedRows.push(
        buildExcludedRow(payroll, "Employee department does not match filter."),
      );
      continue;
    }

    if (branch && getObjectIdString(employee.branch) !== branch) {
      excludedRows.push(
        buildExcludedRow(payroll, "Employee branch does not match filter."),
      );
      continue;
    }

    if (Number(payroll.payableSalary || 0) <= 0) {
      excludedRows.push(
        buildExcludedRow(payroll, "Payable salary is zero or negative."),
      );
      continue;
    }

    eligiblePayrolls.push(payroll);
  }

  const employeeIds = eligiblePayrolls
    .map((payroll) => payroll.employee?._id?.toString?.() || "")
    .filter(Boolean);

  const paymentInfoMap = await getPrimaryPaymentInfoMap(
    employeeIds,
    company,
    paymentMode,
  );

  for (const payroll of eligiblePayrolls) {
    const employee = payroll.employee;
    const employeeDbId = employee?._id?.toString?.() || "";
    const paymentInfo = paymentInfoMap.get(employeeDbId);

    if (!paymentInfo) {
      excludedRows.push(
        buildExcludedRow(
          payroll,
          `Active primary ${paymentMode.replace(
            "_",
            " ",
          )} payment information not found.`,
        ),
      );
      continue;
    }

    if (paymentMode === "bank" && !paymentInfo.accountNo) {
      excludedRows.push(
        buildExcludedRow(payroll, "Primary bank account no is missing."),
      );
      continue;
    }

    if (
      bankName &&
      normalizeText(paymentInfo.bankName) !== normalizeText(bankName)
    ) {
      excludedRows.push(
        buildExcludedRow(payroll, "Bank name does not match filter."),
      );
      continue;
    }

    rows.push({
      slNo: rows.length + 1,
      payrollId: payroll._id.toString(),
      payrollMonth: payroll.payrollMonth,
      payrollStatus: payroll.status,
      isPayrollLocked: payroll.isLocked,
      employee: {
        employeeDbId,
        employeeId: getEmployeeCode(employee),
        employeeName: getEmployeeFullName(employee),
        designation: getEntityDisplayName(employee?.designation),
        department: getEntityDisplayName(employee?.department),
        branch: getEntityDisplayName(employee?.branch),
        company: getEntityDisplayName(employee?.company),
      },
      paymentInfoId: paymentInfo?._id?.toString() || "",
      paymentMode,
      nameOfAccount:
        normalizeDisplayText(paymentInfo.accountName) ||
        normalizeDisplayText(getEmployeeFullName(employee)),
      accountBankBranchCode: normalizeDisplayText(paymentInfo.bankBranchCode),
      accountNo: normalizeDisplayText(paymentInfo.accountNo),
      processBankBranchNo: normalizeDisplayText(
        paymentInfo.processBankBranchNo,
      ),
      bankName: normalizeDisplayText(paymentInfo.bankName),
      bankBranchName: normalizeDisplayText(paymentInfo.bankBranchName),
      branch: normalizeDisplayText(
        paymentInfo.bankBranchName || getEntityDisplayName(employee?.branch),
      ),
      amountInTk: Math.round(Number(payroll.payableSalary || 0)),
    });
  }

  return {
    rows,
    excludedRows,
  };
};

const generateSalaryBankSheetPreviewFromDB = async (
  query: TGenerateBankSheetPreviewQuery,
): Promise<TBankSheetPreview> => {
  validateGenerateBankSheetQuery(query);

  const sourceType = query.sourceType || BANK_SHEET_SUPPORTED_SOURCE_TYPE;
  const paymentMode = query.paymentMode || BANK_SHEET_DEFAULT_PAYMENT_MODE;

  if (sourceType !== BANK_SHEET_SUPPORTED_SOURCE_TYPE) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only salary bank sheet preview is supported in this phase.",
    );
  }

  const payrollMonth = buildPayrollMonth(query.month, query.year);

  const payrolls = (await Payroll.find({
    payrollMonth,
    isDeleted: false,
    isLocked: true,
    status: { $in: [...BANK_SHEET_PAYROLL_ALLOWED_STATUSES] },
  })
    .populate({
      path: "employee",
      populate: [
        { path: "company" },
        { path: "department" },
        { path: "designation" },
        { path: "branch" },
      ],
    })
    .sort({ createdAt: 1 })) as unknown as TPopulatedPayrollForBankSheet[];

  if (!payrolls.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No locked approved/paid payroll found for this month.",
    );
  }

  const { rows, excludedRows } = await buildBankSheetRows({
    payrolls,
    company: query.company,
    department: query.department,
    branch: query.branch,
    bankName: query.bankName,
    paymentMode,
  });

  if (!rows.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No payable bank sheet rows found for the selected filters.",
    );
  }

  return {
    filters: {
      company: query.company,
      department: query.department || null,
      branch: query.branch || null,
      bankName: query.bankName || null,
    },
    summary: {
      sourceType,
      payrollMonth,
      month: query.month,
      year: query.year,
      paymentMode,
      totalPayrollFound: payrolls.length,
      totalIncluded: rows.length,
      totalExcluded: excludedRows.length,
      totalAmount: calculateBankSheetTotalAmount(rows),
    },
    rows,
    excludedRows,
  };
};

export const BankSheetServices = {
  generateSalaryBankSheetPreviewFromDB,
};

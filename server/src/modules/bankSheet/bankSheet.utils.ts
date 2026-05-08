import { TBankSheetRow } from "./bankSheet.interface";

export const buildPayrollMonth = (month: number, year: number) => {
  const paddedMonth = String(month).padStart(2, "0");
  return `${year}-${paddedMonth}`;
};

export const getMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);

  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export const normalizeText = (value?: unknown) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
};

export const normalizeDisplayText = (value?: unknown) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().replace(/\s+/g, " ");
};

export const getObjectIdString = (value: any) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (value?._id) {
    return value._id.toString();
  }

  if (typeof value?.toString === "function") {
    return value.toString();
  }

  return "";
};

export const getEmployeeFullName = (employee: any) => {
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

export const getEmployeeCode = (employee: any) => {
  if (!employee) return "";

  return (
    employee?.employeeId ||
    employee?.employeeCode ||
    employee?.officeId ||
    employee?.idNo ||
    ""
  );
};

export const getEntityDisplayName = (entity: any) => {
  if (!entity) return "";

  return (
    entity?.name ||
    entity?.title ||
    entity?.departmentName ||
    entity?.branchName ||
    entity?.companyName ||
    ""
  );
};

export const calculateBankSheetTotalAmount = (rows: TBankSheetRow[]) => {
  return rows.reduce((total, row) => total + Number(row.amountInTk || 0), 0);
};

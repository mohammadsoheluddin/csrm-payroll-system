import { createHash } from "crypto";
import { Types } from "mongoose";

export const PAYROLL_IMMUTABLE_SEAL_VERSION = "PAYROLL_IMMUTABLE_SEAL_V1";

export interface TPayrollImmutableSeal {
  sealVersion: string;
  sourceModule: string;
  sourceId: string;
  checksum: string;
  sealedAt: Date;
  sealedBy?: Types.ObjectId | null;
  note?: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

const normalizeValueForChecksum = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValueForChecksum(item));
  }

  if (typeof value === "object") {
    const objectValue = value as {
      _id?: Types.ObjectId | string;
      toObject?: () => Record<string, unknown>;
      toString?: () => string;
    };

    if (objectValue._id instanceof Types.ObjectId) {
      return objectValue._id.toString();
    }

    if (typeof objectValue.toObject === "function") {
      return normalizeValueForChecksum(objectValue.toObject());
    }

    if (isPlainObject(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = normalizeValueForChecksum(value[key]);
          return acc;
        }, {});
    }

    if (typeof objectValue.toString === "function") {
      return objectValue.toString();
    }
  }

  return value;
};

const stableStringify = (value: unknown) => {
  return JSON.stringify(normalizeValueForChecksum(value));
};

export const buildPayrollImmutableChecksum = (payload: unknown) => {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
};

export const buildPayrollImmutableSeal = ({
  sourceModule,
  sourceId,
  sealedBy,
  payload,
  note,
}: {
  sourceModule: string;
  sourceId: string;
  sealedBy?: Types.ObjectId | null;
  payload: unknown;
  note?: string;
}): TPayrollImmutableSeal => {
  return {
    sealVersion: PAYROLL_IMMUTABLE_SEAL_VERSION,
    sourceModule,
    sourceId,
    checksum: buildPayrollImmutableChecksum(payload),
    sealedAt: new Date(),
    sealedBy: sealedBy || null,
    note: note || "Locked payroll snapshot sealed for historical integrity.",
  };
};

export const buildPayrollImmutableSealFromRecord = ({
  record,
  sourceModule,
  sealedBy,
  note,
}: {
  record: Record<string, unknown>;
  sourceModule: string;
  sealedBy?: Types.ObjectId | null;
  note?: string;
}) => {
  const sourceId = normalizeValueForChecksum(record._id) as string;

  const payload = {
    employee: normalizeValueForChecksum(record.employee),
    company: normalizeValueForChecksum(record.company),
    majorDepartment: normalizeValueForChecksum(record.majorDepartment),
    department: normalizeValueForChecksum(record.department),
    designation: normalizeValueForChecksum(record.designation),
    branch: normalizeValueForChecksum(record.branch),
    payrollMonth: record.payrollMonth,
    month: record.month,
    year: record.year,
    periodStartDate: record.periodStartDate,
    periodEndDate: record.periodEndDate,
    sourceLinks: {
      attendanceFinalization: normalizeValueForChecksum(
        record.attendanceFinalization,
      ),
      salaryStructure: normalizeValueForChecksum(record.salaryStructure),
      salarySheet: normalizeValueForChecksum(record.salarySheet),
      salaryStatement: normalizeValueForChecksum(record.salaryStatement),
      timeBill: normalizeValueForChecksum(record.timeBill),
      otStatement: normalizeValueForChecksum(record.otStatement),
      paymentInfo: normalizeValueForChecksum(record.paymentInfo),
    },
    payrollAmounts: {
      basicSalary: record.basicSalary,
      houseRent: record.houseRent,
      medicalAllowance: record.medicalAllowance,
      transportAllowance: record.transportAllowance,
      otherAllowance: record.otherAllowance,
      grossSalary: record.grossSalary,
      fixedDeduction: record.fixedDeduction,
      attendanceDeduction: record.attendanceDeduction,
      totalDeduction: record.totalDeduction,
      netSalary: record.netSalary,
      payableSalary: record.payableSalary,
      totalOtHours: record.totalOtHours,
      otRate: record.otRate,
      otAmount: record.otAmount,
      tiffinDays: record.tiffinDays,
      tiffinRate: record.tiffinRate,
      tiffinAmount: record.tiffinAmount,
      totalPayableAmount: record.totalPayableAmount,
      bankAmount: record.bankAmount,
      cashAmount: record.cashAmount,
      mobileBankingAmount: record.mobileBankingAmount,
    },
    attendanceTotals: {
      totalCalendarDays: record.totalCalendarDays,
      totalDutyDays: record.totalDutyDays,
      totalPayableDays: record.totalPayableDays,
      totalDeductionDays: record.totalDeductionDays,
      totalAbsentDays: record.totalAbsentDays,
      totalPaidLeaveDays: record.totalPaidLeaveDays,
      totalUnpaidLeaveDays: record.totalUnpaidLeaveDays,
      totalLeaveDays: record.totalLeaveDays,
    },
    paymentMode: record.paymentMode,
    snapshot: normalizeValueForChecksum(record.snapshot),
  };

  return buildPayrollImmutableSeal({
    sourceModule,
    sourceId,
    sealedBy,
    payload,
    note,
  });
};

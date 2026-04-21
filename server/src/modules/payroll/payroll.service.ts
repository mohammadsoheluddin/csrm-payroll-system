import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { Payroll } from "./payroll.model";
import { TPayrollAuditAction, TPayrollStatus } from "./payroll.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

const buildPayrollMonth = (month: number, year: number) => {
  const paddedMonth = String(month).padStart(2, "0");
  return `${year}-${paddedMonth}`;
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

const getValidObjectId = (id?: string) => {
  if (!id) return null;
  if (!Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
};

const addAuditLog = (
  payroll: any,
  action: TPayrollAuditAction,
  fromStatus: TPayrollStatus | null,
  toStatus: TPayrollStatus | null,
  actionBy?: string,
  note?: string,
) => {
  payroll.auditLogs.push({
    action,
    fromStatus,
    toStatus,
    actionBy: getValidObjectId(actionBy),
    actionAt: new Date(),
    note: note || "",
  });
};

const ensurePayrollExists = async (id: string) => {
  const payroll = await Payroll.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payroll) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Payroll record not found.");
  }

  return payroll;
};

const ensureNotLocked = (payroll: any) => {
  if (payroll.isLocked) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "This payroll is locked and cannot be modified.",
    );
  }
};

const ensureEditablePayroll = (payroll: any) => {
  if (payroll.isLocked) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Locked payroll cannot be edited.",
    );
  }

  if (payroll.status === "approved" || payroll.status === "paid") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Approved or paid payroll cannot be edited directly.",
    );
  }
};

const processPayrollByIdFromDB = async (
  payrollId: string,
  remarks?: string,
  actionBy?: string,
) => {
  const payroll = await ensurePayrollExists(payrollId);
  ensureNotLocked(payroll);

  if (payroll.status !== "draft") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only draft payroll can be processed.",
    );
  }

  const previousStatus = payroll.status;

  payroll.status = "processed";

  if (remarks !== undefined) {
    payroll.remarks = remarks;
  }

  addAuditLog(
    payroll,
    "processed",
    previousStatus,
    payroll.status,
    actionBy,
    remarks,
  );

  await payroll.save();

  return payroll;
};

const approvePayrollByIdFromDB = async (
  payrollId: string,
  approvedBy?: string,
  remarks?: string,
) => {
  const payroll = await ensurePayrollExists(payrollId);
  ensureNotLocked(payroll);

  if (payroll.status !== "processed") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only processed payroll can be approved.",
    );
  }

  const previousStatus = payroll.status;

  payroll.status = "approved";
  payroll.approvedAt = new Date();
  payroll.approvedBy = getValidObjectId(approvedBy);

  if (remarks !== undefined) {
    payroll.remarks = remarks;
  }

  addAuditLog(
    payroll,
    "approved",
    previousStatus,
    payroll.status,
    approvedBy,
    remarks,
  );

  await payroll.save();

  return payroll;
};

const markPayrollAsPaidFromDB = async (
  payrollId: string,
  remarks?: string,
  actionBy?: string,
) => {
  const payroll = await ensurePayrollExists(payrollId);
  ensureNotLocked(payroll);

  if (payroll.status !== "approved") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only approved payroll can be marked as paid.",
    );
  }

  const previousStatus = payroll.status;

  payroll.status = "paid";

  if (remarks !== undefined) {
    payroll.remarks = remarks;
  }

  addAuditLog(
    payroll,
    "paid",
    previousStatus,
    payroll.status,
    actionBy,
    remarks,
  );

  await payroll.save();

  return payroll;
};

const lockPayrollByIdFromDB = async (payrollId: string, lockedBy?: string) => {
  const payroll = await ensurePayrollExists(payrollId);

  if (payroll.isLocked) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Payroll is already locked.");
  }

  if (payroll.status !== "approved" && payroll.status !== "paid") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only approved or paid payroll can be locked.",
    );
  }

  payroll.isLocked = true;
  payroll.lockedAt = new Date();
  payroll.lockedBy = getValidObjectId(lockedBy);

  addAuditLog(
    payroll,
    "locked",
    payroll.status,
    payroll.status,
    lockedBy,
    "Payroll locked",
  );

  await payroll.save();

  return payroll;
};

const unlockPayrollByIdFromDB = async (
  payrollId: string,
  actionBy?: string,
) => {
  const payroll = await ensurePayrollExists(payrollId);

  if (!payroll.isLocked) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Payroll is already unlocked.");
  }

  payroll.isLocked = false;
  payroll.lockedAt = null;
  payroll.lockedBy = null;

  addAuditLog(
    payroll,
    "unlocked",
    payroll.status,
    payroll.status,
    actionBy,
    "Payroll unlocked",
  );

  await payroll.save();

  return payroll;
};

const approveMonthlyPayrollBatchFromDB = async (
  month: number,
  year: number,
  approvedBy?: string,
) => {
  validateMonthYear(month, year);

  const payrollMonth = buildPayrollMonth(month, year);

  const payrolls = await Payroll.find({
    payrollMonth,
    isDeleted: false,
    status: "processed",
    isLocked: false,
  });

  if (!payrolls.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No processed payroll found for this month.",
    );
  }

  const updatedPayrolls = [];

  for (const payroll of payrolls) {
    const previousStatus = payroll.status;

    payroll.status = "approved";
    payroll.approvedAt = new Date();
    payroll.approvedBy = getValidObjectId(approvedBy);

    addAuditLog(
      payroll,
      "approved",
      previousStatus,
      payroll.status,
      approvedBy,
      "Monthly batch approval",
    );

    await payroll.save();
    updatedPayrolls.push(payroll);
  }

  return {
    payrollMonth,
    totalApproved: updatedPayrolls.length,
    data: updatedPayrolls,
  };
};

const lockMonthlyPayrollBatchFromDB = async (
  month: number,
  year: number,
  lockedBy?: string,
) => {
  validateMonthYear(month, year);

  const payrollMonth = buildPayrollMonth(month, year);

  const payrolls = await Payroll.find({
    payrollMonth,
    isDeleted: false,
    isLocked: false,
    $or: [{ status: "approved" }, { status: "paid" }],
  });

  if (!payrolls.length) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "No approved or paid payroll found for this month to lock.",
    );
  }

  const updatedPayrolls = [];

  for (const payroll of payrolls) {
    payroll.isLocked = true;
    payroll.lockedAt = new Date();
    payroll.lockedBy = getValidObjectId(lockedBy);

    addAuditLog(
      payroll,
      "locked",
      payroll.status,
      payroll.status,
      lockedBy,
      "Monthly batch lock",
    );

    await payroll.save();
    updatedPayrolls.push(payroll);
  }

  return {
    payrollMonth,
    totalLocked: updatedPayrolls.length,
    data: updatedPayrolls,
  };
};

const updatePayrollByIdFromDB = async (
  payrollId: string,
  payload: {
    grossSalary?: number;
    fixedDeduction?: number;
    attendanceDeduction?: number;
    netSalary?: number;
    payableSalary?: number;
    remarks?: string;
  },
  actionBy?: string,
) => {
  const payroll = await ensurePayrollExists(payrollId);
  ensureEditablePayroll(payroll);

  const allowedFields = [
    "grossSalary",
    "fixedDeduction",
    "attendanceDeduction",
    "netSalary",
    "payableSalary",
    "remarks",
  ] as const;

  let hasChanges = false;

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      payroll[field] = payload[field] as never;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "No valid payroll fields provided for update.",
    );
  }

  addAuditLog(
    payroll,
    "updated",
    payroll.status,
    payroll.status,
    actionBy,
    payload.remarks || "Payroll updated",
  );

  await payroll.save();

  return payroll;
};

const getPayrollAuditTimelineFromDB = async (payrollId: string) => {
  const payroll = await Payroll.findOne({
    _id: payrollId,
    isDeleted: false,
  })
    .populate("employee")
    .populate("approvedBy")
    .populate("lockedBy")
    .populate("auditLogs.actionBy");

  if (!payroll) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Payroll record not found.");
  }

  return {
    payrollId: payroll._id,
    payrollMonth: payroll.payrollMonth,
    status: payroll.status,
    isLocked: payroll.isLocked,
    employee: payroll.employee,
    auditLogs: payroll.auditLogs,
  };
};

export const PayrollService = {
  processPayrollByIdFromDB,
  approvePayrollByIdFromDB,
  markPayrollAsPaidFromDB,
  lockPayrollByIdFromDB,
  unlockPayrollByIdFromDB,
  approveMonthlyPayrollBatchFromDB,
  lockMonthlyPayrollBatchFromDB,
  updatePayrollByIdFromDB,
  getPayrollAuditTimelineFromDB,
};

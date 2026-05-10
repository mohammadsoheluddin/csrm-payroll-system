import { Types } from "mongoose";

import AppError from "../../errors/AppError";

import AttendanceFinalization from "../attendanceFinalization/attendanceFinalization.model";

import BonusSheet from "../bonusSheet/bonusSheet.model";

import Employee from "../employee/employee.model";

import SalarySheet from "../salarySheet/salarySheet.model";

import SalaryStructure from "../salaryStructure/salaryStructure.model";

import TimeBill from "../timeBill/timeBill.model";

import {
  TEmployeeMovementPayrollImpact,
  TEmployeeMovementPayrollImpactRecord,
  TMovementPayrollImpactModule,
} from "./employeeMovement.interface";

import { EmployeeMovement } from "./employeeMovement.model";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const getEmployeeFullName = (employee: any) => {
  const firstName = employee?.name?.firstName || "";

  const middleName = employee?.name?.middleName || "";

  const lastName = employee?.name?.lastName || "";

  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDateOnly = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const buildPayrollMonthFromDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const getObjectIdString = (value: unknown) => {
  if (!value) {
    return "";
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  const objectValue = value as {
    _id?: Types.ObjectId | string;
    toString?: () => string;
  };

  if (objectValue._id) {
    return getObjectIdString(objectValue._id);
  }

  if (typeof objectValue.toString === "function") {
    return objectValue.toString();
  }

  return "";
};

const buildIdNameSnapshot = (value: any) => {
  if (!value) {
    return null;
  }

  return {
    id: getObjectIdString(value?._id || value?.id),
    name: value?.name || "",
  };
};

const buildSalaryInfoSnapshot = (salaryStructure: any) => {
  if (!salaryStructure) {
    return null;
  }

  return {
    grossSalary: Number(salaryStructure?.grossSalary || 0),
    basicSalary: Number(salaryStructure?.basicSalary || 0),
    houseRent: Number(salaryStructure?.houseRent || 0),
    medicalAllowance: Number(salaryStructure?.medicalAllowance || 0),
    transportAllowance: Number(salaryStructure?.transportAllowance || 0),
    otherAllowance: Number(salaryStructure?.otherAllowance || 0),
    taxDeduction: Number(salaryStructure?.taxDeduction || 0),
    providentFund: Number(salaryStructure?.providentFund || 0),
    loanDeduction: Number(salaryStructure?.loanDeduction || 0),
    otherDeduction: Number(salaryStructure?.otherDeduction || 0),
    totalDeduction: Number(salaryStructure?.totalDeduction || 0),
    netSalary: Number(salaryStructure?.netSalary || 0),
  };
};

const buildServiceInfoSnapshot = (employee: any) => {
  return {
    serviceType: employee?.serviceType || "",
    payType: employee?.payType || "",
    employmentStatus: employee?.employmentStatus || "",
    dutyHourPerDay: Number(employee?.dutyHourPerDay || 0),
    leaveDay: Number(employee?.leaveDay || 0),
    confirmationDate: employee?.confirmationDate || "",
  };
};

const calculateSalaryStructureValues = ({
  currentSalaryStructure,
  toSalary,
}: {
  currentSalaryStructure: any;
  toSalary: any;
}) => {
  const basicSalary = Number(
    toSalary?.basicSalary ?? currentSalaryStructure?.basicSalary ?? 0,
  );
  const houseRent = Number(
    toSalary?.houseRent ?? currentSalaryStructure?.houseRent ?? 0,
  );
  const medicalAllowance = Number(
    toSalary?.medicalAllowance ?? currentSalaryStructure?.medicalAllowance ?? 0,
  );
  const transportAllowance = Number(
    toSalary?.transportAllowance ?? currentSalaryStructure?.transportAllowance ?? 0,
  );
  const otherAllowance = Number(
    toSalary?.otherAllowance ?? currentSalaryStructure?.otherAllowance ?? 0,
  );
  const grossSalary = Number(
    toSalary?.grossSalary ??
      basicSalary + houseRent + medicalAllowance + transportAllowance + otherAllowance,
  );
  const taxDeduction = Number(
    toSalary?.taxDeduction ?? currentSalaryStructure?.taxDeduction ?? 0,
  );
  const providentFund = Number(
    toSalary?.providentFund ?? currentSalaryStructure?.providentFund ?? 0,
  );
  const loanDeduction = Number(
    toSalary?.loanDeduction ?? currentSalaryStructure?.loanDeduction ?? 0,
  );
  const otherDeduction = Number(
    toSalary?.otherDeduction ?? currentSalaryStructure?.otherDeduction ?? 0,
  );
  const totalDeduction =
    taxDeduction + providentFund + loanDeduction + otherDeduction;
  const netSalary = Number(
    toSalary?.netSalary ?? Math.max(grossSalary - totalDeduction, 0),
  );

  return {
    basicSalary,
    houseRent,
    medicalAllowance,
    transportAllowance,
    otherAllowance,
    taxDeduction,
    providentFund,
    loanDeduction,
    otherDeduction,
    grossSalary,
    totalDeduction,
    netSalary,
  };
};

const createMovementSnapshot = async ({
  employee,
  payload,
}: {
  employee: any;
  movementType: string;
  payload: any;
}) => {
  const activeSalaryStructure = await SalaryStructure.findOne({
    employee: employee._id,
    isActive: true,
    isDeleted: false,
  }).sort({
    effectiveFrom: -1,
    createdAt: -1,
  });

  return {
    employeeId: employee?.employeeId || "",

    employeeName: getEmployeeFullName(employee),

    company: buildIdNameSnapshot(employee?.company),

    fromMajorDepartment: buildIdNameSnapshot(employee?.majorDepartment),

    toMajorDepartment: payload?.snapshot?.toMajorDepartment || null,

    fromDepartment: buildIdNameSnapshot(employee?.department),

    toDepartment: payload?.snapshot?.toDepartment || null,

    fromDesignation: buildIdNameSnapshot(employee?.designation),

    toDesignation: payload?.snapshot?.toDesignation || null,

    fromBranch: buildIdNameSnapshot(employee?.branch),

    toBranch: payload?.snapshot?.toBranch || null,

    fromServiceInfo: buildServiceInfoSnapshot(employee),

    toServiceInfo: payload?.snapshot?.toServiceInfo || null,

    fromSalary: buildSalaryInfoSnapshot(activeSalaryStructure),

    toSalary: payload?.snapshot?.toSalary || null,
  };
};

const addMovementAuditLog = ({
  movement,
  action,
  fromStatus,
  toStatus,
  actionBy,
  note,
}: {
  movement: any;

  action:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "applied"
    | "payroll_impact_checked";

  fromStatus?: string | null;

  toStatus?: string | null;

  actionBy?: string;

  note?: string;
}) => {
  movement.auditLogs.push({
    action,

    fromStatus: fromStatus || null,

    toStatus: toStatus || null,

    actionBy: actionBy ? new Types.ObjectId(actionBy) : null,

    actionAt: new Date(),

    note: note || "",
  });
};

const buildImpactRecord = ({
  module,
  record,
  missingMessage,
}: {
  module: TMovementPayrollImpactModule;
  record: any;
  missingMessage: string;
}): TEmployeeMovementPayrollImpactRecord => {
  if (!record) {
    return {
      module,
      recordId: "",
      status: "missing",
      isLocked: false,
      isBlocking: false,
      message: missingMessage,
    };
  }

  const status = record?.status || "unknown";
  const isLocked = Boolean(record?.isLocked || status === "locked");

  return {
    module,
    recordId: getObjectIdString(record?._id),
    status,
    isLocked,
    isBlocking: isLocked,
    message: isLocked
      ? `${module} is locked for the effective payroll month.`
      : `${module} exists but is not locked. Regeneration/review may be required after movement apply.`,
  };
};

const getMovementAffectedModules = (movementType: string) => {
  const attendanceRelatedMovements = [
    "transfer",
    "department_change",
    "branch_transfer",
    "major_department_change",
    "employment_status_change",
    "service_type_change",
    "pay_type_change",
    "duty_hour_change",
    "confirmation",
  ];

  const salaryRelatedMovements = [
    "increment",
    "promotion",
    "salary_revision",
    "designation_change",
    "employment_status_change",
    "service_type_change",
    "pay_type_change",
    "confirmation",
  ];

  const modules = new Set<TMovementPayrollImpactModule>();

  if (attendanceRelatedMovements.includes(movementType)) {
    modules.add("attendance_finalization");
    modules.add("time_bill");
  }

  if (salaryRelatedMovements.includes(movementType)) {
    modules.add("salary_sheet");
    modules.add("bonus_sheet");
  }

  if (!modules.size) {
    modules.add("attendance_finalization");
    modules.add("salary_sheet");
    modules.add("time_bill");
    modules.add("bonus_sheet");
  }

  return Array.from(modules);
};

const buildEmployeeMovementPayrollImpact = async (
  movement: any,
): Promise<TEmployeeMovementPayrollImpact> => {
  const effectiveDate = normalizeDateOnly(new Date(movement.effectiveDate));
  const effectivePayrollMonth = buildPayrollMonthFromDate(effectiveDate);
  const affectedModules = getMovementAffectedModules(movement.movementType);
  const employeeId = movement?.employee?._id || movement?.employee;

  const [attendanceFinalization, salarySheet, timeBill, bonusSheet] =
    await Promise.all([
      AttendanceFinalization.findOne({
        employee: employeeId,
        payrollMonth: effectivePayrollMonth,
        isDeleted: false,
      }).lean(),
      SalarySheet.findOne({
        employee: employeeId,
        payrollMonth: effectivePayrollMonth,
        isDeleted: false,
      }).lean(),
      TimeBill.findOne({
        employee: employeeId,
        payrollMonth: effectivePayrollMonth,
        isDeleted: false,
      }).lean(),
      BonusSheet.findOne({
        employee: employeeId,
        bonusMonth: effectivePayrollMonth,
        isDeleted: false,
      }).lean(),
    ]);

  const records = [
    buildImpactRecord({
      module: "attendance_finalization",
      record: attendanceFinalization,
      missingMessage: "Attendance Finalization not generated for effective payroll month.",
    }),
    buildImpactRecord({
      module: "salary_sheet",
      record: salarySheet,
      missingMessage: "Salary Sheet not generated for effective payroll month.",
    }),
    buildImpactRecord({
      module: "time_bill",
      record: timeBill,
      missingMessage: "Time Bill not generated for effective payroll month.",
    }),
    buildImpactRecord({
      module: "bonus_sheet",
      record: bonusSheet,
      missingMessage: "Bonus Sheet not generated for effective payroll month.",
    }),
  ].filter((record) => affectedModules.includes(record.module));

  const blockers = records
    .filter((record) => record.isBlocking)
    .map((record) => record.message);

  const warnings = records
    .filter((record) => record.recordId && !record.isBlocking)
    .map((record) => record.message);

  let nextRequiredAction = "movement_can_be_applied";

  if (blockers.length) {
    nextRequiredAction = "unlock_or_reverse_downstream_locked_records_first";
  } else if (warnings.length) {
    nextRequiredAction = "apply_movement_then_regenerate_affected_unlocked_records";
  }

  return {
    effectivePayrollMonth,
    effectiveDate,
    affectedModules,
    records,
    hasBlockingLockedRecords: blockers.length > 0,
    blockers,
    warnings,
    nextRequiredAction,
    checkedAt: new Date(),
  };
};

const createEmployeeMovementIntoDB = async (
  payload: any,
  actionBy?: string,
) => {
  if (!payload?.employee) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Employee is required.");
  }

  if (!Types.ObjectId.isValid(payload.employee)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid employee id.");
  }

  const employee = await Employee.findOne({
    _id: payload.employee,
    isDeleted: false,
  })
    .populate("company")
    .populate("majorDepartment")
    .populate("branch")
    .populate("department")
    .populate("designation");

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found.");
  }

  const snapshot = await createMovementSnapshot({
    employee,
    movementType: payload.movementType,
    payload,
  });

  const movement = await EmployeeMovement.create({
    employee: employee._id,

    movementType: payload.movementType,

    effectiveDate: new Date(payload.effectiveDate),

    reason: payload.reason || "",

    remarks: payload.remarks || "",

    referenceNo: payload.referenceNo || "",

    snapshot,

    payrollImpact: null,

    status: "draft",

    approvedBy: null,

    approvedAt: null,

    appliedBy: null,

    appliedAt: null,

    auditLogs: [
      {
        action: "created",

        fromStatus: null,

        toStatus: "draft",

        actionBy: actionBy ? new Types.ObjectId(actionBy) : null,

        actionAt: new Date(),

        note: `${payload.movementType} movement created.`,
      },
    ],

    isDeleted: false,
  });

  movement.payrollImpact = await buildEmployeeMovementPayrollImpact(movement);

  await movement.save();

  return movement;
};

const approveEmployeeMovementIntoDB = async (id: string, actionBy?: string) => {
  const movement = await EmployeeMovement.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!movement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee movement not found.");
  }

  if (movement.status === "approved") {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Movement already approved.");
  }

  if (movement.status === "applied") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Applied movement cannot be approved again.",
    );
  }

  const previousStatus = movement.status;

  movement.status = "approved";

  movement.approvedBy = actionBy ? new Types.ObjectId(actionBy) : null;

  movement.approvedAt = new Date();

  movement.payrollImpact = await buildEmployeeMovementPayrollImpact(movement);

  addMovementAuditLog({
    movement,

    action: "approved",

    fromStatus: previousStatus,

    toStatus: "approved",

    actionBy,

    note: "Movement approved.",
  });

  await movement.save();

  return movement;
};

const applyEmployeeMovementIntoDB = async (id: string, actionBy?: string) => {
  const movement = await EmployeeMovement.findOne({
    _id: id,
    isDeleted: false,
  }).populate("employee");

  if (!movement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee movement not found.");
  }

  if (movement.status === "applied") {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Movement already applied.");
  }

  if (movement.status !== "approved") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only approved movement can be applied.",
    );
  }

  const today = normalizeDateOnly(new Date());

  const effectiveDate = normalizeDateOnly(new Date(movement.effectiveDate));

  if (today < effectiveDate) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Movement cannot be applied before effective date (${effectiveDate.toDateString()}).`,
    );
  }

  const payrollImpact = await buildEmployeeMovementPayrollImpact(movement);

  if (payrollImpact.hasBlockingLockedRecords) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      `Employee movement cannot be applied because downstream payroll records are locked for ${payrollImpact.effectivePayrollMonth}. Blockers: ${payrollImpact.blockers.join(
        "; ",
      )}`,
    );
  }

  const employee = movement.employee as any;

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found.");
  }

  const snapshot = movement.snapshot;

  if (snapshot?.toMajorDepartment?.id) {
    employee.majorDepartment = snapshot.toMajorDepartment.id;
  }

  if (snapshot?.toDepartment?.id) {
    employee.department = snapshot.toDepartment.id;
  }

  if (snapshot?.toDesignation?.id) {
    employee.designation = snapshot.toDesignation.id;
  }

  if (snapshot?.toBranch?.id) {
    employee.branch = snapshot.toBranch.id;
  }

  if (snapshot?.toServiceInfo?.serviceType) {
    employee.serviceType = snapshot.toServiceInfo.serviceType;
  }

  if (snapshot?.toServiceInfo?.payType) {
    employee.payType = snapshot.toServiceInfo.payType;
  }

  if (snapshot?.toServiceInfo?.employmentStatus) {
    employee.employmentStatus = snapshot.toServiceInfo.employmentStatus;
  }

  if (typeof snapshot?.toServiceInfo?.dutyHourPerDay === "number") {
    employee.dutyHourPerDay = snapshot.toServiceInfo.dutyHourPerDay;
  }

  if (typeof snapshot?.toServiceInfo?.leaveDay === "number") {
    employee.leaveDay = snapshot.toServiceInfo.leaveDay;
  }

  if (snapshot?.toServiceInfo?.confirmationDate) {
    employee.confirmationDate = snapshot.toServiceInfo.confirmationDate;
  }

  await employee.save();

  if (snapshot?.toSalary?.grossSalary || snapshot?.toSalary?.basicSalary) {
    const activeSalaryStructure = await SalaryStructure.findOne({
      employee: employee._id,
      isActive: true,
      isDeleted: false,
    }).sort({
      effectiveFrom: -1,
      createdAt: -1,
    });

    const calculatedSalary = calculateSalaryStructureValues({
      currentSalaryStructure: activeSalaryStructure,
      toSalary: snapshot.toSalary,
    });

    if (activeSalaryStructure) {
      activeSalaryStructure.isActive = false;

      await activeSalaryStructure.save();
    }

    await SalaryStructure.create({
      employee: employee._id,
      ...calculatedSalary,
      effectiveFrom: formatDateOnly(effectiveDate),
      remarks:
        movement.remarks ||
        `${movement.movementType} movement applied from ${formatDateOnly(
          effectiveDate,
        )}.`,
      isActive: true,
      isDeleted: false,
    });
  }

  const previousStatus = movement.status;

  movement.status = "applied";

  movement.appliedBy = actionBy ? new Types.ObjectId(actionBy) : null;

  movement.appliedAt = new Date();

  movement.payrollImpact = payrollImpact;

  addMovementAuditLog({
    movement,

    action: "applied",

    fromStatus: previousStatus,

    toStatus: "applied",

    actionBy,

    note: payrollImpact.warnings.length
      ? `Movement applied. Warning: ${payrollImpact.warnings.join("; ")}`
      : "Movement applied successfully.",
  });

  await movement.save();

  return movement;
};

const getEmployeeMovementPayrollImpactPreviewFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid movement id.");
  }

  const movement = await EmployeeMovement.findOne({
    _id: id,
    isDeleted: false,
  }).populate("employee");

  if (!movement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee movement not found.");
  }

  const payrollImpact = await buildEmployeeMovementPayrollImpact(movement);

  return {
    movementId: movement._id,
    employee: movement.employee,
    movementType: movement.movementType,
    status: movement.status,
    effectiveDate: movement.effectiveDate,
    payrollImpact,
  };
};

const getEmployeeMovementTimelineFromDB = async (employeeId: string) => {
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid employee id.");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee not found.");
  }

  const movements = await EmployeeMovement.find({
    employee: employeeId,
    isDeleted: false,
  }).sort({
    effectiveDate: 1,
    createdAt: 1,
  });

  return movements.map((movement: any) => ({
    movementId: movement?._id?.toString(),

    movementType: movement?.movementType,

    status: movement?.status,

    effectiveDate: movement?.effectiveDate,

    effectivePayrollMonth: movement?.payrollImpact?.effectivePayrollMonth || "",

    hasPayrollBlocker:
      movement?.payrollImpact?.hasBlockingLockedRecords || false,

    approvedAt: movement?.approvedAt,

    appliedAt: movement?.appliedAt,

    fromMajorDepartment: movement?.snapshot?.fromMajorDepartment?.name || "",

    toMajorDepartment: movement?.snapshot?.toMajorDepartment?.name || "",

    fromDepartment: movement?.snapshot?.fromDepartment?.name || "",

    toDepartment: movement?.snapshot?.toDepartment?.name || "",

    fromDesignation: movement?.snapshot?.fromDesignation?.name || "",

    toDesignation: movement?.snapshot?.toDesignation?.name || "",

    fromBranch: movement?.snapshot?.fromBranch?.name || "",

    toBranch: movement?.snapshot?.toBranch?.name || "",

    fromGrossSalary: movement?.snapshot?.fromSalary?.grossSalary || 0,

    toGrossSalary: movement?.snapshot?.toSalary?.grossSalary || 0,

    fromServiceType: movement?.snapshot?.fromServiceInfo?.serviceType || "",

    toServiceType: movement?.snapshot?.toServiceInfo?.serviceType || "",

    fromEmploymentStatus:
      movement?.snapshot?.fromServiceInfo?.employmentStatus || "",

    toEmploymentStatus:
      movement?.snapshot?.toServiceInfo?.employmentStatus || "",

    reason: movement?.reason || "",

    remarks: movement?.remarks || "",
  }));
};

const getAllEmployeeMovementsFromDB = async () => {
  return EmployeeMovement.find({
    isDeleted: false,
  })
    .populate("employee")
    .populate("approvedBy")
    .populate("appliedBy")
    .sort({
      createdAt: -1,
    });
};

const getSingleEmployeeMovementFromDB = async (id: string) => {
  const movement = await EmployeeMovement.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("approvedBy")
    .populate("appliedBy");

  if (!movement) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Employee movement not found.");
  }

  return movement;
};

export const EmployeeMovementService = {
  createEmployeeMovementIntoDB,

  approveEmployeeMovementIntoDB,

  applyEmployeeMovementIntoDB,

  getEmployeeMovementPayrollImpactPreviewFromDB,

  getEmployeeMovementTimelineFromDB,

  getAllEmployeeMovementsFromDB,

  getSingleEmployeeMovementFromDB,
};

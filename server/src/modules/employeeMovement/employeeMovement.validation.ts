import { z } from "zod";
import { createRestoreValidationSchema, createSoftDeleteValidationSchema } from "../../common/softDelete";

const movementTypes = [
  "increment",
  "promotion",
  "transfer",
  "salary_revision",
  "designation_change",
  "department_change",
  "branch_transfer",
  "major_department_change",
  "employment_status_change",
  "service_type_change",
  "pay_type_change",
  "duty_hour_change",
  "confirmation",
] as const;

const movementStatuses = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "applied",
] as const;

const idNameSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
  })
  .nullable()
  .optional();

const salaryInfoSchema = z
  .object({
    grossSalary: z.number().min(0).optional(),
    basicSalary: z.number().min(0).optional(),
    houseRent: z.number().min(0).optional(),
    medicalAllowance: z.number().min(0).optional(),
    transportAllowance: z.number().min(0).optional(),
    otherAllowance: z.number().min(0).optional(),
    taxDeduction: z.number().min(0).optional(),
    providentFund: z.number().min(0).optional(),
    loanDeduction: z.number().min(0).optional(),
    otherDeduction: z.number().min(0).optional(),
    totalDeduction: z.number().min(0).optional(),
    netSalary: z.number().min(0).optional(),
  })
  .nullable()
  .optional();

const serviceInfoSchema = z
  .object({
    serviceType: z.string().optional(),
    payType: z.string().optional(),
    employmentStatus: z.string().optional(),
    dutyHourPerDay: z.number().min(0).max(24).optional(),
    leaveDay: z.number().min(0).optional(),
    confirmationDate: z.string().optional(),
  })
  .nullable()
  .optional();

const snapshotSchema = z
  .object({
    employeeId: z.string().optional(),
    employeeName: z.string().optional(),
    company: idNameSchema,
    fromMajorDepartment: idNameSchema,
    toMajorDepartment: idNameSchema,
    fromDepartment: idNameSchema,
    toDepartment: idNameSchema,
    fromDesignation: idNameSchema,
    toDesignation: idNameSchema,
    fromBranch: idNameSchema,
    toBranch: idNameSchema,
    fromServiceInfo: serviceInfoSchema,
    toServiceInfo: serviceInfoSchema,
    fromSalary: salaryInfoSchema,
    toSalary: salaryInfoSchema,
  })
  .nullable()
  .optional();

const createEmployeeMovementValidationSchema = z.object({
  body: z.object({
    employee: z.string().min(1, "Employee is required."),

    movementType: z.enum(movementTypes),

    effectiveDate: z.string().min(1, "Effective date is required."),

    reason: z.string().optional(),

    remarks: z.string().optional(),

    referenceNo: z.string().optional(),

    snapshot: snapshotSchema,
  }),
});

const updateEmployeeMovementValidationSchema = z.object({
  body: z.object({
    movementType: z.enum(movementTypes).optional(),

    effectiveDate: z.string().optional(),

    reason: z.string().optional(),

    remarks: z.string().optional(),

    referenceNo: z.string().optional(),

    status: z.enum(movementStatuses).optional(),

    snapshot: snapshotSchema,
  }),
});



const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const employeeMovementIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee movement id"),
  }),
});

const employeeMovementTimelineParamValidationSchema = z.object({
  params: z.object({
    employeeId: objectIdSchema("employee id"),
  }),
});

const deleteEmployeeMovementValidationSchema = createSoftDeleteValidationSchema("id");

const restoreEmployeeMovementValidationSchema = createRestoreValidationSchema("id");

export const EmployeeMovementValidation = {
  createEmployeeMovementValidationSchema,

  updateEmployeeMovementValidationSchema,
  employeeMovementIdParamValidationSchema,
  employeeMovementTimelineParamValidationSchema,
  deleteEmployeeMovementValidationSchema,
  restoreEmployeeMovementValidationSchema,
};

import { z } from "zod";

const movementTypes = [
  "increment",
  "promotion",
  "transfer",
  "salary_revision",
  "designation_change",
  "department_change",
  "branch_transfer",
] as const;

const movementStatuses = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "applied",
] as const;

const createEmployeeMovementValidationSchema = z.object({
  body: z.object({
    employee: z.string().min(1, "Employee is required."),

    movementType: z.enum(movementTypes),

    effectiveDate: z.string().min(1, "Effective date is required."),

    reason: z.string().optional(),

    remarks: z.string().optional(),

    referenceNo: z.string().optional(),

    snapshot: z
      .object({
        employeeId: z.string().optional(),

        employeeName: z.string().optional(),

        company: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        fromDepartment: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        toDepartment: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        fromDesignation: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        toDesignation: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        fromBranch: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        toBranch: z
          .object({
            id: z.string().optional(),

            name: z.string().optional(),
          })
          .nullable()
          .optional(),

        fromSalary: z
          .object({
            grossSalary: z.number().optional(),

            basicSalary: z.number().optional(),

            netSalary: z.number().optional(),
          })
          .nullable()
          .optional(),

        toSalary: z
          .object({
            grossSalary: z.number().optional(),

            basicSalary: z.number().optional(),

            netSalary: z.number().optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
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
  }),
});

export const EmployeeMovementValidation = {
  createEmployeeMovementValidationSchema,

  updateEmployeeMovementValidationSchema,
};

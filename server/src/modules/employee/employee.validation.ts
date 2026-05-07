import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const employeeStatusSchema = z.enum(["active", "inactive"]);

const employmentStatusSchema = z.enum([
  "active",
  "probation",
  "confirmed",
  "resigned",
  "terminated",
  "retired",
  "suspended",
]);

const serviceTypeSchema = z.enum([
  "permanent",
  "probation",
  "contractual",
  "temporary",
  "daily_wage",
  "intern",
]);

const payTypeSchema = z.enum(["monthly", "daily", "hourly"]);

const genderSchema = z.enum(["male", "female", "other"]);

const isValidDateString = (value: string) => {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const dateStringSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldName} must follow YYYY-MM-DD format`)
    .refine((value) => isValidDateString(value), {
      message: `${fieldName} must be a valid date`,
    });

const employeeIdSchema = z
  .string()
  .trim()
  .min(2, "Employee ID must be at least 2 characters")
  .max(30, "Employee ID cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Employee ID can contain only letters, numbers, underscore and hyphen",
  )
  .transform((value) => value.toUpperCase());

const optionalCodeSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} cannot be empty`)
    .max(30, `${fieldName} cannot exceed 30 characters`)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      `${fieldName} can contain only letters, numbers, underscore and hyphen`,
    )
    .transform((value) => value.toUpperCase())
    .optional();

const employeeNameValidationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),
    middleName: z
      .string()
      .trim()
      .max(50, "Middle name cannot exceed 50 characters")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),
  })
  .strict();

const updateEmployeeNameValidationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .optional(),
    middleName: z
      .string()
      .trim()
      .max(50, "Middle name cannot exceed 50 characters")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one name field is required",
  });

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(20, "Phone number cannot exceed 20 characters")
  .regex(
    /^[+0-9][0-9\s-]{6,19}$/,
    "Phone number can contain only numbers, space, hyphen and optional plus sign",
  );

const salarySchema = z.coerce
  .number()
  .min(0, "Basic salary cannot be negative")
  .max(100000000, "Basic salary is too large");

const dutyHourPerDaySchema = z.coerce
  .number()
  .min(0, "Duty hour per day cannot be negative")
  .max(24, "Duty hour per day cannot exceed 24");

const leaveDaySchema = z.coerce
  .number()
  .min(0, "Leave day cannot be negative")
  .max(365, "Leave day cannot exceed 365");

const createEmployeeValidationSchema = z.object({
  body: z
    .object({
      employeeId: employeeIdSchema,
      officeId: optionalCodeSchema("Office ID"),
      cardNo: optionalCodeSchema("Card No"),

      user: objectIdSchema("user id").optional(),

      name: employeeNameValidationSchema,
      email: z.string().trim().toLowerCase().email("Invalid employee email"),
      phone: phoneSchema,
      gender: genderSchema,
      dateOfBirth: dateStringSchema("Date of birth").optional(),

      company: objectIdSchema("company id"),
      majorDepartment: objectIdSchema("major department id"),
      department: objectIdSchema("department id"),
      designation: objectIdSchema("designation id"),
      branch: objectIdSchema("branch id"),

      joiningDate: dateStringSchema("Joining date"),
      confirmationDate: dateStringSchema("Confirmation date").optional(),

      serviceType: serviceTypeSchema.optional(),
      payType: payTypeSchema.optional(),
      dutyHourPerDay: dutyHourPerDaySchema.optional(),
      leaveDay: leaveDaySchema.optional(),

      employmentStatus: employmentStatusSchema.optional(),

      basicSalary: salarySchema.optional(),

      status: employeeStatusSchema.optional(),
    })
    .strict(),
});

const updateEmployeeValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee id"),
  }),
  body: z
    .object({
      /**
       * employeeId intentionally not allowed here.
       * Official employee ID is permanent after employee creation.
       */
      officeId: optionalCodeSchema("Office ID"),
      cardNo: optionalCodeSchema("Card No"),

      user: objectIdSchema("user id").optional(),

      name: updateEmployeeNameValidationSchema.optional(),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid employee email")
        .optional(),
      phone: phoneSchema.optional(),
      gender: genderSchema.optional(),
      dateOfBirth: dateStringSchema("Date of birth").optional(),

      company: objectIdSchema("company id").optional(),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      designation: objectIdSchema("designation id").optional(),
      branch: objectIdSchema("branch id").optional(),

      joiningDate: dateStringSchema("Joining date").optional(),
      confirmationDate: dateStringSchema("Confirmation date").optional(),

      serviceType: serviceTypeSchema.optional(),
      payType: payTypeSchema.optional(),
      dutyHourPerDay: dutyHourPerDaySchema.optional(),
      leaveDay: leaveDaySchema.optional(),

      employmentStatus: employmentStatusSchema.optional(),

      basicSalary: salarySchema.optional(),

      status: employeeStatusSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const getAllEmployeesValidationSchema = z.object({
  query: z
    .object({
      status: employeeStatusSchema.optional(),
      employmentStatus: employmentStatusSchema.optional(),
      serviceType: serviceTypeSchema.optional(),
      payType: payTypeSchema.optional(),

      company: objectIdSchema("company id").optional(),
      majorDepartment: objectIdSchema("major department id").optional(),
      department: objectIdSchema("department id").optional(),
      designation: objectIdSchema("designation id").optional(),
      branch: objectIdSchema("branch id").optional(),
    })
    .strict()
    .optional(),
});

const employeeIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("employee id"),
  }),
});

export const EmployeeValidations = {
  createEmployeeValidationSchema,
  updateEmployeeValidationSchema,
  getAllEmployeesValidationSchema,
  employeeIdParamValidationSchema,
};

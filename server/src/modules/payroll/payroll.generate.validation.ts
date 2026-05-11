import { z } from "zod";
import {
  monthNumberSchema,
  objectIdSchema,
  optionalObjectIdSchema,
  optionalTrimmedStringSchema,
  yearNumberSchema,
} from "../../common/validation";

const generateMonthlyPayrollValidationSchema = z.object({
  body: z
    .object({
      month: monthNumberSchema,
      year: yearNumberSchema,
      company: objectIdSchema("company id"),
      branch: optionalObjectIdSchema("branch id"),
      majorDepartment: optionalObjectIdSchema("major department id"),
      department: optionalObjectIdSchema("department id"),
      employee: optionalObjectIdSchema("employee id"),
      overwrite: z.boolean().optional(),
      remarks: optionalTrimmedStringSchema("Remarks", { max: 500 }),
    })
    .strict(),
});

export const PayrollGenerateValidation = {
  generateMonthlyPayrollValidationSchema,
};

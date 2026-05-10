import { z } from "zod";
import { USER_ROLES } from "../user/user.constant";

const categorySchema = z
  .enum([
    "master_data",
    "employee",
    "attendance",
    "leave",
    "salary",
    "ot",
    "bonus",
    "payment",
    "report",
    "security",
    "system",
  ])
  .optional();

const riskLevelSchema = z
  .enum(["low", "medium", "high", "critical"])
  .optional();

const roleSchema = z.enum(USER_ROLES as [string, ...string[]]).optional();

const commonQueryValidationSchema = z.object({
  query: z.object({
    module: z.string().trim().min(1).optional(),
    role: roleSchema,
    category: categorySchema,
    riskLevel: riskLevelSchema,
  }),
});

export const RbacAuditValidations = {
  commonQueryValidationSchema,
};

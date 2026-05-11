import { z } from "zod";
import {
  createRestoreValidationSchema,
  createSoftDeleteValidationSchema,
} from "../../common/softDelete";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${fieldName}`);

const createHolidayValidationSchema = z.object({
  body: z.object({
    holidayName: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Holiday name is required"
          : "Invalid holiday name",
    }),
    holidayDate: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Holiday date is required"
            : "Invalid holiday date",
      })
      .regex(dateRegex, { error: "Holiday date must be in YYYY-MM-DD format" }),
    holidayType: z.enum(
      ["weekly", "public", "festival", "company", "optional", "eid"],
      {
        error: "Invalid holiday type",
      },
    ),
    remarks: z.string().optional(),
  }),
});

const updateHolidayValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("holiday id"),
  }),
  body: z.object({
    holidayName: z.string().optional(),
    holidayDate: z
      .string()
      .regex(dateRegex, { error: "Holiday date must be in YYYY-MM-DD format" })
      .optional(),
    holidayType: z
      .enum(["weekly", "public", "festival", "company", "optional", "eid"], {
        error: "Invalid holiday type",
      })
      .optional(),
    remarks: z.string().optional(),
  }),
});

const holidayIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema("holiday id"),
  }),
});

const deleteHolidayValidationSchema = createSoftDeleteValidationSchema("id");

const restoreHolidayValidationSchema = createRestoreValidationSchema("id");

export const HolidayValidations = {
  createHolidayValidationSchema,
  updateHolidayValidationSchema,
  holidayIdParamValidationSchema,
  deleteHolidayValidationSchema,
  restoreHolidayValidationSchema,
};

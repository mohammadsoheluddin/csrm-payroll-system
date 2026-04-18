import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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
      ["weekly", "public", "festival", "company", "optional"],
      {
        error: "Invalid holiday type",
      },
    ),
    remarks: z.string().optional(),
  }),
});

const updateHolidayValidationSchema = z.object({
  body: z.object({
    holidayName: z.string().optional(),
    holidayDate: z
      .string()
      .regex(dateRegex, { error: "Holiday date must be in YYYY-MM-DD format" })
      .optional(),
    holidayType: z
      .enum(["weekly", "public", "festival", "company", "optional"], {
        error: "Invalid holiday type",
      })
      .optional(),
    remarks: z.string().optional(),
  }),
});

export const HolidayValidations = {
  createHolidayValidationSchema,
  updateHolidayValidationSchema,
};

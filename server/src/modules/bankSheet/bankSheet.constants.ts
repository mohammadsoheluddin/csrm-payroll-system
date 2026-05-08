export const BANK_SHEET_SOURCE_TYPES = [
  "salary",
  "ot",
  "bonus",
  "tada",
  "allowance",
  "held_salary",
  "final_settlement",
] as const;

export const BANK_SHEET_PAYMENT_MODES = [
  "bank",
  "cash",
  "mobile_banking",
] as const;

export const BANK_SHEET_SUPPORTED_SOURCE_TYPE = "salary" as const;
export const BANK_SHEET_DEFAULT_PAYMENT_MODE = "bank" as const;

export const BANK_SHEET_PAYROLL_ALLOWED_STATUSES = [
  "approved",
  "paid",
] as const;

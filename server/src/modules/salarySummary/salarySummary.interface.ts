export type TSalarySummaryGroupBy =
  | "company"
  | "majorDepartment"
  | "department"
  | "branch";

export type TSalarySummaryDataSource =
  | "salary_payment_distribution"
  | "ot_payment_distribution";

export type TSalarySummaryQuery = {
  payrollMonth?: string;
  month?: string | number;
  year?: string | number;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  groupBy?: TSalarySummaryGroupBy;
  includeUnlocked?: string | boolean;
};

export type TSalarySummaryAmountTotals = {
  employeeCount: number;
  grossAmount: number;
  netAmount: number;
  bankAmount: number;
  mobileBankingAmount: number;
  bankAndMobileAmount: number;
  cashAmount: number;
  aitAmount: number;
  loanAmount: number;
  suspenseAmount: number;
  totalDeduction: number;
};

export type TSalarySummaryOtTotals = {
  employeeCount: number;
  grossAmount: number;
  otAmount: number;
  tiffinAmount: number;
  totalPayableAmount: number;
  bankAmount: number;
  mobileBankingAmount: number;
  bankAndMobileAmount: number;
  cashAmount: number;
};

export type TSalarySummaryGroupRow = {
  groupKey: string;
  groupName: string;
  companyKey: string;
  companyName: string;
} & TSalarySummaryAmountTotals;

export type TSalarySummaryOtGroupRow = {
  groupKey: string;
  groupName: string;
  companyKey: string;
  companyName: string;
} & TSalarySummaryOtTotals;

export type TSalarySummarySection = {
  source: "salary_and_wages";
  sectionKey: string;
  title: string;
  companyKey: string;
  companyName: string;
  rows: TSalarySummaryGroupRow[];
  grandTotal: TSalarySummaryAmountTotals;
};

export type TSalarySummaryOtSection = {
  source: "ot";
  sectionKey: string;
  title: string;
  companyKey: string;
  companyName: string;
  rows: TSalarySummaryOtGroupRow[];
  grandTotal: TSalarySummaryOtTotals;
};

export type TSalarySummaryCombinedTotals = {
  salaryAndWages: TSalarySummaryAmountTotals;
  overtime: TSalarySummaryOtTotals;
  groupTotal: {
    grossAmount: number;
    netAmount: number;
    bankAmount: number;
    mobileBankingAmount: number;
    bankAndMobileAmount: number;
    cashAmount: number;
  };
};

export type TSalarySummaryDataSourceReadiness = {
  source: TSalarySummaryDataSource;
  totalRecords: number;
  lockedRecords: number;
  unlockedRecords: number;
  isGenerated: boolean;
  isFullyLocked: boolean;
};

export type TSalarySummaryPreview = {
  payrollMonth: string;
  month: number;
  year: number;
  filters: {
    company: string | null;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    groupBy: TSalarySummaryGroupBy;
    includeUnlocked: boolean;
  };
  meta: {
    generatedAt: string;
    sourceNote: string;
    deductionBreakdownNote: string;
    reportNote: string;
  };
  readiness: {
    canExport: boolean;
    blockers: string[];
    warnings: string[];
    salaryPaymentDistribution: TSalarySummaryDataSourceReadiness;
    otPaymentDistribution: TSalarySummaryDataSourceReadiness;
  };
  salaryAndWagesSections: TSalarySummarySection[];
  overtimeSections: TSalarySummaryOtSection[];
  combinedTotals: TSalarySummaryCombinedTotals;
};

export type TSalarySummaryExportFileResult = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  reportData: TSalarySummaryPreview;
};

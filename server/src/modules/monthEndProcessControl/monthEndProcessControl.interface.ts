export type TMonthEndProcessStageKey =
  | "attendance_finalization"
  | "salary_sheet"
  | "salary_statement"
  | "salary_payment_distribution"
  | "time_bill"
  | "ot_statement"
  | "ot_payment_distribution";

export type TMonthEndProcessFlowKey = "salary" | "ot" | "overall";

export type TMonthEndProcessStatusSummary = Record<string, number>;

export type TMonthEndProcessControlQuery = {
  payrollMonth?: string;
  month?: string | number;
  year?: string | number;
  company: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
};

export type TMonthEndProcessStageSummary = {
  key: TMonthEndProcessStageKey;
  name: string;
  modulePath: string;
  sequence: number;
  totalRecords: number;
  expectedEmployeeCount: number;
  missingRecordCount: number;
  statusSummary: TMonthEndProcessStatusSummary;
  lockSummary: {
    locked: number;
    unlocked: number;
  };
  isGenerated: boolean;
  isFullyLocked: boolean;
  canUseAsSource: boolean;
  blockers: string[];
  totals: Record<string, number>;
};

export type TMonthEndSalaryFlowReadiness = {
  canGenerateSalarySheet: boolean;
  canGenerateSalaryStatement: boolean;
  canGenerateSalaryPaymentDistribution: boolean;
  canExportSalaryBankSheet: boolean;
  canExportSalaryCashSheet: boolean;
  canExportSalaryMobileBankingSheet: boolean;
  isSalaryFlowComplete: boolean;
  nextRequiredAction: string;
  blockers: string[];
};

export type TMonthEndOtFlowReadiness = {
  canGenerateTimeBill: boolean;
  canGenerateOtStatement: boolean;
  canGenerateOtPaymentDistribution: boolean;
  canExportOtBankSheet: boolean;
  canExportOtCashSheet: boolean;
  canExportOtMobileBankingSheet: boolean;
  isOtFlowComplete: boolean;
  nextRequiredAction: string;
  blockers: string[];
};

export type TMonthEndOverallReadiness = {
  isAttendanceReady: boolean;
  isSalaryFlowComplete: boolean;
  isOtFlowComplete: boolean;
  isMonthEndComplete: boolean;
  nextRequiredAction: string;
  blockers: string[];
};

export type TMonthEndProcessChecklistItem = {
  sequence: number;
  flow: TMonthEndProcessFlowKey;
  key: string;
  title: string;
  isComplete: boolean;
  isBlocked: boolean;
  blocker?: string;
  sourceStage?: TMonthEndProcessStageKey;
  targetModulePath?: string;
};

export type TMonthEndProcessControlSummary = {
  payrollMonth: string;
  month: number;
  year: number;
  filters: {
    company: string;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    employee: string | null;
  };
  expectedEmployeeCount: number;
  stages: Record<TMonthEndProcessStageKey, TMonthEndProcessStageSummary>;
  flows: {
    salary: TMonthEndSalaryFlowReadiness;
    ot: TMonthEndOtFlowReadiness;
    overall: TMonthEndOverallReadiness;
  };
  checklist: TMonthEndProcessChecklistItem[];
  generatedAt: Date;
};

export type TReportCenterCategory =
  | "employee"
  | "attendance"
  | "leave"
  | "salary"
  | "time_bill_ot"
  | "bonus"
  | "payment"
  | "audit_control";

export type TReportCenterFlow =
  | "hr"
  | "attendance"
  | "leave"
  | "salary"
  | "ot"
  | "bonus"
  | "payment"
  | "control";

export type TReportCenterFormat = "preview" | "csv" | "excel" | "pdf";

export type TReportCenterPeriodType =
  | "monthly"
  | "yearly"
  | "bonus_month"
  | "on_demand";

export type TReportCenterQuery = {
  payrollMonth?: string;
  bonusMonth?: string;
  month?: string | number;
  year?: string | number;
  company?: string;
  majorDepartment?: string;
  department?: string;
  branch?: string;
  employee?: string;
  category?: TReportCenterCategory;
  flow?: TReportCenterFlow;
};

export type TReportCenterExportPath = Partial<Record<TReportCenterFormat, string>>;

export type TReportCenterDefinition = {
  id: string;
  title: string;
  category: TReportCenterCategory;
  flow: TReportCenterFlow;
  sequence: number;
  description: string;
  modulePath: string;
  routePath: string;
  periodType: TReportCenterPeriodType;
  supportedFormats: TReportCenterFormat[];
  exportPaths: TReportCenterExportPath;
  requiredFilters: string[];
  optionalFilters: string[];
  requiredPermission: string;
  readinessGate?: string;
  downstreamUse?: string;
  isOperationalReport: boolean;
};

export type TReportCenterStageReadiness = {
  key: string;
  title: string;
  modulePath: string;
  totalRecords: number;
  lockedRecords: number;
  unlockedRecords: number;
  isGenerated: boolean;
  isFullyLocked: boolean;
  blockers: string[];
  totals: Record<string, number>;
};

export type TReportCenterReportReadiness = {
  reportId: string;
  title: string;
  category: TReportCenterCategory;
  flow: TReportCenterFlow;
  modulePath: string;
  isAvailable: boolean;
  isBlocked: boolean;
  blockers: string[];
  supportedFormats: TReportCenterFormat[];
  exportPaths: TReportCenterExportPath;
  requiredPermission: string;
  readinessGate?: string;
};

export type TReportCenterDashboard = {
  period: {
    payrollMonth: string | null;
    bonusMonth: string | null;
    month: number | null;
    year: number | null;
  };
  filters: {
    company: string | null;
    majorDepartment: string | null;
    department: string | null;
    branch: string | null;
    employee: string | null;
    category: TReportCenterCategory | null;
    flow: TReportCenterFlow | null;
  };
  totalCatalogReports: number;
  totalVisibleReports: number;
  totalAvailableReports: number;
  totalBlockedReports: number;
  categories: Record<TReportCenterCategory, number>;
  flows: Record<TReportCenterFlow, number>;
  stages: Record<string, TReportCenterStageReadiness>;
  reports: TReportCenterReportReadiness[];
  generatedAt: Date;
};

export type TReportCenterQuickLink = {
  reportId: string;
  title: string;
  category: TReportCenterCategory;
  flow: TReportCenterFlow;
  previewUrl: string | null;
  csvUrl: string | null;
  excelUrl: string | null;
  pdfUrl: string | null;
  isAvailable: boolean;
  blockers: string[];
};

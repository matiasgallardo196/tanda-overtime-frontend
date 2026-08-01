export type OvertimeStatus = 'ok' | 'warning' | 'exceeds';
export type EmploymentType = 'casual' | 'contract';

export interface PayrollWeek {
  start: string;
  end: string;
}

export interface OvertimeSummary {
  employeeId: number;
  employeeName: string;
  employmentType: EmploymentType;
  overtimeGroup: EmploymentType;
  payrollWeek: PayrollWeek;
  workedHours: number;
  remainingRosteredHours: number;
  projectedTotalHours: number;
  weeklyLimitHours: number;
  exceedsLimit: boolean;
  exceedsByHours: number;
  status: OvertimeStatus;
}

export interface BreakdownEntry {
  date: string;
  start: string | null;
  finish: string | null;
  unpaidBreakMinutes: number;
  paidBreakMinutes: number;
  hours: number;
  type: 'worked' | 'remaining';
}

export interface OvertimeCheck extends OvertimeSummary {
  breakdown: BreakdownEntry[];
}

export interface Department {
  id: number;
  name: string;
}

export interface ClockComplianceEntry {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  date: string;
  scheduledStart: string;
  scheduledFinish: string;
  actualStart: string;
  actualFinish: string | null;
  earlyClockInMinutes: number;
  lateClockOutMinutes: number;
  inProgress: boolean;
  flagged: boolean;
}

export interface Employee {
  id: number;
  name: string;
}

export type AlertChannelType = 'email' | 'whatsapp' | 'sms';

export interface AlertChannel {
  type: AlertChannelType;
  destination: string;
}

export interface AlertRecipient {
  name: string;
  channels: AlertChannel[];
}

export interface AlertSchedule {
  /** 24h "HH:mm" */
  time: string;
  timezone: string;
  /** 0=Sunday .. 6=Saturday */
  daysOfWeek: number[];
}

/** null = no filter (everyone/every department). An explicit array (even empty) restricts to exactly those IDs. */
export interface AlertContentFilter {
  departmentIds: number[] | null;
  employeeIds: number[] | null;
}

export interface OvertimeAlertContent extends AlertContentFilter {
  enabled: boolean;
  thresholdHours: number;
}

export interface ClockComplianceAlertContent extends AlertContentFilter {
  enabled: boolean;
  toleranceMinutes: number;
}

export interface Alert {
  id: string;
  name: string;
  enabled: boolean;
  schedule: AlertSchedule;
  overtime: OvertimeAlertContent;
  clockCompliance: ClockComplianceAlertContent;
  recipient: AlertRecipient;
  lastSentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlertInput = Omit<Alert, 'id' | 'lastSentDate' | 'createdAt' | 'updatedAt'>;

export interface ReportPreview {
  subject: string;
  html: string;
  text: string;
}

// ---------- Costs & Budget ----------

export interface DepartmentCost {
  department: string;
  hours: number;
  cost: number;
}

export interface WeeklyCost {
  weekStart: string;
  weekEnd: string;
  hours: number;
  cost: number;
  complete: boolean;
  partial: boolean;
  byDepartment: DepartmentCost[];
}

export interface BudgetConfig {
  totalBudget: number;
  startDate: string;
  endDate: string;
  updatedAt: string;
}

export type BudgetStatus = 'under' | 'tight' | 'over';

export interface BudgetTracking {
  spentInPeriod: number;
  remainingBudget: number;
  daysRemaining: number;
  weeksRemaining: number;
  weeklyCapRemaining: number;
  runRateWeekly: number;
  runRateWeeksUsed: number;
  projectedTotal: number;
  headroom: number;
  status: BudgetStatus;
}

export interface CostsSummary {
  fyStart: string;
  fyEnd: string;
  today: string;
  fyToDateCost: number;
  fyToDateHours: number;
  weeks: WeeklyCost[];
  departmentTotals: DepartmentCost[];
  budget: BudgetConfig | null;
  tracking: BudgetTracking | null;
}

export interface EmployeeCost {
  employeeId: number;
  employeeName: string;
  hours: number;
  cost: number;
}

export interface DailyCost {
  date: string;
  hours: number;
  cost: number;
}

export interface WeekCostDetail {
  weekStart: string;
  weekEnd: string;
  actualHours: number;
  actualCost: number;
  rosterHours: number;
  rosterCost: number;
  actualByDepartment: DepartmentCost[];
  rosterByDepartment: DepartmentCost[];
  byEmployee: EmployeeCost[];
  byDay: DailyCost[];
}

export type BudgetInput = Omit<BudgetConfig, 'updatedAt'>;

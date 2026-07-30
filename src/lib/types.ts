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

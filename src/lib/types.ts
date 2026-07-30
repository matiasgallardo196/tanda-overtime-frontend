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

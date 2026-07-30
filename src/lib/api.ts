import { ClockComplianceEntry, Department, OvertimeCheck, OvertimeSummary } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public tandaResponse?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  } catch {
    throw new ApiError(
      `Could not connect to the backend at ${API_BASE_URL}. Is it running (npm run start:dev)?`,
      0,
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(
      body?.message ?? `Error ${res.status} calling ${path}`,
      res.status,
      body?.tandaResponse,
    );
  }

  return res.json();
}

export function getOvertimeOverview(
  weeklyLimitHours = 38,
  weekOffset = 0,
): Promise<OvertimeSummary[]> {
  return request(
    `/tanda/overtime-check?weeklyLimitHours=${weeklyLimitHours}&weekOffset=${weekOffset}`,
  );
}

export function getOvertimeCheck(
  employeeId: number,
  weeklyLimitHours = 38,
  weekOffset = 0,
): Promise<OvertimeCheck> {
  return request(
    `/tanda/employees/${employeeId}/overtime-check?weeklyLimitHours=${weeklyLimitHours}&weekOffset=${weekOffset}`,
  );
}

export function getDepartments(): Promise<Department[]> {
  return request(`/tanda/departments`);
}

export function getClockCompliance(
  weekOffset: number,
  date: string | null,
  toleranceMinutes = 1,
): Promise<ClockComplianceEntry[]> {
  const params = new URLSearchParams();
  if (date) {
    params.set('date', date);
  } else {
    params.set('weekOffset', String(weekOffset));
  }
  params.set('toleranceMinutes', String(toleranceMinutes));
  return request(`/tanda/clock-compliance?${params.toString()}`);
}

import {
  Alert,
  AlertInput,
  ClockComplianceEntry,
  Department,
  Employee,
  OvertimeCheck,
  OvertimeSummary,
  ReportPreview,
} from './types';

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

async function request<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      method: init?.method ?? 'GET',
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
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

  if (res.status === 204) return undefined as T;
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

export function getEmployees(): Promise<Employee[]> {
  return request(`/tanda/employees`);
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

export function getAlerts(): Promise<Alert[]> {
  return request(`/alerts`);
}

export function createAlert(input: AlertInput): Promise<Alert> {
  return request(`/alerts`, { method: 'POST', body: input });
}

export function updateAlert(id: string, input: Partial<AlertInput>): Promise<Alert> {
  return request(`/alerts/${id}`, { method: 'PATCH', body: input });
}

export function deleteAlert(id: string): Promise<void> {
  return request(`/alerts/${id}`, { method: 'DELETE' });
}

export function sendTestAlert(id: string): Promise<{ sent: true }> {
  return request(`/alerts/${id}/test`, { method: 'POST' });
}

export function previewAlert(id: string): Promise<ReportPreview> {
  return request(`/alerts/${id}/preview`);
}

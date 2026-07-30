import { PayrollWeek } from './types';

const TUESDAY = 2;

/** Mirrors the backend's Tuesday-to-Monday payroll week calculation, purely for display (day picker). */
export function getPayrollWeek(weekOffset = 0, reference: Date = new Date()): PayrollWeek {
  const shifted = new Date(reference);
  shifted.setDate(shifted.getDate() + weekOffset * 7);

  const dow = shifted.getDay(); // Sunday=0 ... Tuesday=2 ... Saturday=6
  const daysSinceTuesday = (dow - TUESDAY + 7) % 7;

  const start = new Date(shifted);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceTuesday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: toDateStr(start), end: toDateStr(end) };
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

import { PayrollWeek } from '@/lib/types';

interface WeekNavProps {
  payrollWeek: PayrollWeek | null;
  weekOffset: number;
  onChange: (weekOffset: number) => void;
}

export function WeekNav({ payrollWeek, weekOffset, onChange }: WeekNavProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(weekOffset - 1)}
        aria-label="Previous payroll week"
        className="rounded-md border px-2.5 py-1.5 text-sm hover:shadow-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        &larr;
      </button>

      <div className="min-w-[9rem] text-center text-sm font-medium tabular-nums">
        {payrollWeek ? formatWeekLabel(payrollWeek) : '...'}
        {weekOffset === 0 && (
          <div className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            Current week
          </div>
        )}
      </div>

      <button
        onClick={() => onChange(weekOffset + 1)}
        aria-label="Next payroll week"
        className="rounded-md border px-2.5 py-1.5 text-sm hover:shadow-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        &rarr;
      </button>

      {weekOffset !== 0 && (
        <button
          onClick={() => onChange(0)}
          className="rounded-md border px-2.5 py-1.5 text-sm hover:shadow-sm"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          Today
        </button>
      )}
    </div>
  );
}

function formatWeekLabel(week: PayrollWeek): string {
  const start = parseDateOnly(week.start);
  const end = parseDateOnly(week.end);
  const startStr = start.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}, ${end.getFullYear()}`;
}

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

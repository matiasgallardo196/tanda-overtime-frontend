import { PayrollWeek } from '@/lib/types';

interface DayScopeSelectorProps {
  payrollWeek: PayrollWeek | null;
  selectedDate: string | null;
  onChange: (date: string | null) => void;
}

export function DayScopeSelector({ payrollWeek, selectedDate, onChange }: DayScopeSelectorProps) {
  const days = payrollWeek ? enumerateDays(payrollWeek.start) : [];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ScopeButton active={selectedDate === null} onClick={() => onChange(null)}>
        Whole week
      </ScopeButton>
      {days.map((d) => (
        <ScopeButton key={d} active={selectedDate === d} onClick={() => onChange(d)}>
          {formatDayLabel(d)}
        </ScopeButton>
      ))}
    </div>
  );
}

function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: active ? 'var(--seq-worked)' : 'var(--surface)',
        color: active ? '#ffffff' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  );
}

function enumerateDays(startIso: string): string[] {
  const [y, m, d] = startIso.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    result.push(toDateStr(day));
  }
  return result;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
}

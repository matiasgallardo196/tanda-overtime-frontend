interface WeeklyLimitControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function WeeklyLimitControl({ value, onChange }: WeeklyLimitControlProps) {
  return (
    <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      Weekly limit (hrs)
      <input
        type="number"
        min={0}
        step={0.5}
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-20 rounded-md border px-2 py-1 text-sm tabular-nums"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      />
    </label>
  );
}

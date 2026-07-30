const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface DayOfWeekPickerProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function DayOfWeekPicker({ value, onChange }: DayOfWeekPickerProps) {
  const toggle = (day: number) => {
    if (value.includes(day)) onChange(value.filter((d) => d !== day));
    else onChange([...value, day].sort());
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map((d) => {
        const active = value.includes(d.value);
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => toggle(d.value)}
            aria-pressed={active}
            className="flex h-9 w-11 items-center justify-center rounded-full border text-xs font-semibold transition-colors"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: active ? 'var(--seq-worked)' : 'var(--surface)',
              color: active ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

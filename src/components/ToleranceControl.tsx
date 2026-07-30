interface ToleranceControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function ToleranceControl({ value, onChange }: ToleranceControlProps) {
  return (
    <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      Tolerance (min)
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-16 rounded-md border px-2 py-1 text-sm tabular-nums"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      />
    </label>
  );
}

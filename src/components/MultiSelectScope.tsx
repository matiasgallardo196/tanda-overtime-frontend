interface Option {
  id: number;
  name: string;
}

interface MultiSelectScopeProps {
  label: string;
  options: Option[];
  /** null = all (no filter) */
  value: number[] | null;
  onChange: (value: number[] | null) => void;
}

export function MultiSelectScope({ label, options, value, onChange }: MultiSelectScopeProps) {
  const isAll = value === null;

  const toggleOption = (id: number) => {
    const current = value ?? [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-3">
        <span className="text-sm font-medium">{label}</span>
        <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <input type="radio" checked={isAll} onChange={() => onChange(null)} />
          All
        </label>
        <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <input type="radio" checked={!isAll} onChange={() => onChange(value ?? [])} />
          Specific
        </label>
      </div>

      {!isAll && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const active = (value ?? []).includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.id)}
                aria-pressed={active}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: active ? 'var(--seq-worked)' : 'var(--surface)',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {opt.name}
              </button>
            );
          })}
          {options.length === 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No options available
            </span>
          )}
        </div>
      )}
    </div>
  );
}

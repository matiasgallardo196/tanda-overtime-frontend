import { Department } from '@/lib/types';

interface DepartmentFilterProps {
  departments: Department[];
  selectedIds: Set<number>;
  onChange: (ids: Set<number>) => void;
}

export function DepartmentFilter({ departments, selectedIds, onChange }: DepartmentFilterProps) {
  const toggle = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Departments
      </span>
      {departments.map((d) => {
        const active = selectedIds.has(d.id);
        return (
          <button
            key={d.id}
            onClick={() => toggle(d.id)}
            aria-pressed={active}
            className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: active ? 'var(--seq-worked)' : 'var(--surface)',
              color: active ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            {d.name}
          </button>
        );
      })}
      <button
        onClick={() => onChange(new Set(departments.map((d) => d.id)))}
        className="text-xs underline"
        style={{ color: 'var(--text-muted)' }}
      >
        All
      </button>
      <button
        onClick={() => onChange(new Set())}
        className="text-xs underline"
        style={{ color: 'var(--text-muted)' }}
      >
        None
      </button>
    </div>
  );
}

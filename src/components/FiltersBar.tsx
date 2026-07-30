import { EmploymentFilter, SortMode } from '@/lib/sorting';

type ViewMode = 'cards' | 'list';

interface FiltersBarProps {
  employmentFilter: EmploymentFilter;
  onEmploymentFilterChange: (v: EmploymentFilter) => void;
  sortMode: SortMode;
  onSortModeChange: (v: SortMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

const EMPLOYMENT_OPTIONS: { value: EmploymentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'casual', label: 'Casual' },
  { value: 'contract', label: 'Contract' },
];

export function FiltersBar({
  employmentFilter,
  onEmploymentFilterChange,
  sortMode,
  onSortModeChange,
  viewMode,
  onViewModeChange,
}: FiltersBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <SegmentedControl
          label="Type"
          value={employmentFilter}
          options={EMPLOYMENT_OPTIONS}
          onChange={onEmploymentFilterChange}
        />

        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sort
          <select
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as SortMode)}
            className="rounded-md border px-2 py-1 text-sm"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <option value="risk">Most over first</option>
            <option value="name">Alphabetical</option>
          </select>
        </label>
      </div>

      <SegmentedControl
        label="View"
        value={viewMode}
        options={[
          { value: 'cards', label: 'Cards' },
          { value: 'list', label: 'List' },
        ]}
        onChange={onViewModeChange}
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      <span className="hidden sm:inline">{label}</span>
      <div
        className="inline-flex overflow-hidden rounded-md border"
        style={{ borderColor: 'var(--border)' }}
        role="group"
        aria-label={label}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? 'var(--seq-worked)' : 'var(--surface)',
                color: active ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

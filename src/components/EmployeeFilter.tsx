interface EmployeeOption {
  employeeId: number;
  employeeName: string;
}

interface EmployeeFilterProps {
  options: EmployeeOption[];
  selectedEmployeeId: number | null;
  onChange: (employeeId: number | null) => void;
}

export function EmployeeFilter({ options, selectedEmployeeId, onChange }: EmployeeFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      Employee
      <select
        value={selectedEmployeeId ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-md border px-2 py-1 text-sm"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <option value="">All employees ({options.length})</option>
        {options.map((o) => (
          <option key={o.employeeId} value={o.employeeId}>
            {o.employeeName}
          </option>
        ))}
      </select>
    </label>
  );
}

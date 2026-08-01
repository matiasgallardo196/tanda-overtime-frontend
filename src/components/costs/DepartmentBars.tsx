'use client';

import { DepartmentCost } from '@/lib/types';
import { money } from '@/lib/money';

interface Props {
  departments: DepartmentCost[];
}

/** Horizontal bars: FY-to-date wage cost per department, highest first. */
export function DepartmentBars({ departments }: Props) {
  if (departments.length === 0) return null;
  const max = Math.max(...departments.map((d) => d.cost));

  return (
    <div className="flex flex-col gap-2">
      {departments.map((d) => (
        <div key={d.department} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 sm:grid-cols-[10rem_1fr_auto]">
          <span className="truncate text-sm" title={d.department}>
            {d.department}
          </span>
          <div className="h-4 rounded-r" style={{ backgroundColor: 'var(--seq-track)' }}>
            <div
              className="h-4 rounded-r"
              style={{
                width: `${Math.max(1, (d.cost / max) * 100)}%`,
                backgroundColor: 'var(--seq-worked)',
              }}
            />
          </div>
          <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {money(d.cost)} <span style={{ color: 'var(--text-muted)' }}>({d.hours.toFixed(0)}h)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

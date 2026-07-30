import Link from 'next/link';
import { OvertimeSummary } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { EmploymentBadge } from './EmploymentBadge';
import { HoursMeter } from './HoursMeter';

export function EmployeeCard({
  summary,
  weekOffset = 0,
}: {
  summary: OvertimeSummary;
  weekOffset?: number;
}) {
  const href =
    weekOffset === 0
      ? `/employees/${summary.employeeId}`
      : `/employees/${summary.employeeId}?weekOffset=${weekOffset}`;

  return (
    <Link
      href={href}
      className="block rounded-xl border p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{summary.employeeName}</h3>
          <EmploymentBadge type={summary.employmentType} overtimeGroup={summary.overtimeGroup} />
        </div>
        <StatusBadge status={summary.status} />
      </div>

      <HoursMeter
        workedHours={summary.workedHours}
        remainingHours={summary.remainingRosteredHours}
        weeklyLimitHours={summary.weeklyLimitHours}
      />

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm tabular-nums">
        <div>
          <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>Worked</dt>
          <dd className="font-semibold">{summary.workedHours}h</dd>
        </div>
        <div>
          <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining</dt>
          <dd className="font-semibold">{summary.remainingRosteredHours}h</dd>
        </div>
        <div>
          <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>Projected</dt>
          <dd className="font-semibold">{summary.projectedTotalHours}h</dd>
        </div>
      </dl>

      {summary.exceedsLimit && (
        <p className="mt-2 text-xs font-medium" style={{ color: 'var(--status-critical)' }}>
          Over the limit by {summary.exceedsByHours}h
        </p>
      )}
    </Link>
  );
}

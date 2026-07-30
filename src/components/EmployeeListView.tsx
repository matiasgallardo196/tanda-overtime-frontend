import Link from 'next/link';
import { OvertimeSummary } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { EmploymentBadge } from './EmploymentBadge';
import { HoursMeter } from './HoursMeter';

export function EmployeeListView({
  summaries,
  weekOffset = 0,
}: {
  summaries: OvertimeSummary[];
  weekOffset?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr
            className="border-b text-left text-xs uppercase tracking-wide"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <th className="px-3 py-2 font-medium">Employee</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Weekly progress</th>
            <th className="px-3 py-2 text-right font-medium">Worked</th>
            <th className="px-3 py-2 text-right font-medium">Remaining</th>
            <th className="px-3 py-2 text-right font-medium">Projected</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => {
            const href =
              weekOffset === 0
                ? `/employees/${s.employeeId}`
                : `/employees/${s.employeeId}?weekOffset=${weekOffset}`;
            return (
              <tr
                key={s.employeeId}
                className="border-b last:border-0 transition-colors hover:brightness-95 dark:hover:brightness-110"
                style={{ borderColor: 'var(--gridline)' }}
              >
                <td className="px-3 py-2.5">
                  <Link
                    href={href}
                    className="flex flex-wrap items-center gap-2 font-medium hover:underline"
                  >
                    {s.employeeName}
                    <EmploymentBadge type={s.employmentType} overtimeGroup={s.overtimeGroup} />
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="w-48">
                    <HoursMeter
                      workedHours={s.workedHours}
                      remainingHours={s.remainingRosteredHours}
                      weeklyLimitHours={s.weeklyLimitHours}
                      compact
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.workedHours}h</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.remainingRosteredHours}h</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {s.projectedTotalHours}h
                  {s.exceedsLimit && (
                    <span className="ml-1 text-xs font-normal" style={{ color: 'var(--status-critical)' }}>
                      (+{s.exceedsByHours}h)
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          {summaries.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                No employees match the current filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

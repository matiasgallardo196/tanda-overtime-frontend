'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOvertimeCheck, ApiError } from '@/lib/api';
import { OvertimeCheck } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { EmploymentBadge } from '@/components/EmploymentBadge';
import { HoursMeter } from '@/components/HoursMeter';
import { WeeklyLimitControl } from '@/components/WeeklyLimitControl';
import { WeekNav } from '@/components/WeekNav';
import { ErrorBanner } from '@/components/StateBanners';
import { formatDateDMY } from '@/lib/dateFormat';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const employeeId = Number(params.id);

  const [weeklyLimitHours, setWeeklyLimitHours] = useState(38);
  const [weekOffset, setWeekOffset] = useState(() => {
    const raw = searchParams.get('weekOffset');
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const [data, setData] = useState<OvertimeCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(employeeId)) return;
    let cancelled = false;
    setError(null);
    getOvertimeCheck(employeeId, weeklyLimitHours, weekOffset)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId, weeklyLimitHours, weekOffset]);

  const backHref = weekOffset === 0 ? '/' : `/?weekOffset=${weekOffset}`;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <Link href={backHref} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        &larr; Back to overview
      </Link>

      <div className="mt-4">
        <WeekNav
          payrollWeek={data?.payrollWeek ?? null}
          weekOffset={weekOffset}
          onChange={setWeekOffset}
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && !data && (
        <div
          className="mt-4 h-64 animate-pulse rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        />
      )}

      {data && (
        <>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">{data.employeeName}</h1>
                <EmploymentBadge type={data.employmentType} overtimeGroup={data.overtimeGroup} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Payroll week: {data.payrollWeek.start} to {data.payrollWeek.end}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <WeeklyLimitControl value={weeklyLimitHours} onChange={setWeeklyLimitHours} />
              <StatusBadge status={data.status} />
            </div>
          </div>

          <section
            className="mt-5 rounded-xl border p-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <HoursMeter
              workedHours={data.workedHours}
              remainingHours={data.remainingRosteredHours}
              weeklyLimitHours={data.weeklyLimitHours}
            />

            <dl className="mt-4 grid grid-cols-2 gap-3 text-center text-sm tabular-nums sm:grid-cols-4">
              <Stat label="Worked" value={`${data.workedHours}h`} />
              <Stat label="Remaining" value={`${data.remainingRosteredHours}h`} />
              <Stat label="Projected" value={`${data.projectedTotalHours}h`} />
              <Stat
                label={data.exceedsLimit ? 'Overage' : 'Margin'}
                value={`${data.exceedsLimit ? data.exceedsByHours : (data.weeklyLimitHours - data.projectedTotalHours).toFixed(2)}h`}
                emphasis={data.exceedsLimit ? 'critical' : undefined}
              />
            </dl>
          </section>

          <section className="mt-6">
            <h2 className="mb-2 text-base font-semibold">Shift-by-shift detail</h2>
            <div
              className="overflow-x-auto rounded-xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr
                    className="border-b text-left text-xs uppercase tracking-wide"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Start</th>
                    <th className="px-3 py-2 font-medium">End</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 text-right font-medium">Paid break</th>
                    <th className="px-3 py-2 text-right font-medium">Unpaid break</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {data.breakdown.map((entry, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0"
                      style={{ borderColor: 'var(--gridline)' }}
                    >
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">{formatDateDMY(entry.date)}</td>
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                        {formatTime(entry.start)}
                      </td>
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                        {formatTime(entry.finish)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor:
                              entry.type === 'worked' ? 'var(--seq-worked)' : 'var(--seq-remaining)',
                            color: entry.type === 'worked' ? '#ffffff' : '#0b0b0b',
                          }}
                        >
                          {entry.type === 'worked' ? 'Worked' : 'Remaining'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{entry.paidBreakMinutes}m</td>
                      <td className="px-3 py-2 text-right tabular-nums">{entry.unpaidBreakMinutes}m</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">{entry.hours}h</td>
                    </tr>
                  ))}
                  {data.breakdown.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                        No shifts in this payroll week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: 'critical';
}) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </dt>
      <dd
        className="text-lg font-semibold"
        style={{ color: emphasis === 'critical' ? 'var(--status-critical)' : undefined }}
      >
        {value}
      </dd>
    </div>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

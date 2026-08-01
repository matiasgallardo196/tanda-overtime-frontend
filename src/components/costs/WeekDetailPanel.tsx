'use client';

import { useEffect, useState } from 'react';
import { getWeekCostDetail, ApiError } from '@/lib/api';
import { WeekCostDetail } from '@/lib/types';
import { money, moneyExact } from '@/lib/money';
import { formatDateDMY } from '@/lib/dateFormat';
import { ErrorBanner } from '@/components/StateBanners';

interface Props {
  weekStart: string;
}

/**
 * Drill-down for one payroll week: actual vs roster (planned) cost per
 * department, daily distribution and cost per employee.
 */
export function WeekDetailPanel({ weekStart }: Props) {
  const [detail, setDetail] = useState<WeekCostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    getWeekCostDetail(weekStart)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  if (error) return <ErrorBanner message={error} />;
  if (!detail) {
    return (
      <div
        className="h-48 animate-pulse rounded-xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      />
    );
  }

  const variance = detail.actualCost - detail.rosterCost;
  const allDepts = new Map<string, { actual: number; roster: number }>();
  for (const d of detail.actualByDepartment) {
    allDepts.set(d.department, { actual: d.cost, roster: 0 });
  }
  for (const d of detail.rosterByDepartment) {
    const row = allDepts.get(d.department) ?? { actual: 0, roster: 0 };
    row.roster = d.cost;
    allDepts.set(d.department, row);
  }
  const deptRows = Array.from(allDepts, ([name, v]) => ({ name, ...v, diff: v.actual - v.roster })).sort(
    (a, b) => b.actual - a.actual,
  );

  const maxDay = Math.max(...detail.byDay.map((d) => d.cost), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* headline actual vs roster */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <div style={{ color: 'var(--text-secondary)' }}>Actual (timesheets)</div>
          <div className="text-lg font-bold tabular-nums">
            {money(detail.actualCost)}{' '}
            <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
              {detail.actualHours.toFixed(1)}h
            </span>
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)' }}>Rostered (planned)</div>
          <div className="text-lg font-bold tabular-nums">
            {money(detail.rosterCost)}{' '}
            <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
              {detail.rosterHours.toFixed(1)}h
            </span>
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)' }}>Variance</div>
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: variance > 0 ? 'var(--status-critical)' : 'var(--status-good)' }}
          >
            {variance > 0 ? '+' : ''}
            {money(variance)}
          </div>
        </div>
      </div>

      {/* daily mini bars */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Cost per day</h3>
        <div className="grid grid-cols-7 gap-2">
          {detail.byDay.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <div className="flex h-20 w-full items-end rounded" style={{ backgroundColor: 'var(--seq-track)' }}>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(2, (d.cost / maxDay) * 100)}%`,
                    backgroundColor: 'var(--seq-worked)',
                  }}
                  title={`${formatDateDMY(d.date)}: ${moneyExact(d.cost)} (${d.hours.toFixed(1)}h)`}
                />
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {formatDateDMY(d.date).slice(-4, -1)}
              </span>
              <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {money(d.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* dept table */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Actual vs roster by department</h3>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <th className="px-2 py-2 text-left font-medium">Department</th>
                  <th className="px-2 py-2 text-right font-medium">Actual</th>
                  <th className="px-2 py-2 text-right font-medium">Roster</th>
                  <th className="px-2 py-2 text-right font-medium">Diff</th>
                </tr>
              </thead>
              <tbody>
                {deptRows.map((d) => (
                  <tr key={d.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-2 py-1.5">{d.name}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{money(d.actual)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {money(d.roster)}
                    </td>
                    <td
                      className="px-2 py-1.5 text-right tabular-nums"
                      style={{
                        color:
                          d.diff > 0
                            ? 'var(--status-critical)'
                            : d.diff < 0
                              ? 'var(--status-good)'
                              : 'var(--text-muted)',
                      }}
                    >
                      {d.diff > 0 ? '+' : ''}
                      {money(d.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* employee table */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Cost per employee</h3>
          <div
            className="max-h-80 overflow-y-auto rounded-lg border"
            style={{ borderColor: 'var(--border)' }}
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface)' }}>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <th className="px-3 py-2 text-left font-medium">Employee</th>
                  <th className="px-3 py-2 text-right font-medium">Hours</th>
                  <th className="px-3 py-2 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {detail.byEmployee.map((e) => (
                  <tr key={e.employeeId} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3 py-1.5">{e.employeeName}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {e.hours.toFixed(1)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{moneyExact(e.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

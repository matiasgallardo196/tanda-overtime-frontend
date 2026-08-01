'use client';

import { useEffect, useState } from 'react';
import { getCostsSummary, ApiError } from '@/lib/api';
import { BudgetConfig, CostsSummary } from '@/lib/types';
import { money } from '@/lib/money';
import { formatDateDMY } from '@/lib/dateFormat';
import { ErrorBanner } from '@/components/StateBanners';
import { Modal } from '@/components/Modal';
import { WeeklyCostChart } from '@/components/costs/WeeklyCostChart';
import { BurnUpChart } from '@/components/costs/BurnUpChart';
import { DepartmentBars } from '@/components/costs/DepartmentBars';
import { WeekDetailPanel } from '@/components/costs/WeekDetailPanel';
import { BudgetForm } from '@/components/costs/BudgetForm';

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  under: { text: 'On track', color: 'var(--status-good)' },
  tight: { text: 'Tight', color: 'var(--status-warning)' },
  over: { text: 'Over budget', color: 'var(--status-critical)' },
};

export default function CostsPage() {
  const [summary, setSummary] = useState<CostsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getCostsSummary()
      .then((s) => {
        if (cancelled) return;
        setSummary(s);
        // Default the drill-down to the current (last) week.
        setSelectedWeek((prev) => prev ?? s.weeks[s.weeks.length - 1]?.weekStart ?? null);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleBudgetSaved = (_saved: BudgetConfig) => {
    setEditingBudget(false);
    setRefreshKey((k) => k + 1);
  };

  const tracking = summary?.tracking ?? null;
  const statusInfo = tracking ? STATUS_LABEL[tracking.status] : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Costs & Budget</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Wage cost (no on-costs) per payroll week vs. the fiscal-year budget.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEditingBudget(true)}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            {summary?.budget ? 'Edit budget' : 'Set budget'}
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            Refresh
          </button>
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && !summary && (
        <div
          className="h-96 animate-pulse rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        />
      )}

      {summary && (
        <div className="flex flex-col gap-6">
          {/* hero tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label={`Spent FY to date (${formatDateDMY(summary.fyStart).slice(0, 5)} onwards)`}
              value={money(summary.fyToDateCost)}
              hint={`${summary.fyToDateHours.toFixed(0)} hours worked`}
            />
            {tracking && summary.budget ? (
              <>
                <StatTile
                  label="Projected total (budget period)"
                  value={money(tracking.projectedTotal)}
                  hint={`run rate ${money(tracking.runRateWeekly)}/week over ${tracking.runRateWeeksUsed} complete weeks`}
                />
                <StatTile
                  label="Headroom vs budget"
                  value={`${tracking.headroom < 0 ? '-' : ''}${money(Math.abs(tracking.headroom))}`}
                  hint={statusInfo?.text ?? ''}
                  accentColor={statusInfo?.color}
                />
                <StatTile
                  label="Weekly cap to stay on budget"
                  value={money(tracking.weeklyCapRemaining)}
                  hint={`${tracking.weeksRemaining.toFixed(1)} weeks remaining`}
                />
              </>
            ) : (
              <div
                className="col-span-2 flex items-center rounded-xl border p-4 text-sm lg:col-span-3"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                No budget configured yet - set one to unlock the projection, the weekly cap and the
                burn-up chart.
              </div>
            )}
          </div>

          {/* weekly bars */}
          <section
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="mb-1 text-base font-semibold">Weekly wage cost</h2>
            <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Payroll weeks (Tue-Mon) since the fiscal year started. Red = closed week over the cap.
              Click a bar to drill down.
            </p>
            <WeeklyCostChart
              weeks={summary.weeks}
              weeklyCap={tracking?.weeklyCapRemaining ?? null}
              selectedWeekStart={selectedWeek}
              onSelectWeek={setSelectedWeek}
            />
          </section>

          {/* burn-up */}
          {summary.budget && tracking && (
            <section
              className="rounded-xl border p-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="mb-1 text-base font-semibold">Budget burn-up</h2>
              <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Cumulative spend inside the budget period ({formatDateDMY(summary.budget.startDate)} to{' '}
                {formatDateDMY(summary.budget.endDate)}) and where the current run rate lands.
              </p>
              <BurnUpChart budget={summary.budget} tracking={tracking} weeks={summary.weeks} today={summary.today} />
            </section>
          )}

          {/* dept totals + week drilldown */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <section
              className="rounded-xl border p-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="mb-3 text-base font-semibold">FY to date by department</h2>
              <DepartmentBars departments={summary.departmentTotals} />
            </section>

            <section
              className="rounded-xl border p-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Week drill-down</h2>
                <select
                  value={selectedWeek ?? ''}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="rounded-md border px-2 py-1 text-sm"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                >
                  {summary.weeks
                    .slice()
                    .reverse()
                    .map((w) => (
                      <option key={w.weekStart} value={w.weekStart}>
                        {formatDateDMY(w.weekStart).slice(0, 10)} - {formatDateDMY(w.weekEnd).slice(0, 10)}
                        {w.complete ? '' : ' (in progress)'}
                      </option>
                    ))}
                </select>
              </div>
              {selectedWeek && <WeekDetailPanel weekStart={selectedWeek} />}
            </section>
          </div>
        </div>
      )}

      {editingBudget && (
        <Modal onClose={() => setEditingBudget(false)}>
          <BudgetForm
            current={summary?.budget ?? null}
            onSaved={handleBudgetSaved}
            onCancel={() => setEditingBudget(false)}
          />
        </Modal>
      )}
    </main>
  );
}

function StatTile({
  label,
  value,
  hint,
  accentColor,
}: {
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-xs" style={{ color: accentColor ?? 'var(--text-muted)' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

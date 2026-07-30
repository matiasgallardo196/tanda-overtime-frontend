'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOvertimeOverview, ApiError } from '@/lib/api';
import { OvertimeSummary } from '@/lib/types';
import { EmploymentFilter, SortMode, filterSummaries, sortSummaries } from '@/lib/sorting';
import { EmployeeCard } from '@/components/EmployeeCard';
import { EmployeeListView } from '@/components/EmployeeListView';
import { WeeklyLimitControl } from '@/components/WeeklyLimitControl';
import { FiltersBar } from '@/components/FiltersBar';
import { WeekNav } from '@/components/WeekNav';
import { LoadingGrid, ErrorBanner } from '@/components/StateBanners';

type ViewMode = 'cards' | 'list';

export default function OverviewPage() {
  const [weeklyLimitHours, setWeeklyLimitHours] = useState(38);
  const [weekOffset, setWeekOffset] = useState(0);
  const [summaries, setSummaries] = useState<OvertimeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('risk');

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getOvertimeOverview(weeklyLimitHours, weekOffset)
      .then((data) => {
        if (!cancelled) setSummaries(data);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [weeklyLimitHours, weekOffset, refreshKey]);

  const visibleSummaries = useMemo(() => {
    if (!summaries) return [];
    return sortSummaries(filterSummaries(summaries, employmentFilter), sortMode);
  }, [summaries, employmentFilter, sortMode]);

  const exceedsCount = summaries?.filter((s) => s.status === 'exceeds').length ?? 0;
  const warningCount = summaries?.filter((s) => s.status === 'warning').length ?? 0;
  const payrollWeek = summaries?.[0]?.payrollWeek ?? null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Overtime Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Royal Hotel Moree - payroll week (Tuesday to Monday) - limit {weeklyLimitHours}h
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WeekNav payrollWeek={payrollWeek} weekOffset={weekOffset} onChange={setWeekOffset} />
          <WeeklyLimitControl value={weeklyLimitHours} onChange={setWeeklyLimitHours} />
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            Refresh
          </button>
        </div>
      </header>

      {summaries && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          <span>
            {visibleSummaries.length} of {summaries.length} employees
          </span>
          {exceedsCount > 0 && (
            <span className="font-semibold" style={{ color: 'var(--status-critical)' }}>
              {exceedsCount} over the limit
            </span>
          )}
          {warningCount > 0 && (
            <span className="font-semibold" style={{ color: '#b98400' }}>
              {warningCount} near the limit
            </span>
          )}
        </div>
      )}

      {summaries && (
        <FiltersBar
          employmentFilter={employmentFilter}
          onEmploymentFilterChange={setEmploymentFilter}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {error && <ErrorBanner message={error} />}
      {!error && !summaries && <LoadingGrid />}

      {summaries && viewMode === 'cards' && visibleSummaries.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSummaries.map((s) => (
            <EmployeeCard key={s.employeeId} summary={s} weekOffset={weekOffset} />
          ))}
        </div>
      )}

      {summaries && viewMode === 'cards' && visibleSummaries.length === 0 && !error && (
        <p style={{ color: 'var(--text-secondary)' }}>No employees match the current filter.</p>
      )}

      {summaries && viewMode === 'list' && (
        <EmployeeListView summaries={visibleSummaries} weekOffset={weekOffset} />
      )}
    </main>
  );
}

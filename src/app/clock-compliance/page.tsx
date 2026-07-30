'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClockCompliance, getDepartments, ApiError } from '@/lib/api';
import { ClockComplianceEntry, Department } from '@/lib/types';
import { getPayrollWeek } from '@/lib/payrollWeek';
import { WeekNav } from '@/components/WeekNav';
import { DayScopeSelector } from '@/components/DayScopeSelector';
import { DepartmentFilter } from '@/components/DepartmentFilter';
import { EmployeeFilter } from '@/components/EmployeeFilter';
import { ToleranceControl } from '@/components/ToleranceControl';
import { ClockComplianceTable } from '@/components/ClockComplianceTable';
import { ErrorBanner } from '@/components/StateBanners';

export default function ClockCompliancePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toleranceMinutes, setToleranceMinutes] = useState(1);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(true);

  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<number>>(new Set());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [entries, setEntries] = useState<ClockComplianceEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getDepartments()
      .then((depts) => {
        setDepartments(depts);
        setSelectedDepartmentIds(new Set(depts.map((d) => d.id)));
      })
      .catch((err: ApiError) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getClockCompliance(weekOffset, selectedDate, toleranceMinutes)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [weekOffset, selectedDate, toleranceMinutes, refreshKey]);

  const payrollWeek = useMemo(() => getPayrollWeek(weekOffset), [weekOffset]);

  // Entries within the current department scope (independent of the employee
  // pick and the flagged toggle) - this is what feeds the employee dropdown,
  // so it only lists people actually rostered/working in the departments
  // currently selected (e.g. only cleaners when "Cleaning" is the only
  // department checked).
  const departmentScopedEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => selectedDepartmentIds.has(e.departmentId));
  }, [entries, selectedDepartmentIds]);

  const employeeOptions = useMemo(() => {
    const byId = new Map<number, string>();
    for (const e of departmentScopedEntries) byId.set(e.employeeId, e.employeeName);
    return Array.from(byId, ([employeeId, employeeName]) => ({ employeeId, employeeName })).sort(
      (a, b) => a.employeeName.localeCompare(b.employeeName, 'en'),
    );
  }, [departmentScopedEntries]);

  // If the selected employee falls out of scope (department filter changed,
  // or the payroll week/day changed and they have no shifts here anymore),
  // reset back to "All employees" instead of silently showing an empty table.
  useEffect(() => {
    if (selectedEmployeeId !== null && !employeeOptions.some((o) => o.employeeId === selectedEmployeeId)) {
      setSelectedEmployeeId(null);
    }
  }, [employeeOptions, selectedEmployeeId]);

  const visibleEntries = useMemo(() => {
    return departmentScopedEntries.filter((e) => {
      if (selectedEmployeeId !== null && e.employeeId !== selectedEmployeeId) return false;
      if (showOnlyFlagged && !e.flagged) return false;
      return true;
    });
  }, [departmentScopedEntries, selectedEmployeeId, showOnlyFlagged]);

  const flaggedCount = entries?.filter((e) => e.flagged).length ?? 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Clock Compliance</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Shifts clocked in early or clocked out late vs. the roster. Late arrivals and early
            departures are not flagged.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WeekNav
            payrollWeek={payrollWeek}
            weekOffset={weekOffset}
            onChange={(v) => {
              setWeekOffset(v);
              setSelectedDate(null);
            }}
          />
          <ToleranceControl value={toleranceMinutes} onChange={setToleranceMinutes} />
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="mb-4">
        <DayScopeSelector
          payrollWeek={payrollWeek}
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />
      </div>

      {departments && (
        <div className="mb-4">
          <DepartmentFilter
            departments={departments}
            selectedIds={selectedDepartmentIds}
            onChange={setSelectedDepartmentIds}
          />
        </div>
      )}

      <div className="mb-4">
        <EmployeeFilter
          options={employeeOptions}
          selectedEmployeeId={selectedEmployeeId}
          onChange={setSelectedEmployeeId}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyFlagged}
            onChange={(e) => setShowOnlyFlagged(e.target.checked)}
          />
          Show only flagged
        </label>
        {entries && (
          <span className="tabular-nums">
            {visibleEntries.length} shown - {flaggedCount} flagged out of {entries.length} total
          </span>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {!error && !entries && (
        <div
          className="h-64 animate-pulse rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        />
      )}

      {entries && <ClockComplianceTable entries={visibleEntries} />}
    </main>
  );
}

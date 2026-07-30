import { EmploymentType, OvertimeSummary } from './types';

export type SortMode = 'risk' | 'name';
export type EmploymentFilter = 'all' | EmploymentType;

export function filterSummaries(
  summaries: OvertimeSummary[],
  employmentFilter: EmploymentFilter,
): OvertimeSummary[] {
  if (employmentFilter === 'all') return summaries;
  return summaries.filter((s) => s.overtimeGroup === employmentFilter);
}

export function sortSummaries(
  summaries: OvertimeSummary[],
  sortMode: SortMode,
): OvertimeSummary[] {
  const copy = [...summaries];
  if (sortMode === 'name') {
    copy.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'en'));
  } else {
    // 'risk': most over the limit first (the backend already returns it sorted this way, we keep the same criterion)
    copy.sort((a, b) => b.projectedTotalHours - a.projectedTotalHours);
  }
  return copy;
}

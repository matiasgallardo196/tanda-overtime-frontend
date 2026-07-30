import { EmploymentType } from '@/lib/types';

export function EmploymentBadge({
  type,
  overtimeGroup,
}: {
  type: EmploymentType;
  /** When it differs from `type`, shows a "Paid OT" hint (contract employee grouped with casuals because they're paid overtime directly instead of banking TOIL). */
  overtimeGroup?: EmploymentType;
}) {
  const label = type === 'contract' ? 'Contract' : 'Casual';
  const showPaidOtHint = overtimeGroup !== undefined && overtimeGroup !== type;

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      {showPaidOtHint && (
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: 'var(--seq-remaining)', color: '#0b0b0b' }}
          title="Contract employee paid overtime directly (no TOIL) - grouped with casuals in the filter"
        >
          Paid OT
        </span>
      )}
    </span>
  );
}

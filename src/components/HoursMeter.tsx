interface HoursMeterProps {
  workedHours: number;
  remainingHours: number;
  weeklyLimitHours: number;
  /** Compact version with no legend, for list-view rows */
  compact?: boolean;
}

/**
 * Hours bar: worked (solid blue) + remaining rostered (light blue), with a
 * vertical mark at the weekly limit. The "remaining" portion that falls past
 * the limit is painted red (critical status) to flag that part of the roster
 * as pushing into overtime.
 */
export function HoursMeter({
  workedHours,
  remainingHours,
  weeklyLimitHours,
  compact = false,
}: HoursMeterProps) {
  const projected = workedHours + remainingHours;
  const scaleMax = Math.max(projected, weeklyLimitHours) * 1.05 || 1;

  const workedPct = (workedHours / scaleMax) * 100;
  const remainingBeforeLimit = Math.max(
    0,
    Math.min(remainingHours, weeklyLimitHours - workedHours),
  );
  const remainingAfterLimit = remainingHours - remainingBeforeLimit;
  const remainingBeforePct = (remainingBeforeLimit / scaleMax) * 100;
  const remainingAfterPct = (remainingAfterLimit / scaleMax) * 100;
  const limitPct = (weeklyLimitHours / scaleMax) * 100;
  const barHeight = compact ? 'h-2' : 'h-3';

  return (
    <div className="w-full">
      <div
        className={`relative ${barHeight} w-full overflow-visible rounded-full`}
        style={{ backgroundColor: 'var(--seq-track)' }}
        role="img"
        aria-label={`${workedHours} hours worked, ${remainingHours} hours remaining rostered, limit ${weeklyLimitHours} hours`}
      >
        <div className="absolute inset-0 flex items-center gap-[2px] px-0">
          {workedPct > 0 && (
            <div
              className={`${barHeight} rounded-full`}
              style={{ width: `${workedPct}%`, backgroundColor: 'var(--seq-worked)' }}
            />
          )}
          {remainingBeforePct > 0 && (
            <div
              className={`${barHeight} rounded-full`}
              style={{ width: `${remainingBeforePct}%`, backgroundColor: 'var(--seq-remaining)' }}
            />
          )}
          {remainingAfterPct > 0 && (
            <div
              className={`${barHeight} rounded-full`}
              style={{ width: `${remainingAfterPct}%`, backgroundColor: 'var(--status-critical)' }}
            />
          )}
        </div>

        {/* weekly limit mark (no repeated text: the limit is already shown once above) */}
        <div
          className="absolute top-[-3px] h-[18px] w-[2px]"
          style={{ left: `${Math.min(limitPct, 100)}%`, backgroundColor: 'var(--text-muted)' }}
          title={`Limit: ${weeklyLimitHours}h`}
        />
      </div>

      {!compact && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <LegendDot color="var(--seq-worked)" label="Worked" />
          <LegendDot color="var(--seq-remaining)" label="Remaining rostered" />
          {remainingAfterPct > 0 && (
            <LegendDot color="var(--status-critical)" label="Remaining hours over the limit" />
          )}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

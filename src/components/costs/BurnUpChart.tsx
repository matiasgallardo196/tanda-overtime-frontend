'use client';

import { BudgetConfig, BudgetTracking, WeeklyCost } from '@/lib/types';
import { money } from '@/lib/money';

interface Props {
  budget: BudgetConfig;
  tracking: BudgetTracking;
  weeks: WeeklyCost[];
  today: string;
}

const W = 760;
const H = 240;
const PAD_L = 28;
const PAD_R = 118;
const PAD_T = 20;
const PAD_B = 28;

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/**
 * Cumulative spend inside the budget period (solid) plus the projection to
 * the period end at the current run rate (dashed), against the budget total.
 */
export function BurnUpChart({ budget, tracking, weeks, today }: Props) {
  const startN = dayNumber(budget.startDate);
  const endN = dayNumber(budget.endDate);
  const todayN = Math.min(dayNumber(today), endN);
  const span = Math.max(1, endN - startN);

  // Cumulative actual points: one per payroll week end (only weeks that
  // overlap the budget period), clamped to the period.
  let cumulative = 0;
  const points: { day: number; value: number }[] = [{ day: startN, value: 0 }];
  for (const w of weeks) {
    const weekEndN = dayNumber(w.weekEnd);
    if (weekEndN < startN) continue;
    cumulative += w.cost;
    points.push({ day: Math.min(weekEndN, todayN), value: cumulative });
  }
  // Ensure the line reaches "today" with the tracked in-period spend.
  points.push({ day: todayN, value: tracking.spentInPeriod });
  points.sort((a, b) => a.day - b.day);
  // De-duplicate days keeping the max value (weeks may clamp onto today).
  const cleaned: { day: number; value: number }[] = [];
  for (const p of points) {
    const last = cleaned[cleaned.length - 1];
    if (last && last.day === p.day) last.value = Math.max(last.value, p.value);
    else cleaned.push({ ...p });
  }

  const maxY = Math.max(budget.totalBudget, tracking.projectedTotal) * 1.06;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const xFor = (day: number) => PAD_L + ((day - startN) / span) * plotW;
  const yFor = (value: number) => PAD_T + plotH * (1 - value / maxY);

  const actualPath = cleaned
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(p.day).toFixed(1)},${yFor(p.value).toFixed(1)}`)
    .join(' ');

  const projPath = `M${xFor(todayN).toFixed(1)},${yFor(tracking.spentInPeriod).toFixed(1)} L${xFor(endN).toFixed(1)},${yFor(tracking.projectedTotal).toFixed(1)}`;

  const budgetY = yFor(budget.totalBudget);
  const overBudget = tracking.projectedTotal > budget.totalBudget;

  // Month tick marks along the x axis.
  const ticks: { day: number; label: string }[] = [];
  {
    const [sy, sm] = budget.startDate.split('-').map(Number);
    let y = sy;
    let m = sm;
    for (let i = 0; i < 14; i++) {
      const iso = `${y}-${String(m).padStart(2, '0')}-01`;
      const n = dayNumber(iso);
      if (n > endN) break;
      if (n >= startN) {
        ticks.push({
          day: n,
          label: new Date(y, m - 1, 1).toLocaleDateString('en-AU', { month: 'short' }),
        });
      }
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} role="img" aria-label="Cumulative spend vs budget" style={{ display: 'block', maxWidth: '100%' }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD_L} x2={W - PAD_R} y1={yFor(maxY * f)} y2={yFor(maxY * f)} stroke="var(--gridline)" strokeWidth={1} />
        ))}

        {ticks.map((t) => (
          <text key={t.day} x={xFor(t.day)} y={H - 8} fontSize={10} fill="var(--text-secondary)" textAnchor="middle">
            {t.label}
          </text>
        ))}

        {/* budget line */}
        <line x1={PAD_L} x2={W - PAD_R} y1={budgetY} y2={budgetY} stroke={overBudget ? 'var(--status-critical)' : 'var(--status-good)'} strokeWidth={2} />
        <text x={W - PAD_R + 6} y={budgetY + 4} fontSize={10} fill="var(--text-secondary)" className="tabular-nums">
          budget {money(budget.totalBudget)}
        </text>

        {/* projection (dashed) */}
        <path d={projPath} fill="none" stroke={overBudget ? 'var(--status-critical)' : 'var(--seq-remaining)'} strokeWidth={2} strokeDasharray="6 4" />
        <text
          x={W - PAD_R + 6}
          y={Math.min(yFor(tracking.projectedTotal) + 4, budgetY - 8)}
          fontSize={10}
          fill="var(--text-secondary)"
          className="tabular-nums"
        >
          proj. {money(tracking.projectedTotal)}
        </text>

        {/* actual cumulative */}
        <path d={actualPath} fill="none" stroke="var(--seq-worked)" strokeWidth={2} />
        <circle cx={xFor(todayN)} cy={yFor(tracking.spentInPeriod)} r={4} fill="var(--seq-worked)" stroke="var(--surface)" strokeWidth={2} />

        {/* today marker */}
        <line x1={xFor(todayN)} x2={xFor(todayN)} y1={PAD_T} y2={H - PAD_B} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="2 3" />
        <text x={xFor(todayN)} y={PAD_T - 6} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
          today
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4" style={{ backgroundColor: 'var(--seq-worked)' }} /> Actual spend
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, ${overBudget ? 'var(--status-critical)' : 'var(--seq-remaining)'} 0 4px, transparent 4px 7px)`,
            }}
          />
          Projection (run rate)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4" style={{ backgroundColor: overBudget ? 'var(--status-critical)' : 'var(--status-good)' }} /> Budget
        </span>
      </div>
    </div>
  );
}

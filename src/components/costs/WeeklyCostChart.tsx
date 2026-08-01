'use client';

import { useState } from 'react';
import { WeeklyCost } from '@/lib/types';
import { money } from '@/lib/money';

interface Props {
  weeks: WeeklyCost[];
  /** Weekly cap to stay on budget - drawn as a dashed reference line. */
  weeklyCap: number | null;
  selectedWeekStart: string | null;
  onSelectWeek: (weekStart: string) => void;
}

const CHART_HEIGHT = 220;
const TOP_PAD = 24;
const BOTTOM_PAD = 34;
const BAR_GAP = 8;
const MIN_BAR_WIDTH = 28;
const MAX_BAR_WIDTH = 72;

/** Weekly wage cost bars vs. the budget cap line. Click a bar to drill down. */
export function WeeklyCostChart({ weeks, weeklyCap, selectedWeekStart, onSelectWeek }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (weeks.length === 0) return null;

  const maxValue = Math.max(...weeks.map((w) => w.cost), weeklyCap ?? 0) * 1.08;
  const plotHeight = CHART_HEIGHT - TOP_PAD - BOTTOM_PAD;
  const barWidth = Math.max(MIN_BAR_WIDTH, Math.min(MAX_BAR_WIDTH, 640 / weeks.length - BAR_GAP));
  const CAP_LABEL_RESERVE = 92;
  const chartWidth = weeks.length * (barWidth + BAR_GAP) + BAR_GAP + CAP_LABEL_RESERVE;

  const yFor = (value: number) => TOP_PAD + plotHeight * (1 - value / maxValue);

  return (
    <div className="overflow-x-auto">
      <svg
        width={chartWidth}
        height={CHART_HEIGHT}
        role="img"
        aria-label="Weekly wage cost per payroll week"
        style={{ display: 'block' }}
      >
        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={chartWidth}
            y1={yFor(maxValue * f)}
            y2={yFor(maxValue * f)}
            stroke="var(--gridline)"
            strokeWidth={1}
          />
        ))}

        {weeks.map((w, i) => {
          const x = BAR_GAP + i * (barWidth + BAR_GAP);
          const h = Math.max(2, (w.cost / maxValue) * plotHeight);
          const y = TOP_PAD + plotHeight - h;
          const overCap = weeklyCap !== null && w.complete && w.cost > weeklyCap;
          const fill = overCap
            ? 'var(--status-critical)'
            : w.complete
              ? 'var(--seq-worked)'
              : 'var(--seq-remaining)';
          const isSelected = w.weekStart === selectedWeekStart;
          const label = w.weekStart.slice(5).replace('-', '/');

          return (
            <g
              key={w.weekStart}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectWeek(w.weekStart)}
              style={{ cursor: 'pointer' }}
            >
              {/* hit target wider than the bar */}
              <rect x={x - BAR_GAP / 2} y={0} width={barWidth + BAR_GAP} height={CHART_HEIGHT} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={4}
                fill={fill}
                stroke={isSelected ? 'var(--foreground)' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              {/* square off the bottom corners: bars sit on the baseline */}
              <rect x={x} y={TOP_PAD + plotHeight - Math.min(4, h)} width={barWidth} height={Math.min(4, h)} fill={fill} />
              {(hovered === i || isSelected) && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--foreground)"
                  className="tabular-nums"
                >
                  {money(w.cost)}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT - BOTTOM_PAD + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-secondary)"
              >
                {label}
              </text>
              {!w.complete && (
                <text
                  x={x + barWidth / 2}
                  y={CHART_HEIGHT - BOTTOM_PAD + 28}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--text-muted)"
                >
                  in progress
                </text>
              )}
              {w.partial && (
                <text
                  x={x + barWidth / 2}
                  y={CHART_HEIGHT - BOTTOM_PAD + 28}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--text-muted)"
                >
                  partial FY
                </text>
              )}
            </g>
          );
        })}

        {/* cap line above the bars so it stays visible */}
        {weeklyCap !== null && weeklyCap <= maxValue && (
          <g>
            <line
              x1={0}
              x2={chartWidth - CAP_LABEL_RESERVE + 4}
              y1={yFor(weeklyCap)}
              y2={yFor(weeklyCap)}
              stroke="var(--status-warning)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <text
              x={chartWidth - CAP_LABEL_RESERVE + 8}
              y={yFor(weeklyCap) + 4}
              fontSize={10}
              fill="var(--text-secondary)"
              className="tabular-nums"
            >
              cap {money(weeklyCap)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

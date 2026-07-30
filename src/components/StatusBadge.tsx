import { OvertimeStatus } from '@/lib/types';

const CONFIG: Record<
  OvertimeStatus,
  { label: string; bg: string; fg: string; icon: React.ReactNode }
> = {
  ok: {
    label: 'On track',
    bg: 'var(--status-good)',
    fg: '#ffffff',
    icon: (
      <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  warning: {
    label: 'Near limit',
    bg: 'var(--status-warning)',
    fg: '#1a1a1a',
    icon: (
      <path
        d="M10 3.5l7.5 13H2.5L10 3.5z M10 8.5v3.5 M10 14.5h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  exceeds: {
    label: 'Over limit',
    bg: 'var(--status-critical)',
    fg: '#ffffff',
    icon: (
      <path
        d="M6.5 6.5l7 7m0-7l-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
};

export function StatusBadge({ status }: { status: OvertimeStatus }) {
  const cfg = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
        {cfg.icon}
      </svg>
      {cfg.label}
    </span>
  );
}

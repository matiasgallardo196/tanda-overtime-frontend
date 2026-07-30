import { ClockComplianceEntry } from '@/lib/types';
import { formatDateDMY } from '@/lib/dateFormat';

export function ClockComplianceTable({ entries }: { entries: ClockComplianceEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr
            className="border-b text-left text-xs uppercase tracking-wide"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <th className="px-3 py-2 font-medium">Employee</th>
            <th className="px-3 py-2 font-medium">Department</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Scheduled</th>
            <th className="px-3 py-2 font-medium">Actual</th>
            <th className="px-3 py-2 text-right font-medium">Early clock-in</th>
            <th className="px-3 py-2 text-right font-medium">Late clock-out</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr
              key={i}
              className="border-b last:border-0"
              style={{ borderColor: 'var(--gridline)' }}
            >
              <td className="px-3 py-2.5 font-medium whitespace-nowrap">{e.employeeName}</td>
              <td className="px-3 py-2.5 whitespace-nowrap">{e.departmentName}</td>
              <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{formatDateDMY(e.date)}</td>
              <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">
                {formatTime(e.scheduledStart)} - {formatTime(e.scheduledFinish)}
              </td>
              <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">
                {formatTime(e.actualStart)} - {e.actualFinish ? formatTime(e.actualFinish) : 'still clocked in'}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {e.earlyClockInMinutes > 0 ? (
                  <span style={{ color: 'var(--status-critical)' }}>{e.earlyClockInMinutes}m</span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {e.lateClockOutMinutes > 0 ? (
                  <span style={{ color: 'var(--status-critical)' }}>
                    {e.lateClockOutMinutes}m{e.inProgress ? ' (ongoing)' : ''}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {e.flagged ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: 'var(--status-critical)', color: '#ffffff' }}
                  >
                    Flagged
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: 'var(--status-good)', color: '#ffffff' }}
                  >
                    OK
                  </span>
                )}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                No shifts match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

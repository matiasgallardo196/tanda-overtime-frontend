'use client';

import { useState } from 'react';
import { Alert } from '@/lib/types';
import { previewAlert, sendTestAlert, ApiError } from '@/lib/api';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CHANNEL_LABELS: Record<string, string> = { email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS' };

interface AlertCardProps {
  alert: Alert;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AlertCard({ alert, onToggle, onEdit, onDelete }: AlertCardProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<'test' | 'preview' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleTest = async () => {
    setBusy('test');
    setMessage(null);
    try {
      await sendTestAlert(alert.id);
      setMessage('Test sent.');
    } catch (err) {
      setMessage(`Failed: ${(err as ApiError).message}`);
    } finally {
      setBusy(null);
    }
  };

  const handlePreview = async () => {
    if (preview !== null) {
      setPreview(null);
      return;
    }
    setBusy('preview');
    try {
      const report = await previewAlert(alert.id);
      setPreview(report.text);
    } catch (err) {
      setMessage(`Failed: ${(err as ApiError).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums">{alert.schedule.time}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {alert.schedule.timezone}
            </span>
          </div>
          <p className="text-sm font-medium">{alert.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: alert.schedule.daysOfWeek.includes(i)
                    ? 'var(--seq-worked)'
                    : 'transparent',
                  color: alert.schedule.daysOfWeek.includes(i) ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={alert.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ backgroundColor: alert.enabled ? 'var(--status-good)' : 'var(--gridline)' }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
              style={{ transform: alert.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>To: {alert.recipient.name}</span>
        {alert.recipient.channels.map((c) => (
          <span
            key={c.type}
            className="rounded-full border px-2 py-0.5"
            style={{ borderColor: 'var(--border)' }}
          >
            {CHANNEL_LABELS[c.type]}: {c.destination}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {alert.overtime.enabled && (
          <span className="rounded-full border px-2 py-0.5" style={{ borderColor: 'var(--border)' }}>
            Overtime &gt; {alert.overtime.thresholdHours}h
          </span>
        )}
        {alert.clockCompliance.enabled && (
          <span className="rounded-full border px-2 py-0.5" style={{ borderColor: 'var(--border)' }}>
            Clock compliance (yesterday)
          </span>
        )}
        {alert.lastSentDate && <span>Last sent: {alert.lastSentDate}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onEdit}
          className="rounded-md border px-3 py-1.5 text-xs font-medium"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          Edit
        </button>
        <button
          onClick={handlePreview}
          disabled={busy === 'preview'}
          className="rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          {preview !== null ? 'Hide preview' : busy === 'preview' ? 'Loading...' : 'Preview'}
        </button>
        <button
          onClick={handleTest}
          disabled={busy === 'test'}
          className="rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          {busy === 'test' ? 'Sending...' : 'Send test now'}
        </button>
        <button
          onClick={onDelete}
          className="rounded-md border px-3 py-1.5 text-xs font-medium"
          style={{ borderColor: 'var(--status-critical)', color: 'var(--status-critical)' }}
        >
          Delete
        </button>
      </div>

      {message && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}

      {preview !== null && (
        <pre
          className="mt-3 overflow-x-auto rounded-lg border p-3 text-xs whitespace-pre-wrap"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          {preview}
        </pre>
      )}
    </div>
  );
}

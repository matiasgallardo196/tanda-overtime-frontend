'use client';

import { useState } from 'react';
import { AlertInput, Department, Employee } from '@/lib/types';
import { DayOfWeekPicker } from './DayOfWeekPicker';
import { MultiSelectScope } from './MultiSelectScope';
import { ChannelEditor } from './ChannelEditor';

const AUSTRALIAN_TIMEZONES = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Adelaide',
  'Australia/Perth',
  'Australia/Darwin',
  'Australia/Hobart',
];

const DEFAULT_ALERT: AlertInput = {
  name: '',
  enabled: true,
  schedule: { time: '08:00', timezone: 'Australia/Sydney', daysOfWeek: [1, 2, 3, 4, 5, 6, 0] },
  overtime: { enabled: true, thresholdHours: 38, departmentIds: null, employeeIds: null },
  clockCompliance: { enabled: true, toleranceMinutes: 1, departmentIds: null, employeeIds: null },
  recipient: { name: '', channels: [] },
};

interface AlertFormProps {
  initial: AlertInput | null;
  departments: Department[];
  employees: Employee[];
  onSave: (input: AlertInput) => Promise<void>;
  onCancel: () => void;
}

export function AlertForm({ initial, departments, employees, onSave, onCancel }: AlertFormProps) {
  const [form, setForm] = useState<AlertInput>(initial ?? DEFAULT_ALERT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeOptions = employees.map((e) => ({ id: e.id, name: e.name }));
  const departmentOptions = departments.map((d) => ({ id: d.id, name: d.name }));

  const canSave =
    form.name.trim().length > 0 &&
    form.recipient.name.trim().length > 0 &&
    form.recipient.channels.length > 0 &&
    form.schedule.daysOfWeek.length > 0 &&
    (form.overtime.enabled || form.clockCompliance.enabled);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="mb-4 text-lg font-semibold">{initial ? 'Edit alert' : 'New alert'}</h2>

      <div className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Daily manager digest"
            className="w-full max-w-sm rounded-md border px-2 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
          />
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Schedule
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              Time
              <input
                type="time"
                value={form.schedule.time}
                onChange={(e) =>
                  setForm({ ...form, schedule: { ...form.schedule, time: e.target.value } })
                }
                className="rounded-md border px-2 py-1 text-sm tabular-nums"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              Timezone
              <select
                value={form.schedule.timezone}
                onChange={(e) =>
                  setForm({ ...form, schedule: { ...form.schedule, timezone: e.target.value } })
                }
                className="rounded-md border px-2 py-1 text-sm"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
              >
                {AUSTRALIAN_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3">
            <DayOfWeekPicker
              value={form.schedule.daysOfWeek}
              onChange={(daysOfWeek) => setForm({ ...form, schedule: { ...form.schedule, daysOfWeek } })}
            />
          </div>
        </section>

        <section className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.overtime.enabled}
              onChange={(e) =>
                setForm({ ...form, overtime: { ...form.overtime, enabled: e.target.checked } })
              }
            />
            Overtime section - employees projected over a weekly limit
          </label>
          {form.overtime.enabled && (
            <div className="space-y-3 pl-6">
              <label className="flex items-center gap-2 text-sm">
                Threshold (hrs)
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.overtime.thresholdHours}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      overtime: { ...form.overtime, thresholdHours: Number(e.target.value) },
                    })
                  }
                  className="w-20 rounded-md border px-2 py-1 text-sm tabular-nums"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                />
              </label>
              <MultiSelectScope
                label="Departments"
                options={departmentOptions}
                value={form.overtime.departmentIds}
                onChange={(departmentIds) =>
                  setForm({ ...form, overtime: { ...form.overtime, departmentIds } })
                }
              />
              <MultiSelectScope
                label="Employees"
                options={employeeOptions}
                value={form.overtime.employeeIds}
                onChange={(employeeIds) =>
                  setForm({ ...form, overtime: { ...form.overtime, employeeIds } })
                }
              />
            </div>
          )}
        </section>

        <section className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.clockCompliance.enabled}
              onChange={(e) =>
                setForm({
                  ...form,
                  clockCompliance: { ...form.clockCompliance, enabled: e.target.checked },
                })
              }
            />
            Clock compliance section - yesterday&apos;s early clock-ins / late clock-outs
          </label>
          {form.clockCompliance.enabled && (
            <div className="space-y-3 pl-6">
              <label className="flex items-center gap-2 text-sm">
                Tolerance (min)
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.clockCompliance.toleranceMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      clockCompliance: {
                        ...form.clockCompliance,
                        toleranceMinutes: Number(e.target.value),
                      },
                    })
                  }
                  className="w-20 rounded-md border px-2 py-1 text-sm tabular-nums"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                />
              </label>
              <MultiSelectScope
                label="Departments"
                options={departmentOptions}
                value={form.clockCompliance.departmentIds}
                onChange={(departmentIds) =>
                  setForm({ ...form, clockCompliance: { ...form.clockCompliance, departmentIds } })
                }
              />
              <MultiSelectScope
                label="Employees"
                options={employeeOptions}
                value={form.clockCompliance.employeeIds}
                onChange={(employeeIds) =>
                  setForm({ ...form, clockCompliance: { ...form.clockCompliance, employeeIds } })
                }
              />
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Recipient
          </h3>
          <input
            type="text"
            value={form.recipient.name}
            onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, name: e.target.value } })}
            placeholder="Recipient name (e.g. Store Manager)"
            className="mb-3 w-full max-w-sm rounded-md border px-2 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
          />
          <ChannelEditor
            channels={form.recipient.channels}
            onChange={(channels) => setForm({ ...form, recipient: { ...form.recipient, channels } })}
          />
        </section>
      </div>

      {error && (
        <p className="mt-4 text-sm" style={{ color: 'var(--status-critical)' }}>
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: 'var(--seq-worked)', color: '#ffffff' }}
        >
          {saving ? 'Saving...' : 'Save alert'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

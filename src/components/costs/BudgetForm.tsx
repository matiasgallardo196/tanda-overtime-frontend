'use client';

import { useState } from 'react';
import { BudgetConfig, BudgetInput } from '@/lib/types';
import { updateBudget, ApiError } from '@/lib/api';

interface Props {
  current: BudgetConfig | null;
  onSaved: (saved: BudgetConfig) => void;
  onCancel: () => void;
}

export function BudgetForm({ current, onSaved, onCancel }: Props) {
  const [totalBudget, setTotalBudget] = useState<string>(current ? String(current.totalBudget) : '');
  const [startDate, setStartDate] = useState<string>(current?.startDate ?? '');
  const [endDate, setEndDate] = useState<string>(current?.endDate ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = Number(totalBudget);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Budget must be a positive number');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }
    setSaving(true);
    try {
      const input: BudgetInput = { totalBudget: amount, startDate, endDate };
      const saved = await updateBudget(input);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
  } as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="mb-1 text-lg font-bold">Budget</h2>
      <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Total wage budget (no on-costs) and the period it covers. The weekly cap and the projection
        are derived from this.
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium">Total budget (AUD)</span>
        <input
          type="number"
          min={1}
          step="0.01"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          className="w-full rounded-md border px-2 py-1.5 text-sm tabular-nums"
          style={inputStyle}
        />
      </label>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border px-2 py-1.5 text-sm"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border px-2 py-1.5 text-sm"
            style={inputStyle}
          />
        </label>
      </div>

      {error && (
        <p className="mb-3 text-sm" style={{ color: 'var(--status-critical)' }}>
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-3 py-1.5 text-sm font-medium"
          style={{ borderColor: 'var(--border)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--seq-worked)', color: '#ffffff' }}
        >
          {saving ? 'Saving...' : 'Save budget'}
        </button>
      </div>
    </form>
  );
}

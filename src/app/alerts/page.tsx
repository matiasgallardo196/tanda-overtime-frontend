'use client';

import { useEffect, useState } from 'react';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getDepartments,
  getEmployees,
  ApiError,
} from '@/lib/api';
import { Alert, AlertInput, Department, Employee } from '@/lib/types';
import { AlertCard } from '@/components/AlertCard';
import { AlertForm } from '@/components/AlertForm';
import { ErrorBanner } from '@/components/StateBanners';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Alert | 'new' | null>(null);

  const reload = () => {
    getAlerts()
      .then(setAlerts)
      .catch((err: ApiError) => setError(err.message));
  };

  useEffect(() => {
    reload();
    getDepartments().then(setDepartments).catch(() => {});
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const handleSave = async (input: AlertInput) => {
    if (editing === 'new') {
      await createAlert(input);
    } else if (editing) {
      await updateAlert(editing.id, input);
    }
    setEditing(null);
    reload();
  };

  const handleToggle = async (alert: Alert, enabled: boolean) => {
    await updateAlert(alert.id, { enabled });
    reload();
  };

  const handleDelete = async (alert: Alert) => {
    if (!confirm(`Delete alert "${alert.name}"?`)) return;
    await deleteAlert(alert.id);
    reload();
  };

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Alerts &amp; Reports</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Scheduled digests, like alarms - each one can go to a different person, with its own
            content, filters and channels.
          </p>
        </div>
        {editing === null && (
          <button
            onClick={() => setEditing('new')}
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--seq-worked)', color: '#ffffff' }}
          >
            + New alert
          </button>
        )}
      </header>

      {error && <ErrorBanner message={error} />}

      {editing !== null && (
        <div className="mb-6">
          <AlertForm
            initial={editing === 'new' ? null : toAlertInput(editing)}
            departments={departments}
            employees={employees}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {!alerts && !error && (
        <div
          className="h-40 animate-pulse rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        />
      )}

      {alerts && alerts.length === 0 && editing === null && (
        <p style={{ color: 'var(--text-secondary)' }}>
          No alerts yet. Create one to start receiving scheduled reports.
        </p>
      )}

      <div className="space-y-4">
        {alerts?.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onToggle={(enabled) => handleToggle(alert, enabled)}
            onEdit={() => setEditing(alert)}
            onDelete={() => handleDelete(alert)}
          />
        ))}
      </div>
    </main>
  );
}

function toAlertInput(alert: Alert): AlertInput {
  const { id, lastSentDate, createdAt, updatedAt, ...input } = alert;
  return input;
}

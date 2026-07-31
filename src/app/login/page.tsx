'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, ApiError } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      const from = searchParams.get('from') || '/';
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border p-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h1 className="mb-1 text-lg font-bold">Tanda Overtime Dashboard</h1>
        <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in to continue
        </p>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            className="w-full rounded-md border px-2 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border px-2 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
          />
        </label>

        {error && (
          <p className="mb-4 text-sm" style={{ color: 'var(--status-critical)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !username || !password}
          className="w-full rounded-md py-2 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--seq-worked)', color: '#ffffff' }}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

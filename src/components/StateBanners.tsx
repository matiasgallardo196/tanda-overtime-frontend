export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        />
      ))}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border px-4 py-3 text-sm"
      style={{
        borderColor: 'var(--status-critical)',
        color: 'var(--status-critical)',
        backgroundColor: 'var(--surface)',
      }}
    >
      {message}
    </div>
  );
}

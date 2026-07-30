/** Formats a yyyy-MM-dd date string as dd/MM/yyyy plus a weekday hint, e.g. "28/07/2026 (Tue)". */
export function formatDateDMY(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'short' });
  return `${dd}/${mm}/${y} (${weekday})`;
}

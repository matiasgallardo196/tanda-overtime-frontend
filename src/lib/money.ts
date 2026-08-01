const aud0 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const aud2 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "$24,584" - for headline/chart numbers. */
export function money(n: number): string {
  return aud0.format(n);
}

/** "$24,583.87" - for table cells where cents matter. */
export function moneyExact(n: number): string {
  return aud2.format(n);
}

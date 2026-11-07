export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const text = body.replace(/\s+/g, '');
  return Math.max(1, Math.round(text.length / 400));
}

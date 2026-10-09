export function epochProgress(start: number, end: number, now: number): number | null {
  if (![start, end, now].every(Number.isFinite) || end <= start) return null
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
}

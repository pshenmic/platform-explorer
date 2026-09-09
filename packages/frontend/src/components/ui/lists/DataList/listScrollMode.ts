export type ListScrollMode = 'continuous' | 'pages'

const PREFIX = 'pe:list-scroll:'

export function readListScrollMode(
  key: string,
  fallback: ListScrollMode = 'continuous'
): ListScrollMode {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(`${PREFIX}${key}`)
    if (value === 'pages' || value === 'continuous') return value
  } catch {
    /* ignore */
  }
  return fallback
}

export function writeListScrollMode(key: string, mode: ListScrollMode) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, mode)
  } catch {
    /* ignore */
  }
}
